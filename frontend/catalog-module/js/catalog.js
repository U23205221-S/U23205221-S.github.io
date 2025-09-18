/**
 * Catalog Module
 * Handles product display, search, filtering, and shopping cart functionality
 */

window.catalogModule = {
    products: [],
    filteredProducts: [],
    cart: [],
    
    init: function(data) {
        console.log('Catalog module initialized');
        this.loadProducts();
        this.loadCart();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartUI();
    },

    loadProducts: function() {
        // Get products from global state or use defaults
        this.products = window.MobiliAriState.getState('products') || this.getDefaultProducts();
        this.filteredProducts = [...this.products];
        
        // If no products in global state, initialize with defaults
        if (window.MobiliAriState.getState('products').length === 0) {
            window.MobiliAriState.updateState('products', this.products);
        }
    },

    loadCart: function() {
        this.cart = window.MobiliAriState.getState('cart') || [];
    },

    getDefaultProducts: function() {
        return [
            {
                id: 1,
                name: 'Mesa de Comedor Rústica',
                category: 'comedores',
                price: 15000,
                originalPrice: 18000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'Roble',
                dimensions: '200x100x75 cm',
                origin: 'México',
                description: 'Mesa de comedor hecha en roble macizo con acabado rústico',
                customizable: true,
                inStock: true
            },
            {
                id: 2,
                name: 'Silla Moderna Tapizada',
                category: 'comedores',
                price: 3500,
                originalPrice: 4000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'Pino y Tela',
                dimensions: '45x50x85 cm',
                origin: 'México',
                description: 'Silla moderna con tapizado en tela de alta calidad',
                customizable: true,
                inStock: true
            },
            {
                id: 3,
                name: 'Armario de Dormitorio',
                category: 'dormitorios',
                price: 25000,
                originalPrice: 28000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'MDF',
                dimensions: '200x60x220 cm',
                origin: 'México',
                description: 'Amplio armario de dormitorio con múltiples compartimentos',
                customizable: true,
                inStock: true
            },
            {
                id: 4,
                name: 'Escritorio Ejecutivo',
                category: 'oficina',
                price: 12000,
                originalPrice: 14000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'Cedro',
                dimensions: '150x70x75 cm',
                origin: 'México',
                description: 'Escritorio ejecutivo con cajones y acabado elegante',
                customizable: true,
                inStock: true
            },
            {
                id: 5,
                name: 'Sofá de Sala',
                category: 'salas',
                price: 22000,
                originalPrice: 25000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'Pino y Tela',
                dimensions: '200x90x85 cm',
                origin: 'México',
                description: 'Cómodo sofá de sala para 3 personas',
                customizable: true,
                inStock: true
            },
            {
                id: 6,
                name: 'Cama Matrimonial',
                category: 'dormitorios',
                price: 18000,
                originalPrice: 20000,
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                material: 'Roble',
                dimensions: '200x150x100 cm',
                origin: 'México',
                description: 'Cama matrimonial en roble con cabecera elegante',
                customizable: true,
                inStock: true
            }
        ];
    },

    setupEventListeners: function() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterProducts();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.filterProducts();
            });
        }

        // Filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }

        // Category dropdown navigation
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                if (categoryFilter) {
                    categoryFilter.value = category;
                    this.filterProducts();
                }
            });
        });

        // Cart functionality
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.showCart();
            });
        }

        // Navigation
        const customizeNavLink = document.getElementById('customizeNavLink');
        if (customizeNavLink) {
            customizeNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-module', {
                    detail: { module: 'customization' }
                }));
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'cart') {
                this.cart = event.detail.value;
                this.updateCartUI();
            }
        });
    },

    filterProducts: function() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const priceFilter = document.getElementById('priceFilter')?.value || '';

        this.filteredProducts = this.products.filter(product => {
            // Search filter
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.material.toLowerCase().includes(searchTerm);

            // Category filter
            const matchesCategory = !categoryFilter || product.category === categoryFilter;

            // Price filter
            let matchesPrice = true;
            if (priceFilter) {
                if (priceFilter === '0-5000') {
                    matchesPrice = product.price <= 5000;
                } else if (priceFilter === '5000-15000') {
                    matchesPrice = product.price > 5000 && product.price <= 15000;
                } else if (priceFilter === '15000-30000') {
                    matchesPrice = product.price > 15000 && product.price <= 30000;
                } else if (priceFilter === '30000+') {
                    matchesPrice = product.price > 30000;
                }
            }

            return matchesSearch && matchesCategory && matchesPrice;
        });

        this.renderProducts();
    },

    renderProducts: function() {
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) return;

        if (this.filteredProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-search text-muted"></i>
                        <h4 class="text-muted">No se encontraron productos</h4>
                        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="col-lg-4 col-md-6 mb-4 fade-in">
                <div class="card product-card h-100 border-0 shadow-sm" onclick="catalogModule.showProductModal(${product.id})">
                    <img src="${product.image}" alt="${product.name}" class="card-img-top product-image">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted small">${product.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex align-items-center mb-2">
                                <span class="product-price">$${product.price.toLocaleString()}</span>
                                ${product.originalPrice > product.price ? 
                                    `<span class="product-price-original ms-2">$${product.originalPrice.toLocaleString()}</span>` : ''
                                }
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-wood btn-sm flex-grow-1" onclick="event.stopPropagation(); catalogModule.showProductModal(${product.id})">
                                    <i class="bi bi-eye me-1"></i>Ver
                                </button>
                                <button class="btn btn-wood btn-sm flex-grow-1" onclick="event.stopPropagation(); catalogModule.addToCart(${product.id})">
                                    <i class="bi bi-cart-plus me-1"></i>Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    showProductModal: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modalContent = document.getElementById('productModalContent');
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="position-relative">
                        <img src="${product.image}" alt="${product.name}" class="img-fluid rounded mb-3">
                        <div class="position-absolute top-0 end-0 m-2">
                            <span class="badge bg-success">En Stock</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h4 class="mb-0">${product.name}</h4>
                        <span class="badge bg-light text-dark">${product.category.toUpperCase()}</span>
                    </div>
                    <p class="text-muted mb-3">${product.description}</p>
                    
                    <div class="d-flex align-items-center mb-4">
                        <span class="h3 text-wood mb-0">$${product.price.toLocaleString()}</span>
                        ${product.originalPrice > product.price ? 
                            `<span class="text-muted text-decoration-line-through ms-2 h5">$${product.originalPrice.toLocaleString()}</span>
                             <span class="badge bg-danger ms-2">${Math.round((1 - product.price/product.originalPrice) * 100)}% OFF</span>` : ''
                        }
                    </div>
                    
                    <!-- Especificaciones Técnicas -->
                    <div class="mb-4">
                        <h6 class="text-dark-wood mb-3">
                            <i class="bi bi-info-circle me-2"></i>Especificaciones Técnicas
                        </h6>
                        <div class="row g-3">
                            <div class="col-6">
                                <div class="spec-item">
                                    <strong>Material:</strong><br>
                                    <span class="text-muted">${product.material}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="spec-item">
                                    <strong>Dimensiones:</strong><br>
                                    <span class="text-muted">${product.dimensions}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="spec-item">
                                    <strong>Origen:</strong><br>
                                    <span class="text-muted">${product.origin}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="spec-item">
                                    <strong>Garantía:</strong><br>
                                    <span class="text-muted">2 años</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-wood btn-lg" onclick="catalogModule.addToCart(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                            <i class="bi bi-cart-plus me-2"></i>Agregar al Carrito
                        </button>
                        <button class="btn btn-outline-wood" onclick="catalogModule.customizeProduct(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                            <i class="bi bi-gear me-2"></i>Personalizar Este Producto
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    },

    addToCart: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        window.MobiliAriState.updateState('cart', this.cart);
        this.showAddToCartFeedback(product.name);
    },

    removeFromCart: function(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        window.MobiliAriState.updateState('cart', this.cart);
    },

    updateCartQuantity: function(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                window.MobiliAriState.updateState('cart', this.cart);
            }
        }
    },

    updateCartUI: function() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const cartItems = document.getElementById('cartItems');
        const checkoutBtn = document.getElementById('checkoutBtn');

        const itemCount = this.cart.reduce((count, item) => count + item.quantity, 0);
        const total = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (cartCount) {
            cartCount.textContent = itemCount;
        }

        if (cartTotal) {
            cartTotal.textContent = `$${total.toLocaleString()}`;
        }

        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-cart-x text-muted display-1"></i>
                        <p class="text-muted mt-3">Tu carrito está vacío</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${item.name}</h6>
                                <small class="text-muted">$${item.price.toLocaleString()}</small>
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="catalogModule.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="quantity-btn" onclick="catalogModule.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="catalogModule.removeFromCart(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    },

    showCart: function() {
        const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
        cartOffcanvas.show();
    },

    customizeProduct: function(productId) {
        window.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { 
                module: 'customization',
                data: { productId: productId }
            }
        }));
    },

    showAddToCartFeedback: function(productName) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed';
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>
                    ${productName} agregado al carrito
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
};

// Initialize module when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.catalogModule.init();
    });
} else {
    window.catalogModule.init();
}
