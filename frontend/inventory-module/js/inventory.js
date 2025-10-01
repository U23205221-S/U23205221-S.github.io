/**
 * Inventory Module - Unified Materials Management
 * Handles unified inventory with checkbox filtering for prefabricated and custom materials
 */

window.inventoryModule = {
    materials: [],
    filteredMaterials: [],
    showPrefabricated: true,
    showCustom: true,
    
    init: async function(data) {
        console.log('Inventory module initialized');
        await this.loadInventory();
        this.setupEventListeners();
        this.renderInventory();
        this.updateStats();
        this.updateUserInfo();
        this.loadSupplierOptions();
    },

    loadInventory: async function() {
        let materials = window.MobiliAriState.getState('materials');

        if (!materials || materials.length === 0) {
            materials = this.getDefaultMaterials();
            window.MobiliAriState.updateState('materials', materials);
        }

        this.materials = materials;
        this.filteredMaterials = [...this.materials];
    },

    getDefaultMaterials: function() {
        return [
            {
                id: 'MAT-001',
                materialName: 'Tablero MDF 18mm',
                category: 'prefabricated',
                currentStock: 50,
                minStock: 10,
                unit: 'm²',
                materialType: 'Madera procesada',
                status: 'Disponible',
                cost: 25.50,
                supplier: 'Maderas del Norte',
                description: 'Tablero MDF de 18mm de espesor para muebles',
                lastUpdated: '2025-01-15'
            },
            {
                id: 'MAT-002',
                materialName: 'Melamina Blanca 15mm',
                category: 'prefabricated',
                currentStock: 8,
                minStock: 15,
                unit: 'm²',
                materialType: 'Tablero melamínico',
                status: 'Bajo inventario',
                cost: 32.00,
                supplier: 'Tableros SA',
                description: 'Tablero melaminico blanco de 15mm',
                lastUpdated: '2025-01-14'
            },
            {
                id: 'MAT-003',
                materialName: 'Bisagras de Piano',
                category: 'prefabricated',
                currentStock: 0,
                minStock: 20,
                unit: 'pcs',
                materialType: 'Herraje',
                status: 'Agotado',
                cost: 8.75,
                supplier: 'Herrajes Premium',
                description: 'Bisagras de piano para puertas de muebles',
                lastUpdated: '2025-01-10'
            },
            {
                id: 'MAT-004',
                materialName: 'Madera de Roble Natural',
                category: 'custom',
                currentStock: 25,
                minStock: 5,
                unit: 'm³',
                materialType: 'Madera maciza',
                status: 'Disponible',
                cost: 850.00,
                supplier: 'Maderas Selectas',
                description: 'Madera de roble natural para muebles personalizados',
                lastUpdated: '2025-01-16'
            },
            {
                id: 'MAT-005',
                materialName: 'Barniz Poliuretano',
                category: 'custom',
                currentStock: 12,
                minStock: 8,
                unit: 'L',
                materialType: 'Acabado',
                status: 'Disponible',
                cost: 45.00,
                supplier: 'Pinturas Industriales',
                description: 'Barniz poliuretano para acabados de alta calidad',
                lastUpdated: '2025-01-13'
            },
            {
                id: 'MAT-006',
                materialName: 'Cedro Hondureño',
                category: 'custom',
                currentStock: 3,
                minStock: 8,
                unit: 'm³',
                materialType: 'Madera maciza',
                status: 'Bajo inventario',
                cost: 1200.00,
                supplier: 'Maderas Exóticas',
                description: 'Madera de cedro hondureño para proyectos especiales',
                lastUpdated: '2025-01-12'
            }
        ];
    },

    setupEventListeners: function() {
        // Navigation
        const navLinks = document.querySelectorAll('[data-module]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                              e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'inventory') {
                    this.navigateToModule(module);
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtnMgmt');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Material buttons
        const newMaterialBtn = document.getElementById('newMaterialBtn');
        const createMaterialBtn = document.getElementById('createMaterialBtn');

        if (newMaterialBtn) {
            newMaterialBtn.addEventListener('click', () => {
                this.showNewMaterialModal();
            });
        }

        if (createMaterialBtn) {
            createMaterialBtn.addEventListener('click', () => {
                this.createNewMaterial();
            });
        }

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const materialSearch = document.getElementById('materialSearch');
        const supplierFilter = document.getElementById('supplierFilter');
        const sortBy = document.getElementById('sortBy');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (materialSearch) {
            materialSearch.addEventListener('input', () => this.applyFilters());
        }
        if (supplierFilter) {
            supplierFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }

        // Category checkboxes - CORE FUNCTIONALITY
        const showPrefabricated = document.getElementById('showPrefabricated');
        const showCustom = document.getElementById('showCustom');

        if (showPrefabricated) {
            showPrefabricated.addEventListener('change', (e) => {
                this.showPrefabricated = e.target.checked;
                this.applyFilters();
            });
        }

        if (showCustom) {
            showCustom.addEventListener('change', (e) => {
                this.showCustom = e.target.checked;
                this.applyFilters();
            });
        }

        // State updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'materials') {
                this.materials = event.detail.value;
                this.applyFilters();
            }
        });
    },

    applyFilters: function() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const materialSearch = document.getElementById('materialSearch')?.value.toLowerCase() || '';
        const supplierFilter = document.getElementById('supplierFilter')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'material';

        this.filteredMaterials = this.materials.filter(material => {
            // Category filter based on checkboxes
            const categoryMatch = (this.showPrefabricated && material.category === 'prefabricated') ||
                                 (this.showCustom && material.category === 'custom');
            
            if (!categoryMatch) return false;

            // Other filters
            const statusMatch = !statusFilter || material.status === statusFilter;
            const searchMatch = !materialSearch || 
                material.materialName.toLowerCase().includes(materialSearch) ||
                material.materialType.toLowerCase().includes(materialSearch);
            const supplierMatch = !supplierFilter || material.supplier === supplierFilter;

            return statusMatch && searchMatch && supplierMatch;
        });

        this.sortMaterials(sortBy);
        this.renderInventory();
        this.updateStats();
    },

    sortMaterials: function(sortBy) {
        this.filteredMaterials.sort((a, b) => {
            switch (sortBy) {
                case 'material':
                    return a.materialName.localeCompare(b.materialName);
                case 'quantity':
                    return b.currentStock - a.currentStock;
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'value':
                    return (b.currentStock * b.cost) - (a.currentStock * a.cost);
                default:
                    return 0;
            }
        });
    },

    renderInventory: function() {
        const tableBody = document.getElementById('materialsTableBody');
        if (!tableBody) return;

        if (this.filteredMaterials.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-4">
                        <i class="bi bi-inbox text-muted display-4 d-block mb-2"></i>
                        No se encontraron materiales
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredMaterials.map(material => `
            <tr>
                <td><strong>${material.materialName}</strong></td>
                <td>
                    <span class="badge bg-${material.category === 'prefabricated' ? 'primary' : 'success'}">
                        ${material.category === 'prefabricated' ? 'Prefabricado' : 'Personalizado'}
                    </span>
                </td>
                <td>${material.currentStock} ${material.unit}</td>
                <td>${material.minStock} ${material.unit}</td>
                <td>${material.materialType}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(material.status)}">
                        ${material.status}
                    </span>
                </td>
                <td>$${material.cost.toFixed(2)}</td>
                <td>${material.unit}</td>
                <td>${material.supplier}</td>
                <td>${this.formatDate(material.lastUpdated)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="inventoryModule.showMaterialDetail('${material.id}')" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStats: function() {
        const totalMaterials = this.materials.length;
        const lowStockCount = this.materials.filter(m => m.currentStock <= m.minStock).length;
        const outOfStockCount = this.materials.filter(m => m.currentStock === 0).length;
        const totalValue = this.materials.reduce((sum, m) => sum + (m.currentStock * m.cost), 0);

        document.getElementById('totalMaterials').textContent = totalMaterials;
        document.getElementById('lowStockCount').textContent = lowStockCount;
        document.getElementById('outOfStockCount').textContent = outOfStockCount;
        document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
    },

    showMaterialDetail: function(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;

        const modalContent = document.getElementById('materialModalContent');
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-dark-wood mb-3">Información del Material</h6>
                    <div class="mb-2"><strong>Nombre:</strong> ${material.materialName}</div>
                    <div class="mb-2"><strong>Categoría:</strong> 
                        <span class="badge bg-${material.category === 'prefabricated' ? 'primary' : 'success'}">
                            ${material.category === 'prefabricated' ? 'Prefabricado' : 'Personalizado'}
                        </span>
                    </div>
                    <div class="mb-2"><strong>Tipo:</strong> ${material.materialType}</div>
                    <div class="mb-2"><strong>Estado:</strong> 
                        <span class="badge bg-${this.getStatusColor(material.status)}">${material.status}</span>
                    </div>
                    <div class="mb-2"><strong>Proveedor:</strong> ${material.supplier}</div>
                </div>
                <div class="col-md-6">
                    <h6 class="text-dark-wood mb-3">Stock y Costos</h6>
                    <div class="mb-2"><strong>Stock Actual:</strong> ${material.currentStock} ${material.unit}</div>
                    <div class="mb-2"><strong>Stock Mínimo:</strong> ${material.minStock} ${material.unit}</div>
                    <div class="mb-2"><strong>Costo por Unidad:</strong> $${material.cost.toFixed(2)}</div>
                    <div class="mb-2"><strong>Valor Total:</strong> $${(material.currentStock * material.cost).toFixed(2)}</div>
                    <div class="mb-2"><strong>Última Actualización:</strong> ${this.formatDate(material.lastUpdated)}</div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="text-dark-wood mb-3">Descripción</h6>
                    <p class="bg-light p-3 rounded">${material.description}</p>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('materialModal'));
        modal.show();
    },

    showNewMaterialModal: function() {
        const modal = new bootstrap.Modal(document.getElementById('newMaterialModal'));
        modal.show();
    },

    createNewMaterial: function() {
        const form = document.getElementById('newMaterialForm');
        const formData = new FormData(form);
        
        const material = {
            id: 'MAT-' + String(this.materials.length + 1).padStart(3, '0'),
            materialName: formData.get('materialName'),
            category: formData.get('category'),
            currentStock: parseFloat(formData.get('currentStock')),
            minStock: parseFloat(formData.get('minStock')),
            unit: formData.get('unit'),
            materialType: formData.get('materialType') || 'Sin especificar',
            cost: parseFloat(formData.get('cost')) || 0,
            supplier: formData.get('supplier') || 'Sin especificar',
            status: formData.get('status'),
            description: formData.get('description') || '',
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        this.materials.push(material);
        window.MobiliAriState.updateState('materials', this.materials);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('newMaterialModal'));
        modal.hide();
        
        this.applyFilters();
        this.showAlert('success', 'Material creado exitosamente');
    },

    loadSupplierOptions: function() {
        const supplierFilter = document.getElementById('supplierFilter');
        if (!supplierFilter) return;

        const suppliers = [...new Set(this.materials.map(m => m.supplier))];
        supplierFilter.innerHTML = '<option value="">Todos los proveedores</option>' +
            suppliers.map(supplier => `<option value="${supplier}">${supplier}</option>`).join('');
    },

    getStatusColor: function(status) {
        const colorMap = {
            'Disponible': 'success',
            'Bajo inventario': 'warning',
            'Agotado': 'danger'
        };
        return colorMap[status] || 'secondary';
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    },

    navigateToModule: function(module) {
        window.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { module: module }
        }));
    },

    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    },

    updateUserInfo: function() {
        const currentUser = window.MobiliAriState.currentUser;
        
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.textContent = currentUser.name;
            if (userRole) userRole.textContent = currentUser.role;
        }
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
};

// Initialize module
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.inventoryModule.init();
    });
} else {
    window.inventoryModule.init();
}
