// Products Module
window.productsModule = {
    products: [],
    filteredProducts: [],

    init: function(data) {
        console.log('Products module initialized');
        try {
            this.loadProducts();
            this.setupEventListeners();
            this.renderProducts();
            this.updateStats();
            this.updateUserInfo();
            
            // Restore admin state
            setTimeout(() => {
                if (window.restoreAdminState) {
                    window.restoreAdminState();
                }
            }, 100);
        } catch (error) {
            console.error('Error initializing products module:', error);
        }
    },

    loadProducts: function() {
        // Load from state or use sample data
        this.products = window.MobiliAriState.getState('products') || this.getSampleProducts();
        this.filteredProducts = [...this.products];
        window.MobiliAriState.updateState('products', this.products);
    },

    getSampleProducts: function() {
        return [
            {
                id: 1,
                name: "Mesa de Comedor Clásica",
                code: "MC-001",
                price: 15000,
                stock: 8,
                minStock: 2,
                lastProduction: "2024-01-15",
                image: null,
                specifications: "Mesa de madera maciza de roble, 180x90cm, acabado natural con barniz ecológico. Capacidad para 6 personas.",
                category: "Mesas",
                material: "Madera Maciza",
                status: "active"
            },
            {
                id: 2,
                name: "Silla Ergonómica Moderna",
                code: "SE-002",
                price: 3500,
                stock: 1,
                minStock: 5,
                lastProduction: "2024-01-20",
                image: null,
                specifications: "Silla con respaldo ergonómico, tapizado en tela resistente, estructura de metal reforzado.",
                category: "Sillas",
                material: "Mixto",
                status: "active"
            },
            {
                id: 3,
                name: "Armario Empotrado Premium",
                code: "AE-003",
                price: 25000,
                stock: 0,
                minStock: 1,
                lastProduction: "2023-12-10",
                image: null,
                specifications: "Armario de 3 puertas corredizas, interior con cajones y barras, espejo central.",
                category: "Armarios",
                material: "MDF",
                status: "active"
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
                
                if (module && module !== 'products') {
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

        // Product actions
        const newProductBtn = document.getElementById('newProductBtn');
        const createProductBtn = document.getElementById('createProductBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => {
                this.showNewProductModal();
            });
        }

        if (createProductBtn) {
            createProductBtn.addEventListener('click', () => {
                this.createNewProduct();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportProducts();
            });
        }

        // Modal close buttons
        const closeNewProductModalBtn = document.getElementById('closeNewProductModalBtn');
        const cancelNewProductBtn = document.getElementById('cancelNewProductBtn');
        
        if (closeNewProductModalBtn) {
            closeNewProductModalBtn.addEventListener('click', () => {
                this.closeNewProductModal();
            });
        }
        
        if (cancelNewProductBtn) {
            cancelNewProductBtn.addEventListener('click', () => {
                this.closeNewProductModal();
            });
        }
        
        // Modal backdrop clicks
        const newProductModal = document.getElementById('newProductModal');
        
        if (newProductModal) {
            newProductModal.addEventListener('click', (e) => {
                if (e.target === newProductModal) {
                    this.closeNewProductModal();
                }
            });
            
            newProductModal.addEventListener('hidden.bs.modal', () => {
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
        const searchInput = document.getElementById('searchProducts');
        const stockFilter = document.getElementById('stockFilter');
        const sortBy = document.getElementById('sortBy');
        const priceFilter = document.getElementById('priceFilter');
        const applyFilters = document.getElementById('applyFilters');
        const clearFilters = document.getElementById('clearFilters');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        if (stockFilter) {
            stockFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyFilters());
        }
        if (applyFilters) {
            applyFilters.addEventListener('click', () => this.applyFilters());
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Image preview
        const imageInput = document.querySelector('[name="image"]');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.previewImage(e));
        }
    },

    showNewProductModal: function() {
        console.log('Abriendo modal de nuevo producto...');
        const modal = document.getElementById('newProductModal');
        const form = document.getElementById('newProductForm');
        
        if (!modal) {
            console.error('Modal newProductModal no encontrado');
            return;
        }
        
        if (!form) {
            console.error('Formulario newProductForm no encontrado');
            return;
        }
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Hide image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    closeNewProductModal: function() {
        const modal = document.getElementById('newProductModal');
        
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
            console.error('Error closing new product modal:', error);
            this.forceCloseModal('newProductModal');
        }
        
        // Reset form
        const form = document.getElementById('newProductForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de nuevo producto cerrado');
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

    previewImage: function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('imagePreview');
        const img = preview.querySelector('img');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    },

    createNewProduct: function() {
        const form = document.getElementById('newProductForm');
        const formData = new FormData(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newProduct = {
            id: Math.max(...this.products.map(p => p.id), 0) + 1,
            name: formData.get('name'),
            code: formData.get('code'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            minStock: parseInt(formData.get('minStock')),
            lastProduction: formData.get('lastProduction'),
            specifications: formData.get('specifications'),
            category: formData.get('category'),
            material: formData.get('material'),
            status: formData.get('status') || 'active',
            image: null // Handle image separately if needed
        };

        // Handle image
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            // In a real app, you'd upload to a server
            // For now, we'll use a placeholder
            newProduct.image = URL.createObjectURL(imageFile);
        }

        this.products.push(newProduct);
        window.MobiliAriState.updateState('products', this.products);
        
        this.applyFilters();
        this.updateStats();
        
        // Close modal
        this.closeNewProductModal();
        
        this.showAlert('success', 'Producto creado exitosamente');
    },

    renderProducts: function() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;

        if (this.filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-4">
                        <i class="bi bi-box-seam" style="font-size: 3rem; color: var(--neutral-400);"></i>
                        <div class="mt-3">
                            <h5 class="text-muted">No se encontraron productos</h5>
                            <p class="text-muted mb-0">Intenta ajustar los filtros o crear un nuevo producto.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredProducts.map(product => `
            <tr>
                <td>
                    <div class="product-image-small">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">` : 
                            '<div class="bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; border-radius: 4px;"><i class="bi bi-image text-muted"></i></div>'
                        }
                    </div>
                </td>
                <td>
                    <code class="text-primary">${product.code}</code>
                </td>
                <td>
                    <strong>${product.name}</strong>
                </td>
                <td>
                    <span class="badge bg-secondary">${product.category || 'Sin categoría'}</span>
                </td>
                <td>
                    <strong class="text-success">$${product.price.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="fw-bold">${product.stock}</span>
                    <small class="text-muted d-block">Min: ${product.minStock}</small>
                </td>
                <td>
                    <span class="badge ${this.getStockBadgeClass(product)}">
                        ${this.getStockLabel(product)}
                    </span>
                </td>
                <td>
                    ${product.material || 'No especificado'}
                </td>
                <td>
                    ${product.lastProduction ? this.formatDate(product.lastProduction) : 'No registrada'}
                </td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(product.status)}">
                        ${this.getStatusLabel(product.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="productsModule.viewProduct(${product.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="productsModule.editProduct(${product.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="productsModule.deleteProduct(${product.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getStockStatus: function(product) {
        if (product.stock === 0) return 'out-of-stock';
        if (product.stock <= product.minStock) return 'low-stock';
        return 'in-stock';
    },

    getStockLabel: function(product) {
        if (product.stock === 0) return 'Agotado';
        if (product.stock <= product.minStock) return 'Bajo';
        return 'Normal';
    },
    
    getStockBadgeClass: function(product) {
        if (product.stock === 0) return 'bg-danger';
        if (product.stock <= product.minStock) return 'bg-warning';
        return 'bg-success';
    },
    
    getStatusBadgeClass: function(status) {
        switch (status) {
            case 'active': return 'bg-success';
            case 'inactive': return 'bg-secondary';
            case 'discontinued': return 'bg-danger';
            default: return 'bg-secondary';
        }
    },
    
    getStatusLabel: function(status) {
        switch (status) {
            case 'active': return 'Activo';
            case 'inactive': return 'Inactivo';
            case 'discontinued': return 'Descontinuado';
            default: return 'Desconocido';
        }
    },
    
    formatDate: function(dateString) {
        if (!dateString) return 'No registrada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },


    applyFilters: function() {
        const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
        const stockFilter = document.getElementById('stockFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        const priceFilter = document.getElementById('priceFilter').value;

        this.filteredProducts = this.products.filter(product => {
            // Search filter
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.code.toLowerCase().includes(searchTerm);
            
            // Stock filter
            let matchesStock = true;
            if (stockFilter) {
                const stockStatus = this.getStockStatus(product);
                matchesStock = stockStatus === stockFilter;
            }
            
            // Price filter
            let matchesPrice = true;
            if (priceFilter) {
                const price = product.price;
                switch (priceFilter) {
                    case '0-1000':
                        matchesPrice = price >= 0 && price <= 1000;
                        break;
                    case '1000-5000':
                        matchesPrice = price > 1000 && price <= 5000;
                        break;
                    case '5000-10000':
                        matchesPrice = price > 5000 && price <= 10000;
                        break;
                    case '10000+':
                        matchesPrice = price > 10000;
                        break;
                }
            }
            
            return matchesSearch && matchesStock && matchesPrice;
        });

        // Sort
        this.filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'code':
                    return a.code.localeCompare(b.code);
                case 'price':
                    return b.price - a.price;
                case 'stock':
                    return b.stock - a.stock;
                case 'lastProduction':
                    return new Date(b.lastProduction || 0) - new Date(a.lastProduction || 0);
                default:
                    return 0;
            }
        });

        this.renderProducts();
    },

    clearFilters: function() {
        document.getElementById('searchProducts').value = '';
        document.getElementById('stockFilter').value = '';
        document.getElementById('sortBy').value = 'name';
        document.getElementById('priceFilter').value = '';
        this.applyFilters();
    },

    updateStats: function() {
        const totalProducts = this.products.length;
        const inStockProducts = this.products.filter(p => p.stock > p.minStock).length;
        const lowStockProducts = this.products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
        const outOfStockProducts = this.products.filter(p => p.stock === 0).length;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('inStockProducts').textContent = inStockProducts;
        document.getElementById('lowStockProducts').textContent = lowStockProducts;
        document.getElementById('outOfStockProducts').textContent = outOfStockProducts;
    },

    viewProduct: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Show product detail modal (implement as needed)
        console.log('Viewing product:', product);
    },

    editProduct: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Show edit modal (implement as needed)
        console.log('Editing product:', product);
        this.showAlert('info', 'Funcionalidad de edición en desarrollo');
    },
    
    deleteProduct: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
            // Remove from array
            this.products = this.products.filter(p => p.id !== productId);
            
            // Update state
            window.MobiliAriState.updateState('products', this.products);
            
            // Refresh view
            this.applyFilters();
            this.updateStats();
            
            this.showAlert('success', 'Producto eliminado exitosamente');
        }
    },

    exportProducts: function() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showAlert('success', 'Productos exportados exitosamente');
    },

    generateCSV: function() {
        const headers = ['ID', 'Nombre', 'Código', 'Precio', 'Stock', 'Stock Mínimo', 'Última Producción', 'Categoría', 'Material', 'Estado'];
        const rows = this.products.map(product => [
            product.id,
            product.name,
            product.code,
            product.price,
            product.stock,
            product.minStock,
            product.lastProduction || '',
            product.category || '',
            product.material || '',
            product.status
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    },

    navigateToModule: function(module) {
        // Preserve admin state before navigation
        if (document.body.classList.contains('role-administrador')) {
            sessionStorage.setItem('isAdmin', 'true');
        }
        
        // Dispatch navigation event
        window.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { module: module }
        }));
    },

    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    },

    updateUserInfo: function() {
        const currentUser = window.MobiliAriState.currentUser;
        
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.textContent = currentUser.name;
            if (userRole) userRole.textContent = currentUser.role;

            // Show admin elements if user is admin
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                const shouldShow = !currentUser.role || currentUser.role === 'administrador' || currentUser.role === 'admin';
                el.style.display = shouldShow ? 'block' : 'none';
            });
        } else {
            // If no user, show admin elements by default
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
        }
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : type === 'info' ? 'info' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-triangle'} me-2"></i>
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
        window.productsModule.init();
    });
} else {
    window.productsModule.init();
}

// Global emergency function for products modals
window.emergencyCloseProductsModals = function() {
    if (window.productsModule) {
        console.log('🚨 Cerrando modales de productos de emergencia...');
        
        try {
            window.productsModule.forceCloseModal('newProductModal');
            window.productsModule.forceCloseModal('productDetailModal');
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
        
        console.log('✅ Modales de productos cerrados');
    }
};
