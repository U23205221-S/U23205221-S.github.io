/**
 * Products Module with Submodules
 * Handles base products, prefabricated products, and custom products
 */

window.productsModule = {
    baseProducts: [],
    prefabricatedProducts: [],
    customProducts: [],
    filteredBaseProducts: [],
    filteredPrefabricatedProducts: [],
    filteredCustomProducts: [],

    init: async function(data) {
        console.log('Products module initialized');
        try {
            await this.loadProducts();
            this.setupEventListeners();
            this.renderProducts();
            this.updateStats();
            this.updateUserInfo();
            
            // Restore admin state if available
            setTimeout(() => {
                if (window.restoreAdminState) {
                    window.restoreAdminState();
                }
            }, 100);
        } catch (error) {
            console.error('Error initializing products module:', error);
        }
    },

    loadProducts: async function() {
        let base = window.MobiliAriState.getState('baseProducts');
        let prefabricated = window.MobiliAriState.getState('prefabricatedProducts');
        let custom = window.MobiliAriState.getState('customProducts');
        
        if (!base || base.length === 0) {
            this.baseProducts = this.getDefaultBaseProducts();
            window.MobiliAriState.updateState('baseProducts', this.baseProducts);
        } else {
            this.baseProducts = base;
        }
        this.filteredBaseProducts = [...this.baseProducts];

        this.prefabricatedProducts = prefabricated || [];
        this.filteredPrefabricatedProducts = [...this.prefabricatedProducts];

        this.customProducts = custom || [];
        this.filteredCustomProducts = [...this.customProducts];
    },

    getDefaultBaseProducts: function() {
        return [
            { id: 1, name: "Mesa de Comedor", description: "Mesa básica para comedor familiar", basePrice: 12000, registrationDate: "2024-01-15", status: "active" },
            { id: 2, name: "Silla Estándar", description: "Silla básica con respaldo ergonómico", basePrice: 2500, registrationDate: "2024-01-16", status: "active" },
            { id: 3, name: "Armario Básico", description: "Armario de dos puertas con estantes", basePrice: 18000, registrationDate: "2024-01-17", status: "active" }
        ];
    },

    setupEventListeners: function() {
        // General Navigation
        document.querySelectorAll('[data-module]').forEach(link => {
            if (!link.closest('#productsSubmenu')) { // Exclude submenu links from module navigation
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const module = e.target.closest('[data-module]').getAttribute('data-module');
                    if (module && module !== 'products') {
                        this.navigateToModule(module);
                    }
                });
            }
        });

        // Submenu and Tabs
        this.setupSubmenuToggle();
        this.setupTabSwitching();

        // UI Elements
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        const logoutBtn = document.getElementById('logoutBtnMgmt');
        if (logoutBtn) logoutBtn.addEventListener('click', () => window.dispatchEvent(new CustomEvent('user-logout')));

        // Product action buttons
        this.setupProductButtons();
    },

    setupSubmenuToggle: function() {
        const productsMainLink = document.getElementById('productsMainLink');
        const productsSubmenu = document.getElementById('productsSubmenu');
        const productsChevron = document.getElementById('productsChevron');
        
        if (productsMainLink && productsSubmenu && productsChevron) {
            productsMainLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = productsSubmenu.classList.toggle('show');
                productsChevron.classList.toggle('bi-chevron-down', isExpanded);
                productsChevron.classList.toggle('bi-chevron-right', !isExpanded);
            });
        }
    },

    setupTabSwitching: function() {
        const submenuLinks = document.querySelectorAll('.submenu-link');
        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = e.target.closest('[data-tab]').getAttribute('data-tab');
                
                submenuLinks.forEach(l => l.classList.remove('active'));
                e.target.closest('.submenu-link').classList.add('active');
                
                this.switchToTab(targetTab);
            });
        });
    },

    switchToTab: function(tabId) {
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('show', 'active');
        
        document.querySelectorAll('#productTabs .nav-link').forEach(btn => btn.classList.remove('active'));
        const targetButton = document.querySelector(`#productTabs [data-bs-target="#${tabId}"]`);
        if (targetButton) targetButton.classList.add('active');
    },

    setupProductButtons: function() {
        document.getElementById('newProductBtn')?.addEventListener('click', () => this.showNewBaseProductModal());
        document.getElementById('newBaseProductBtn')?.addEventListener('click', () => this.showNewBaseProductModal());
        document.getElementById('newPrefabricatedProductBtn')?.addEventListener('click', () => this.showNewPrefabricatedProductModal());
        document.getElementById('newCustomProductBtn')?.addEventListener('click', () => this.showNewCustomProductModal());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportProducts());
    },

    renderProducts: function() {
        this.renderBaseProducts();
        this.renderPrefabricatedProducts();
        this.renderCustomProducts();
    },

    renderBaseProducts: function() {
        const tableBody = document.getElementById('baseProductsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.filteredBaseProducts.map(p => `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td>${p.name}</td>
                <td>${p.description}</td>
                <td><strong>$${p.basePrice.toLocaleString()}</strong></td>
                <td>${this.formatDate(p.registrationDate)}</td>
                <td><span class="badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productsModule.viewBaseProduct(${p.id})"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-outline-warning" onclick="productsModule.editBaseProduct(${p.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-outline-danger" onclick="productsModule.deleteBaseProduct(${p.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPrefabricatedProducts: function() {
        const tableBody = document.getElementById('prefabricatedProductsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.filteredPrefabricatedProducts.map(p => `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td><span class="badge bg-info">${p.baseProductName}</span></td>
                <td>${p.code}</td>
                <td>${p.stock} / ${p.minStock}</td>
                <td><strong>$${p.salePrice.toLocaleString()}</strong></td>
                <td><span class="badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productsModule.viewPrefabricatedProduct(${p.id})"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-outline-warning" onclick="productsModule.editPrefabricatedProduct(${p.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-outline-danger" onclick="productsModule.deletePrefabricatedProduct(${p.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderCustomProducts: function() {
        const tableBody = document.getElementById('customProductsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.filteredCustomProducts.map(p => `
            <tr>
                <td><strong>${p.id}</strong></td>
                <td><span class="badge bg-warning">${p.baseProductName}</span></td>
                <td>${p.customName}</td>
                <td><strong>$${p.customPrice.toLocaleString()}</strong></td>
                <td><span class="badge ${this.getCustomStatusClass(p.status)}">${this.getCustomStatusText(p.status)}</span></td>
                <td>${this.formatDate(p.creationDate)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="productsModule.viewCustomProduct(${p.id})"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-outline-warning" onclick="productsModule.editCustomProduct(${p.id})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-outline-danger" onclick="productsModule.deleteCustomProduct(${p.id})"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // CRUD and Modal functions (simplified with prompts)
    showNewBaseProductModal: function() {
        const name = prompt('Nombre del producto base:');
        if (!name) return;
        const description = prompt('Descripción:');
        if (!description) return;
        const basePrice = parseFloat(prompt('Precio Base:'));
        if (isNaN(basePrice)) return;

        const newId = (Math.max(0, ...this.baseProducts.map(p => p.id))) + 1;
        const newProduct = { id: newId, name, description, basePrice, registrationDate: new Date().toISOString().split('T')[0], status: 'active' };
        
        this.baseProducts.push(newProduct);
        this.filteredBaseProducts.push(newProduct);
        window.MobiliAriState.updateState('baseProducts', this.baseProducts);
        this.renderBaseProducts();
        this.updateStats();
        this.showAlert('success', 'Producto base creado.');
    },
    
    // Placeholder CRUD functions
    viewBaseProduct: function(id) { alert(`Viendo producto base ${id}`); },
    editBaseProduct: function(id) { alert(`Editando producto base ${id}`); },
    deleteBaseProduct: function(id) {
        if (confirm('¿Eliminar producto base?')) {
            this.baseProducts = this.baseProducts.filter(p => p.id !== id);
            this.filteredBaseProducts = this.filteredBaseProducts.filter(p => p.id !== id);
            window.MobiliAriState.updateState('baseProducts', this.baseProducts);
            this.renderBaseProducts();
            this.updateStats();
            this.showAlert('success', 'Producto base eliminado.');
        }
    },
    
    showNewPrefabricatedProductModal: function() { alert('Funcionalidad para crear prefabricado no implementada.'); },
    viewPrefabricatedProduct: function(id) { alert(`Viendo prefabricado ${id}`); },
    editPrefabricatedProduct: function(id) { alert(`Editando prefabricado ${id}`); },
    deletePrefabricatedProduct: function(id) { alert(`Eliminando prefabricado ${id}`); },

    showNewCustomProductModal: function() { alert('Funcionalidad para crear personalizado no implementada.'); },
    viewCustomProduct: function(id) { alert(`Viendo personalizado ${id}`); },
    editCustomProduct: function(id) { alert(`Editando personalizado ${id}`); },
    deleteCustomProduct: function(id) { alert(`Eliminando personalizado ${id}`); },

    // Utility functions
    getCustomStatusClass: function(status) {
        const classes = { pending: 'bg-warning', in_progress: 'bg-info', completed: 'bg-success', cancelled: 'bg-danger' };
        return classes[status] || 'bg-secondary';
    },

    getCustomStatusText: function(status) {
        const texts = { pending: 'Pendiente', in_progress: 'En Progreso', completed: 'Completado', cancelled: 'Cancelado' };
        return texts[status] || 'Desconocido';
    },

    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    },

    updateStats: function() {
        const total = this.baseProducts.length + this.prefabricatedProducts.length + this.customProducts.length;
        document.getElementById('totalProducts').textContent = total;
        // Add more stats logic here if needed
    },

    updateUserInfo: function() {
        const user = window.MobiliAriState.currentUser;
        if (user) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userRole').textContent = user.role;
        }
    },

    exportProducts: function() { alert('Función de exportación en desarrollo'); },

    showAlert: function(type, message) {
        const alertContainer = document.createElement('div');
        alertContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        alertContainer.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        document.body.appendChild(alertContainer);
        setTimeout(() => alertContainer.remove(), 5000);
    },

    navigateToModule: function(module) {
        window.dispatchEvent(new CustomEvent('navigate-to-module', { detail: { module } }));
    },

    toggleSidebar: function() {
        document.getElementById('sidebar')?.classList.toggle('collapsed');
    }
};