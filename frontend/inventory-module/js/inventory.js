/**
 * Inventory Module
 * Handles inventory management, stock control, and material tracking
 */

window.inventoryModule = {
    inventory: [],
    filteredInventory: [],
    suppliers: [],
    stockHistory: [],
    
    init: function(data) {
        console.log('Inventory module initialized');
        this.loadInventory();
        this.setupEventListeners();
        this.renderInventory();
        this.updateStats();
        this.updateUserInfo();
        this.loadSupplierOptions();
    },

    loadInventory: function() {
        this.inventory = window.MobiliAriState.getState('inventory') || this.getDefaultInventory();
        this.filteredInventory = [...this.inventory];
        this.suppliers = window.MobiliAriState.getState('suppliers') || this.getDefaultSuppliers();
        this.stockHistory = window.MobiliAriState.getState('stockHistory') || [];
        
        // Initialize with default data if empty
        if (window.MobiliAriState.getState('inventory').length === 0) {
            window.MobiliAriState.updateState('inventory', this.inventory);
        }
        if (window.MobiliAriState.getState('suppliers').length === 0) {
            window.MobiliAriState.updateState('suppliers', this.suppliers);
        }
    },

    getDefaultInventory: function() {
        return [
            {
                id: 1,
                material: 'Roble',
                currentQuantity: 45.5,
                unit: 'm²',
                minThreshold: 10,
                pricePerUnit: 850,
                status: 'Disponible',
                supplier: 'Maderas Premium SA',
                lastPurchase: '2025-01-10',
                location: 'Almacén A-1',
                notes: 'Madera de alta calidad para muebles premium'
            },
            {
                id: 2,
                material: 'Pino',
                currentQuantity: 8.2,
                unit: 'm²',
                minThreshold: 15,
                pricePerUnit: 450,
                status: 'Bajo inventario',
                supplier: 'Maderera del Norte',
                lastPurchase: '2025-01-08',
                location: 'Almacén A-2',
                notes: 'Necesita reposición urgente'
            },
            {
                id: 3,
                material: 'MDF',
                currentQuantity: 62.0,
                unit: 'm²',
                minThreshold: 20,
                pricePerUnit: 320,
                status: 'Disponible',
                supplier: 'Tableros Industriales',
                lastPurchase: '2025-01-12',
                location: 'Almacén B-1',
                notes: 'Stock suficiente para el mes'
            },
            {
                id: 4,
                material: 'Cedro',
                currentQuantity: 0,
                unit: 'm²',
                minThreshold: 5,
                pricePerUnit: 1200,
                status: 'Agotado',
                supplier: 'Maderas Finas',
                lastPurchase: '2024-12-20',
                location: 'Almacén A-3',
                notes: 'Pedido pendiente con proveedor'
            },
            {
                id: 5,
                material: 'Tornillería',
                currentQuantity: 850,
                unit: 'pzas',
                minThreshold: 200,
                pricePerUnit: 3.5,
                status: 'Disponible',
                supplier: 'Ferretería Industrial',
                lastPurchase: '2025-01-14',
                location: 'Almacén C-1',
                notes: 'Variedad completa de tornillos y herrajes'
            },
            {
                id: 6,
                material: 'Barniz',
                currentQuantity: 12.5,
                unit: 'lts',
                minThreshold: 10,
                pricePerUnit: 180,
                status: 'Disponible',
                supplier: 'Químicos y Pinturas',
                lastPurchase: '2025-01-11',
                location: 'Almacén D-1',
                notes: 'Barniz mate y brillante disponible'
            }
        ];
    },

    getDefaultSuppliers: function() {
        return [
            'Maderas Premium SA',
            'Maderera del Norte',
            'Tableros Industriales',
            'Maderas Finas',
            'Ferretería Industrial',
            'Químicos y Pinturas'
        ];
    },

    setupEventListeners: function() {
        // Sidebar navigation
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

        // Action buttons
        const newMaterialBtn = document.getElementById('newMaterialBtn');
        const addStockBtn = document.getElementById('addStockBtn');
        const createMaterialBtn = document.getElementById('createMaterialBtn');
        const confirmAddStockBtn = document.getElementById('confirmAddStockBtn');
        const saveMaterialBtn = document.getElementById('saveMaterialBtn');

        if (newMaterialBtn) {
            newMaterialBtn.addEventListener('click', () => {
                this.showNewMaterialModal();
            });
        }

        if (addStockBtn) {
            addStockBtn.addEventListener('click', () => {
                this.showAddStockModal();
            });
        }

        if (createMaterialBtn) {
            createMaterialBtn.addEventListener('click', () => {
                this.createNewMaterial();
            });
        }

        if (confirmAddStockBtn) {
            confirmAddStockBtn.addEventListener('click', () => {
                this.addStock();
            });
        }

        if (saveMaterialBtn) {
            saveMaterialBtn.addEventListener('click', () => {
                this.saveMaterialChanges();
            });
        }
        
        // Modal close buttons
        const closeAddStockModalBtn = document.getElementById('closeAddStockModalBtn');
        const cancelAddStockBtn = document.getElementById('cancelAddStockBtn');
        const closeNewMaterialModalBtn = document.getElementById('closeNewMaterialModalBtn');
        const cancelNewMaterialBtn = document.getElementById('cancelNewMaterialBtn');
        
        if (closeAddStockModalBtn) {
            closeAddStockModalBtn.addEventListener('click', () => {
                this.closeAddStockModal();
            });
        }
        
        if (cancelAddStockBtn) {
            cancelAddStockBtn.addEventListener('click', () => {
                this.closeAddStockModal();
            });
        }
        
        if (closeNewMaterialModalBtn) {
            closeNewMaterialModalBtn.addEventListener('click', () => {
                this.closeNewMaterialModal();
            });
        }
        
        if (cancelNewMaterialBtn) {
            cancelNewMaterialBtn.addEventListener('click', () => {
                this.closeNewMaterialModal();
            });
        }
        
        // Modal backdrop clicks
        const addStockModal = document.getElementById('addStockModal');
        const newMaterialModal = document.getElementById('newMaterialModal');
        
        if (addStockModal) {
            addStockModal.addEventListener('click', (e) => {
                if (e.target === addStockModal) {
                    this.closeAddStockModal();
                }
            });
            
            addStockModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });
        }
        
        if (newMaterialModal) {
            newMaterialModal.addEventListener('click', (e) => {
                if (e.target === newMaterialModal) {
                    this.closeNewMaterialModal();
                }
            });
            
            newMaterialModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
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

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'inventory') {
                this.inventory = event.detail.value;
                this.applyFilters();
                this.updateStats();
            }
        });
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

    applyFilters: function() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const materialSearch = document.getElementById('materialSearch')?.value.toLowerCase() || '';
        const supplierFilter = document.getElementById('supplierFilter')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'material';

        this.filteredInventory = this.inventory.filter(item => {
            const matchesStatus = !statusFilter || item.status === statusFilter;
            const matchesMaterial = !materialSearch || item.material.toLowerCase().includes(materialSearch);
            const matchesSupplier = !supplierFilter || item.supplier === supplierFilter;

            return matchesStatus && matchesMaterial && matchesSupplier;
        });

        // Sort inventory
        this.filteredInventory.sort((a, b) => {
            switch (sortBy) {
                case 'quantity':
                    return b.currentQuantity - a.currentQuantity;
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'value':
                    return (b.currentQuantity * b.pricePerUnit) - (a.currentQuantity * a.pricePerUnit);
                default:
                    return a.material.localeCompare(b.material);
            }
        });

        this.renderInventory();
    },

    renderInventory: function() {
        const tableBody = document.getElementById('inventoryTableBody');
        if (!tableBody) return;

        if (this.filteredInventory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-5">
                        <div class="empty-state">
                            <i class="bi bi-box-seam text-muted"></i>
                            <p>No se encontraron materiales</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredInventory.map(item => `
            <tr class="fade-in">
                <td>
                    <strong>${item.material}</strong>
                    <br><small class="text-muted">${item.location || 'Sin ubicación'}</small>
                </td>
                <td>
                    <div class="quantity-indicator">
                        <span class="fw-bold">${item.currentQuantity}</span>
                        <div class="quantity-bar">
                            <div class="quantity-fill ${this.getQuantityLevel(item)}" 
                                 style="width: ${this.getQuantityPercentage(item)}%"></div>
                        </div>
                    </div>
                </td>
                <td>${item.unit}</td>
                <td class="text-muted">${item.minThreshold}</td>
                <td>$${item.pricePerUnit.toLocaleString()}</td>
                <td class="fw-bold">$${(item.currentQuantity * item.pricePerUnit).toLocaleString()}</td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(item.status)}">
                        ${item.status}
                    </span>
                </td>
                <td>${item.supplier}</td>
                <td>${this.formatDate(item.lastPurchase)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="inventoryModule.showMaterialDetail(${item.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-action btn-add-stock" onclick="inventoryModule.quickAddStock(${item.id})" title="Agregar stock">
                            <i class="bi bi-plus"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="inventoryModule.deleteMaterial(${item.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStats: function() {
        // Total materials
        document.getElementById('totalMaterials').textContent = this.inventory.length;

        // Low stock count
        const lowStockCount = this.inventory.filter(item => 
            item.currentQuantity <= item.minThreshold && item.currentQuantity > 0
        ).length;
        document.getElementById('lowStockCount').textContent = lowStockCount;

        // Out of stock count
        const outOfStockCount = this.inventory.filter(item => 
            item.currentQuantity === 0
        ).length;
        document.getElementById('outOfStockCount').textContent = outOfStockCount;

        // Total value
        const totalValue = this.inventory.reduce((total, item) => 
            total + (item.currentQuantity * item.pricePerUnit), 0
        );
        document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
    },

    showMaterialDetail: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        const modal = document.getElementById('materialModal');
        const modalTitle = document.getElementById('materialModalTitle');
        const modalContent = document.getElementById('materialModalContent');

        modalTitle.textContent = `Material: ${material.material}`;
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="material-detail-section">
                        <h6><i class="bi bi-info-circle me-2"></i>Información General</h6>
                        <div class="detail-item">
                            <span class="detail-label">Material:</span>
                            <input type="text" class="form-control form-control-sm" value="${material.material}" id="editMaterial">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cantidad Actual:</span>
                            <span class="detail-value">${material.currentQuantity} ${material.unit}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cantidad Mínima:</span>
                            <input type="number" class="form-control form-control-sm" value="${material.minThreshold}" id="editMinThreshold">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Precio por Unidad:</span>
                            <input type="number" class="form-control form-control-sm" value="${material.pricePerUnit}" id="editPricePerUnit">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <span class="status-badge status-${this.getStatusClass(material.status)}">${material.status}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="material-detail-section">
                        <h6><i class="bi bi-truck me-2"></i>Información de Proveedor</h6>
                        <div class="detail-item">
                            <span class="detail-label">Proveedor:</span>
                            <select class="form-select form-select-sm" id="editSupplier">
                                ${this.suppliers.map(supplier => 
                                    `<option value="${supplier}" ${supplier === material.supplier ? 'selected' : ''}>${supplier}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Última Compra:</span>
                            <span class="detail-value">${this.formatDate(material.lastPurchase)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ubicación:</span>
                            <input type="text" class="form-control form-control-sm" value="${material.location || ''}" id="editLocation">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Valor Total:</span>
                            <span class="detail-value fw-bold">$${(material.currentQuantity * material.pricePerUnit).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="material-detail-section">
                <h6><i class="bi bi-chat-dots me-2"></i>Notas</h6>
                <textarea class="form-control" rows="3" id="editNotes">${material.notes || ''}</textarea>
            </div>
            
            <div class="material-detail-section">
                <h6><i class="bi bi-clock-history me-2"></i>Historial de Stock</h6>
                <div class="stock-history" id="stockHistoryContainer">
                    ${this.renderStockHistory(materialId)}
                </div>
            </div>
        `;

        // Store current material for saving
        this.currentEditingMaterial = material;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    renderStockHistory: function(materialId) {
        const history = this.stockHistory.filter(h => h.materialId === materialId)
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .slice(0, 10); // Show last 10 entries

        if (history.length === 0) {
            return `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-clock-history display-4 d-block mb-2"></i>
                    <p>No hay historial de movimientos</p>
                </div>
            `;
        }

        return history.map(entry => `
            <div class="history-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="history-action">${entry.action}</div>
                        <div class="history-date">${this.formatDate(entry.date)}</div>
                    </div>
                    <div class="history-quantity">${entry.quantity > 0 ? '+' : ''}${entry.quantity} ${entry.unit}</div>
                </div>
                ${entry.notes ? `<small class="text-muted">${entry.notes}</small>` : ''}
            </div>
        `).join('');
    },

    showNewMaterialModal: function() {
        const modal = document.getElementById('newMaterialModal');
        const form = document.getElementById('newMaterialForm');
        
        // Reset form
        form.reset();

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    showAddStockModal: function() {
        const modal = document.getElementById('addStockModal');
        const form = document.getElementById('addStockForm');
        const materialSelect = form.querySelector('[name="materialId"]');
        
        // Reset form
        form.reset();
        
        // Populate material options
        materialSelect.innerHTML = '<option value="">Seleccionar material...</option>' +
            this.inventory.map(item => 
                `<option value="${item.id}">${item.material} (${item.currentQuantity} ${item.unit})</option>`
            ).join('');

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    closeNewMaterialModal: function() {
        const modal = document.getElementById('newMaterialModal');
        
        try {
            let bsModal = bootstrap.Modal.getInstance(modal);
            
            if (bsModal) {
                bsModal.hide();
            } else {
                bsModal = new bootstrap.Modal(modal);
                bsModal.hide();
            }
            
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
            }, 150);
            
        } catch (error) {
            console.error('Error closing new material modal:', error);
            this.forceCloseModal('newMaterialModal');
        }
        
        // Reset form
        const form = document.getElementById('newMaterialForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de nuevo material cerrado');
    },
    
    closeAddStockModal: function() {
        const modal = document.getElementById('addStockModal');
        
        try {
            let bsModal = bootstrap.Modal.getInstance(modal);
            
            if (bsModal) {
                bsModal.hide();
            } else {
                bsModal = new bootstrap.Modal(modal);
                bsModal.hide();
            }
            
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
            }, 150);
            
        } catch (error) {
            console.error('Error closing add stock modal:', error);
            this.forceCloseModal('addStockModal');
        }
        
        // Reset form
        const form = document.getElementById('addStockForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de agregar stock cerrado');
    },
    
    forceCloseModal: function(modalId) {
        const modal = document.getElementById(modalId);
        
        // Force remove all modal-related elements and classes
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        }
        
        console.log('Modal forzado a cerrar:', modalId);
    },

    createNewMaterial: function() {
        const form = document.getElementById('newMaterialForm');
        const formData = new FormData(form);

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newMaterial = {
            id: Math.max(...this.inventory.map(m => m.id), 0) + 1,
            material: formData.get('material'),
            currentQuantity: parseFloat(formData.get('currentQuantity')),
            unit: formData.get('unit'),
            minThreshold: parseFloat(formData.get('minThreshold')),
            pricePerUnit: parseFloat(formData.get('pricePerUnit')),
            status: this.calculateStatus(parseFloat(formData.get('currentQuantity')), parseFloat(formData.get('minThreshold'))),
            supplier: formData.get('supplier'),
            lastPurchase: new Date().toISOString().split('T')[0],
            location: '',
            notes: 'Material agregado al sistema'
        };

        // Add to inventory
        this.inventory.push(newMaterial);
        window.MobiliAriState.updateState('inventory', this.inventory);

        // Add to stock history
        this.addToStockHistory(newMaterial.id, 'Material creado', newMaterial.currentQuantity, newMaterial.unit, 'Inventario inicial');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newMaterialModal'));
        modal.hide();

        this.showAlert('success', `Material ${newMaterial.material} creado exitosamente`);
    },

    addStock: function() {
        const form = document.getElementById('addStockForm');
        const formData = new FormData(form);

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const materialId = parseInt(formData.get('materialId'));
        const quantity = parseFloat(formData.get('quantity'));
        const pricePerUnit = parseFloat(formData.get('pricePerUnit'));
        const notes = formData.get('notes');

        const materialIndex = this.inventory.findIndex(m => m.id === materialId);
        if (materialIndex !== -1) {
            const material = this.inventory[materialIndex];
            
            // Update quantity
            material.currentQuantity += quantity;
            
            // Update price if provided
            if (pricePerUnit > 0) {
                material.pricePerUnit = pricePerUnit;
            }
            
            // Update status
            material.status = this.calculateStatus(material.currentQuantity, material.minThreshold);
            material.lastPurchase = new Date().toISOString().split('T')[0];

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Add to stock history
            this.addToStockHistory(materialId, 'Stock agregado', quantity, material.unit, notes);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStockModal'));
            modal.hide();

            this.showAlert('success', `Stock agregado exitosamente a ${material.material}`);
        }
    },

    quickAddStock: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        const quantity = prompt(`¿Cuánto stock desea agregar a ${material.material}?`, '10');
        if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
            const materialIndex = this.inventory.findIndex(m => m.id === materialId);
            this.inventory[materialIndex].currentQuantity += parseFloat(quantity);
            this.inventory[materialIndex].status = this.calculateStatus(
                this.inventory[materialIndex].currentQuantity, 
                this.inventory[materialIndex].minThreshold
            );
            this.inventory[materialIndex].lastPurchase = new Date().toISOString().split('T')[0];

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Add to stock history
            this.addToStockHistory(materialId, 'Stock agregado (rápido)', parseFloat(quantity), material.unit, 'Agregado desde tabla');

            this.showAlert('success', `${quantity} ${material.unit} agregados a ${material.material}`);
        }
    },

    saveMaterialChanges: function() {
        if (!this.currentEditingMaterial) return;

        const materialId = this.currentEditingMaterial.id;
        const materialIndex = this.inventory.findIndex(m => m.id === materialId);

        if (materialIndex !== -1) {
            // Get updated values
            this.inventory[materialIndex].material = document.getElementById('editMaterial').value;
            this.inventory[materialIndex].minThreshold = parseFloat(document.getElementById('editMinThreshold').value);
            this.inventory[materialIndex].pricePerUnit = parseFloat(document.getElementById('editPricePerUnit').value);
            this.inventory[materialIndex].supplier = document.getElementById('editSupplier').value;
            this.inventory[materialIndex].location = document.getElementById('editLocation').value;
            this.inventory[materialIndex].notes = document.getElementById('editNotes').value;

            // Recalculate status
            this.inventory[materialIndex].status = this.calculateStatus(
                this.inventory[materialIndex].currentQuantity,
                this.inventory[materialIndex].minThreshold
            );

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('materialModal'));
            modal.hide();

            this.showAlert('success', 'Material actualizado exitosamente');
        }
    },

    deleteMaterial: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        if (confirm(`¿Está seguro de eliminar el material "${material.material}"?`)) {
            this.inventory = this.inventory.filter(m => m.id !== materialId);
            window.MobiliAriState.updateState('inventory', this.inventory);
            this.showAlert('success', `Material ${material.material} eliminado exitosamente`);
        }
    },

    addToStockHistory: function(materialId, action, quantity, unit, notes) {
        if (!this.stockHistory) {
            this.stockHistory = [];
        }

        this.stockHistory.push({
            id: Date.now(),
            materialId: materialId,
            action: action,
            quantity: quantity,
            unit: unit,
            date: new Date().toISOString().split('T')[0],
            notes: notes || ''
        });

        window.MobiliAriState.updateState('stockHistory', this.stockHistory);
    },

    loadSupplierOptions: function() {
        const supplierFilter = document.getElementById('supplierFilter');
        if (supplierFilter) {
            const uniqueSuppliers = [...new Set(this.inventory.map(item => item.supplier))];
            supplierFilter.innerHTML = '<option value="">Todos los proveedores</option>' +
                uniqueSuppliers.map(supplier => 
                    `<option value="${supplier}">${supplier}</option>`
                ).join('');
        }
    },

    updateUserInfo: function() {
        const currentUser = window.MobiliAriState.currentUser;
        
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.textContent = currentUser.name;
            if (userRole) userRole.textContent = currentUser.role;

            // Show admin elements if user is admin OR if no user role is defined (fallback)
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                const shouldShow = !currentUser.role || currentUser.role === 'administrador' || currentUser.role === 'admin';
                el.style.display = shouldShow ? 'block' : 'none';
            });
        } else {
            // If no user, show admin elements by default (development mode)
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
        }
    },

    // Helper functions
    calculateStatus: function(currentQuantity, minThreshold) {
        if (currentQuantity === 0) return 'Agotado';
        if (currentQuantity <= minThreshold) return 'Bajo inventario';
        return 'Disponible';
    },

    getStatusClass: function(status) {
        const statusMap = {
            'Disponible': 'disponible',
            'Bajo inventario': 'bajo',
            'Agotado': 'agotado'
        };
        return statusMap[status] || 'disponible';
    },

    getQuantityLevel: function(item) {
        const percentage = (item.currentQuantity / (item.minThreshold * 3)) * 100;
        if (percentage > 66) return 'high';
        if (percentage > 33) return 'medium';
        return 'low';
    },

    getQuantityPercentage: function(item) {
        const maxQuantity = Math.max(item.minThreshold * 3, item.currentQuantity);
        return Math.min((item.currentQuantity / maxQuantity) * 100, 100);
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

// Initialize module when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.inventoryModule.init();
    });
} else {
    window.inventoryModule.init();
}

// Global emergency function for inventory modals
window.emergencyCloseInventoryModals = function() {
    if (window.inventoryModule) {
        console.log('🚨 Cerrando modales de inventario de emergencia...');
        
        // Try to close using module functions
        try {
            window.inventoryModule.forceCloseModal('newMaterialModal');
            window.inventoryModule.forceCloseModal('addStockModal');
        } catch (error) {
            console.log('Error con funciones del módulo, usando fallback...');
        }
        
        // Fallback emergency close
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade');
        });
        
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        console.log('✅ Modales de inventario cerrados');
    }
};
