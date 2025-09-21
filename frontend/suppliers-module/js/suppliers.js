/**
 * Suppliers Module
 * Handles supplier management, orders, and performance tracking
 */

window.suppliersModule = {
    suppliers: [],
    filteredSuppliers: [],
    supplierOrders: [],
    
    init: function(data) {
        console.log('Suppliers module initialized');
        this.loadSuppliers();
        this.setupEventListeners();
        this.renderSuppliers();
        this.updateStats();
        this.updateUserInfo();
    },

    loadSuppliers: function() {
        this.suppliers = window.MobiliAriState.getState('suppliers') || this.getDefaultSuppliers();
        this.filteredSuppliers = [...this.suppliers];
        this.supplierOrders = window.MobiliAriState.getState('supplierOrders') || [];
        
        if (window.MobiliAriState.getState('suppliers').length === 0) {
            window.MobiliAriState.updateState('suppliers', this.suppliers);
        }
    },

    getDefaultSuppliers: function() {
        return [
            {
                id: 1,
                name: 'Maderas Premium SA',
                contactPerson: 'Carlos Mendoza',
                email: 'carlos@maderaspremium.com',
                phone: '+52 55 1234-5678',
                address: 'Av. Industrial 123, Ciudad de México',
                category: 'Maderas',
                status: 'Activo',
                rating: 4.8,
                totalOrders: 45,
                paymentTerms: 30,
                products: 'Roble, Cedro, Caoba, Pino premium',
                notes: 'Proveedor confiable con excelente calidad',
                lastOrder: '2025-01-10',
                performance: {
                    onTimeDelivery: 95,
                    qualityScore: 4.8,
                    responseTime: 2
                }
            },
            {
                id: 2,
                name: 'Ferretería Industrial',
                contactPerson: 'Ana López',
                email: 'ana@ferreteriaind.com',
                phone: '+52 55 2345-6789',
                address: 'Calle Herrajes 456, Guadalajara',
                category: 'Herrajes',
                status: 'Activo',
                rating: 4.5,
                totalOrders: 32,
                paymentTerms: 15,
                products: 'Tornillería, bisagras, cerraduras, herrajes decorativos',
                notes: 'Amplio catálogo de herrajes',
                lastOrder: '2025-01-14',
                performance: {
                    onTimeDelivery: 88,
                    qualityScore: 4.5,
                    responseTime: 1
                }
            },
            {
                id: 3,
                name: 'Químicos y Pinturas',
                contactPerson: 'Roberto García',
                email: 'roberto@quimicospinturas.com',
                phone: '+52 55 3456-7890',
                address: 'Zona Industrial 789, Monterrey',
                category: 'Químicos',
                status: 'Activo',
                rating: 4.2,
                totalOrders: 28,
                paymentTerms: 45,
                products: 'Barnices, lacas, tintes, selladores',
                notes: 'Especialistas en acabados de madera',
                lastOrder: '2025-01-11',
                performance: {
                    onTimeDelivery: 82,
                    qualityScore: 4.2,
                    responseTime: 3
                }
            },
            {
                id: 4,
                name: 'Tableros Industriales',
                contactPerson: 'María Rodríguez',
                email: 'maria@tablerosindustriales.com',
                phone: '+52 55 4567-8901',
                address: 'Parque Industrial 321, Puebla',
                category: 'Maderas',
                status: 'Inactivo',
                rating: 3.8,
                totalOrders: 15,
                paymentTerms: 30,
                products: 'MDF, Melamina, Triplay, OSB',
                notes: 'Proveedor temporal, evaluar reactivación',
                lastOrder: '2024-12-15',
                performance: {
                    onTimeDelivery: 75,
                    qualityScore: 3.8,
                    responseTime: 4
                }
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
                
                if (module && module !== 'suppliers') {
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
        const newSupplierBtn = document.getElementById('newSupplierBtn');
        const createSupplierBtn = document.getElementById('createSupplierBtn');
        const saveSupplierBtn = document.getElementById('saveSupplierBtn');
        const newOrderBtn = document.getElementById('newOrderBtn');
        const createOrderBtn = document.getElementById('createOrderBtn');

        if (newSupplierBtn) {
            newSupplierBtn.addEventListener('click', () => {
                this.showNewSupplierModal();
            });
        }

        if (createSupplierBtn) {
            createSupplierBtn.addEventListener('click', () => {
                this.createNewSupplier();
            });
        }

        if (saveSupplierBtn) {
            saveSupplierBtn.addEventListener('click', () => {
                this.saveSupplierChanges();
            });
        }

        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => {
                this.showNewOrderModal();
            });
        }

        if (createOrderBtn) {
            createOrderBtn.addEventListener('click', () => {
                this.createSupplierOrder();
            });
        }

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const supplierSearch = document.getElementById('supplierSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortBy = document.getElementById('sortBy');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (supplierSearch) {
            supplierSearch.addEventListener('input', () => this.applyFilters());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'suppliers') {
                this.suppliers = event.detail.value;
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
        const supplierSearch = document.getElementById('supplierSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'name';

        this.filteredSuppliers = this.suppliers.filter(supplier => {
            const matchesStatus = !statusFilter || supplier.status === statusFilter;
            const matchesSearch = !supplierSearch || 
                supplier.name.toLowerCase().includes(supplierSearch) ||
                supplier.contactPerson.toLowerCase().includes(supplierSearch);
            const matchesCategory = !categoryFilter || supplier.category === categoryFilter;

            return matchesStatus && matchesSearch && matchesCategory;
        });

        // Sort suppliers
        this.filteredSuppliers.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'lastOrder':
                    return new Date(b.lastOrder) - new Date(a.lastOrder);
                case 'totalOrders':
                    return b.totalOrders - a.totalOrders;
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        this.renderSuppliers();
    },

    renderSuppliers: function() {
        const suppliersGrid = document.getElementById('suppliersGrid');
        if (!suppliersGrid) return;

        if (this.filteredSuppliers.length === 0) {
            suppliersGrid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-truck text-muted"></i>
                        <p>No se encontraron proveedores</p>
                    </div>
                </div>
            `;
            return;
        }

        suppliersGrid.innerHTML = this.filteredSuppliers.map(supplier => `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="supplier-card fade-in" onclick="suppliersModule.showSupplierDetail(${supplier.id})">
                    <div class="supplier-header">
                        <div>
                            <h5 class="supplier-name">${supplier.name}</h5>
                            <div class="supplier-contact">
                                <i class="bi bi-person"></i>${supplier.contactPerson}
                            </div>
                            <div class="supplier-contact">
                                <i class="bi bi-envelope"></i>${supplier.email}
                            </div>
                            <div class="supplier-contact">
                                <i class="bi bi-telephone"></i>${supplier.phone}
                            </div>
                        </div>
                        <div class="text-end">
                            <span class="supplier-category">${supplier.category}</span>
                            <div class="mt-2">
                                <span class="status-badge status-${this.getStatusClass(supplier.status)}">
                                    ${supplier.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="supplier-stats">
                        <div class="supplier-rating">
                            <div class="rating-stars">
                                ${this.renderStars(supplier.rating)}
                            </div>
                            <span class="rating-value">${supplier.rating}</span>
                        </div>
                        <div class="supplier-orders">
                            ${supplier.totalOrders} pedidos
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-action btn-contact" onclick="event.stopPropagation(); suppliersModule.contactSupplier(${supplier.id})">
                            <i class="bi bi-envelope me-1"></i>Contactar
                        </button>
                        <button class="btn btn-action btn-order" onclick="event.stopPropagation(); suppliersModule.quickOrder(${supplier.id})">
                            <i class="bi bi-plus me-1"></i>Pedido
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateStats: function() {
        // Total suppliers
        document.getElementById('totalSuppliers').textContent = this.suppliers.length;

        // Active suppliers
        const activeSuppliers = this.suppliers.filter(s => s.status === 'Activo').length;
        document.getElementById('activeSuppliers').textContent = activeSuppliers;

        // Average rating
        const avgRating = this.suppliers.reduce((sum, s) => sum + s.rating, 0) / this.suppliers.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);

        // Pending orders (simulated)
        const pendingOrders = this.supplierOrders.filter(o => o.status === 'Pendiente').length;
        document.getElementById('pendingOrders').textContent = pendingOrders;
    },

    showSupplierDetail: function(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const modal = document.getElementById('supplierModal');
        const modalTitle = document.getElementById('supplierModalTitle');
        const modalContent = document.getElementById('supplierModalContent');

        modalTitle.textContent = supplier.name;
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="supplier-detail-section">
                        <h6><i class="bi bi-building me-2"></i>Información de la Empresa</h6>
                        <div class="detail-item">
                            <span class="detail-label">Nombre:</span>
                            <input type="text" class="form-control form-control-sm" value="${supplier.name}" id="editName">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Contacto:</span>
                            <input type="text" class="form-control form-control-sm" value="${supplier.contactPerson}" id="editContactPerson">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <input type="email" class="form-control form-control-sm" value="${supplier.email}" id="editEmail">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Teléfono:</span>
                            <input type="tel" class="form-control form-control-sm" value="${supplier.phone}" id="editPhone">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Categoría:</span>
                            <select class="form-select form-select-sm" id="editCategory">
                                <option value="Maderas" ${supplier.category === 'Maderas' ? 'selected' : ''}>Maderas</option>
                                <option value="Herrajes" ${supplier.category === 'Herrajes' ? 'selected' : ''}>Herrajes</option>
                                <option value="Químicos" ${supplier.category === 'Químicos' ? 'selected' : ''}>Químicos</option>
                                <option value="Herramientas" ${supplier.category === 'Herramientas' ? 'selected' : ''}>Herramientas</option>
                            </select>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <select class="form-select form-select-sm" id="editStatus">
                                <option value="Activo" ${supplier.status === 'Activo' ? 'selected' : ''}>Activo</option>
                                <option value="Inactivo" ${supplier.status === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                                <option value="Suspendido" ${supplier.status === 'Suspendido' ? 'selected' : ''}>Suspendido</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="supplier-detail-section">
                        <h6><i class="bi bi-graph-up me-2"></i>Métricas de Rendimiento</h6>
                        <div class="performance-metrics">
                            <div class="metric-item">
                                <div class="metric-value">${supplier.performance.onTimeDelivery}%</div>
                                <div class="metric-label">Entregas a Tiempo</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${supplier.performance.qualityScore}</div>
                                <div class="metric-label">Calidad</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${supplier.performance.responseTime}h</div>
                                <div class="metric-label">Tiempo Respuesta</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-value">${supplier.totalOrders}</div>
                                <div class="metric-label">Total Pedidos</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="supplier-detail-section">
                <h6><i class="bi bi-geo-alt me-2"></i>Dirección</h6>
                <textarea class="form-control" rows="2" id="editAddress">${supplier.address}</textarea>
            </div>
            
            <div class="supplier-detail-section">
                <h6><i class="bi bi-box me-2"></i>Productos y Servicios</h6>
                <textarea class="form-control" rows="3" id="editProducts">${supplier.products}</textarea>
            </div>
            
            <div class="supplier-detail-section">
                <h6><i class="bi bi-chat-dots me-2"></i>Notas</h6>
                <textarea class="form-control" rows="2" id="editNotes">${supplier.notes}</textarea>
            </div>
        `;

        // Store current supplier for saving
        this.currentEditingSupplier = supplier;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    showNewSupplierModal: function() {
        const modal = document.getElementById('newSupplierModal');
        const form = document.getElementById('newSupplierForm');
        
        form.reset();

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    createNewSupplier: function() {
        const form = document.getElementById('newSupplierForm');
        const formData = new FormData(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newSupplier = {
            id: Math.max(...this.suppliers.map(s => s.id), 0) + 1,
            name: formData.get('name'),
            contactPerson: formData.get('contactPerson'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            category: formData.get('category'),
            status: 'Activo',
            rating: 0,
            totalOrders: 0,
            paymentTerms: parseInt(formData.get('paymentTerms')),
            products: formData.get('products'),
            notes: formData.get('notes'),
            lastOrder: null,
            performance: {
                onTimeDelivery: 0,
                qualityScore: 0,
                responseTime: 0
            }
        };

        this.suppliers.push(newSupplier);
        window.MobiliAriState.updateState('suppliers', this.suppliers);

        const modal = bootstrap.Modal.getInstance(document.getElementById('newSupplierModal'));
        modal.hide();

        this.showAlert('success', `Proveedor ${newSupplier.name} creado exitosamente`);
    },

    saveSupplierChanges: function() {
        if (!this.currentEditingSupplier) return;

        const supplierId = this.currentEditingSupplier.id;
        const supplierIndex = this.suppliers.findIndex(s => s.id === supplierId);

        if (supplierIndex !== -1) {
            this.suppliers[supplierIndex].name = document.getElementById('editName').value;
            this.suppliers[supplierIndex].contactPerson = document.getElementById('editContactPerson').value;
            this.suppliers[supplierIndex].email = document.getElementById('editEmail').value;
            this.suppliers[supplierIndex].phone = document.getElementById('editPhone').value;
            this.suppliers[supplierIndex].category = document.getElementById('editCategory').value;
            this.suppliers[supplierIndex].status = document.getElementById('editStatus').value;
            this.suppliers[supplierIndex].address = document.getElementById('editAddress').value;
            this.suppliers[supplierIndex].products = document.getElementById('editProducts').value;
            this.suppliers[supplierIndex].notes = document.getElementById('editNotes').value;

            window.MobiliAriState.updateState('suppliers', this.suppliers);

            const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
            modal.hide();

            this.showAlert('success', 'Proveedor actualizado exitosamente');
        }
    },

    contactSupplier: function(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const mailtoLink = `mailto:${supplier.email}?subject=Consulta desde MobiliAri&body=Estimado/a ${supplier.contactPerson},%0D%0A%0D%0AEsperamos se encuentre bien. Nos ponemos en contacto desde MobiliAri...`;
        window.open(mailtoLink);
    },

    quickOrder: function(supplierId) {
        this.currentOrderSupplier = this.suppliers.find(s => s.id === supplierId);
        if (!this.currentOrderSupplier) return;

        this.showNewOrderModal();
    },

    showNewOrderModal: function() {
        const modal = document.getElementById('newOrderModal');
        const form = document.getElementById('newOrderForm');
        
        form.reset();
        
        if (this.currentOrderSupplier) {
            document.getElementById('orderSupplierName').value = this.currentOrderSupplier.name;
            document.getElementById('orderSupplierId').value = this.currentOrderSupplier.id;
        }
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        form.querySelector('[name="orderDate"]').value = today;
        form.querySelector('[name="expectedDelivery"]').value = nextWeek;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    createSupplierOrder: function() {
        const form = document.getElementById('newOrderForm');
        const formData = new FormData(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newOrder = {
            id: `SUP-${Date.now().toString().slice(-6)}`,
            supplierId: parseInt(formData.get('supplierId')),
            orderDate: formData.get('orderDate'),
            expectedDelivery: formData.get('expectedDelivery'),
            products: formData.get('products'),
            estimatedAmount: parseFloat(formData.get('estimatedAmount')) || 0,
            priority: formData.get('priority'),
            status: 'Pendiente',
            notes: formData.get('notes')
        };

        if (!this.supplierOrders) {
            this.supplierOrders = [];
        }
        
        this.supplierOrders.push(newOrder);
        window.MobiliAriState.updateState('supplierOrders', this.supplierOrders);

        const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
        modal.hide();

        this.showAlert('success', `Pedido ${newOrder.id} creado exitosamente`);
    },

    updateUserInfo: function() {
        const currentUser = window.MobiliAriState.currentUser;
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.textContent = currentUser.name;
            if (userRole) userRole.textContent = currentUser.role;

            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = currentUser.role === 'administrador' ? 'block' : 'none';
            });
        }
    },

    // Helper functions
    getStatusClass: function(status) {
        const statusMap = {
            'Activo': 'activo',
            'Inactivo': 'inactivo',
            'Suspendido': 'suspendido'
        };
        return statusMap[status] || 'inactivo';
    },

    renderStars: function(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="bi bi-star-half"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star"></i>';
        }
        
        return stars;
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
        window.suppliersModule.init();
    });
} else {
    window.suppliersModule.init();
}
