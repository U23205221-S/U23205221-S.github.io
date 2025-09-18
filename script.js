
/**
 * MobiliAri - Sistema de Gestión y E-commerce
 * Streaming Architecture Implementation
 * Bootstrap-based frontend
 */

// ========================================
// Global State Management (Streaming Architecture)
// ========================================

class AppState {
    constructor() {
        this.currentUser = null;
        this.currentModule = 'dashboard';
        this.cart = [];
        this.products = [];
        this.orders = [];
        this.inventory = [];
        this.suppliers = [];
        this.users = [];
        this.payments = [];
        this.listeners = new Map();
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupEventStreaming();
    }

    // Event streaming system
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    // State updates with automatic UI refresh
    updateState(property, value) {
        this[property] = value;
        this.emit(`${property}Updated`, value);
        this.saveToLocalStorage();
    }

    loadInitialData() {
        // Load from localStorage or set defaults
        const savedState = localStorage.getItem('mobiliariState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(this, parsed);
        } else {
            this.setDefaultData();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('mobiliariState', JSON.stringify({
            cart: this.cart,
            products: this.products,
            orders: this.orders,
            inventory: this.inventory,
            suppliers: this.suppliers,
            users: this.users,
            payments: this.payments
        }));
    }

    setDefaultData() {
        this.products = [
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

        this.orders = [
            {
                id: 'ORD-001',
                client: 'Juan Pérez',
                product: 'Mesa de Comedor Personalizada',
                status: 'Pendiente',
                date: '2025-01-15',
                amount: 16500,
                customizations: {
                    dimensions: '180x90x75',
                    material: 'Roble',
                    finish: 'Barniz mate'
                },
                assignedTo: '',
                progress: 0,
                notes: []
            },
            {
                id: 'ORD-002',
                client: 'María González',
                product: 'Armario de Dormitorio',
                status: 'En Progreso',
                date: '2025-01-10',
                amount: 28000,
                customizations: {
                    dimensions: '200x60x220',
                    material: 'MDF',
                    finish: 'Pintura blanca'
                },
                assignedTo: 'Admin',
                progress: 60,
                notes: ['Corte completado', 'Ensamblaje en proceso']
            },
            {
                id: 'ORD-003',
                client: 'Roberto Silva',
                product: 'Escritorio Ejecutivo',
                status: 'Completado',
                date: '2025-01-05',
                amount: 13500,
                customizations: {
                    dimensions: '160x80x75',
                    material: 'Cedro',
                    finish: 'Barniz brillante'
                },
                assignedTo: 'Admin',
                progress: 100,
                notes: ['Entregado satisfactoriamente']
            }
        ];

        this.inventory = [
            {
                id: 1,
                material: 'Roble',
                currentQuantity: 45.5,
                unit: 'm²',
                minThreshold: 10,
                pricePerUnit: 850,
                status: 'Disponible',
                supplier: 'Maderas Premium SA',
                lastPurchase: '2025-01-10'
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
                lastPurchase: '2025-01-08'
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
                lastPurchase: '2025-01-12'
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
                lastPurchase: '2024-12-20'
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
                lastPurchase: '2025-01-14'
            }
        ];

        this.suppliers = [
            {
                id: 1,
                name: 'Maderas Premium SA',
                contact: 'José Martínez',
                phone: '+52 55 1234-5678',
                email: 'jose@maderaspremium.mx',
                accountStatus: 'Activo',
                materials: ['Roble', 'Cedro'],
                address: 'Av. Industrial 123, CDMX'
            },
            {
                id: 2,
                name: 'Maderera del Norte',
                contact: 'Ana Rodríguez',
                phone: '+52 81 2345-6789',
                email: 'ana@maderernorte.mx',
                accountStatus: 'Activo',
                materials: ['Pino', 'Melamina'],
                address: 'Carretera Nacional km 45, Monterrey'
            },
            {
                id: 3,
                name: 'Tableros Industriales',
                contact: 'Carlos López',
                phone: '+52 33 3456-7890',
                email: 'carlos@tablerosindustriales.mx',
                accountStatus: 'Pendiente',
                materials: ['MDF', 'Aglomerado'],
                address: 'Zona Industrial, Guadalajara'
            }
        ];

        this.users = [
            {
                id: 1,
                name: 'Admin Principal',
                email: 'admin@mobiliari.mx',
                role: 'administrador',
                status: 'Activo',
                lastLogin: '2025-01-15'
            },
            {
                id: 2,
                name: 'Carlos Mendoza',
                email: 'carlos@mobiliari.mx',
                role: 'administrador',
                status: 'Activo',
                lastLogin: '2025-01-15'
            }
        ];

        this.payments = [
            {
                id: 'PAY-001',
                type: 'cliente',
                date: '2025-01-15',
                client: 'Juan Pérez',
                amount: 16500,
                method: 'Transferencia',
                status: 'Completado',
                orderId: 'ORD-001'
            },
            {
                id: 'PAY-002',
                type: 'proveedor',
                date: '2025-01-14',
                supplier: 'Maderas Premium SA',
                amount: 25000,
                method: 'Cheque',
                status: 'Pendiente',
                concept: 'Compra de roble'
            }
        ];
    }

    setupEventStreaming() {
        // Subscribe to cart updates
        this.subscribe('cartUpdated', () => {
            this.updateCartUI();
        });

        // Subscribe to order updates
        this.subscribe('ordersUpdated', () => {
            if (this.currentModule === 'pedidos') {
                renderPedidosModule();
            }
        });

        // Subscribe to inventory updates
        this.subscribe('inventoryUpdated', () => {
            if (this.currentModule === 'inventario') {
                renderInventarioModule();
            }
        });
    }

    // Cart management
    addToCart(product, customizations = null) {
        const existingItem = this.cart.find(item => 
            item.id === product.id && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                customizations: customizations
            });
        }
        
        this.emit('cartUpdated', this.cart);
        this.saveToLocalStorage();
    }

    removeFromCart(productId, customizations = null) {
        this.cart = this.cart.filter(item => 
            !(item.id === productId && 
              JSON.stringify(item.customizations) === JSON.stringify(customizations))
        );
        this.emit('cartUpdated', this.cart);
        this.saveToLocalStorage();
    }

    updateCartQuantity(productId, quantity, customizations = null) {
        const item = this.cart.find(item => 
            item.id === productId && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );
        
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId, customizations);
            } else {
                item.quantity = quantity;
                this.emit('cartUpdated', this.cart);
                this.saveToLocalStorage();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const cartItems = document.getElementById('cartItems');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartCount) {
            cartCount.textContent = this.getCartItemCount();
        }

        if (cartTotal) {
            cartTotal.textContent = `$${this.getCartTotal().toLocaleString()}`;
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
                                ${item.customizations ? '<small class="d-block text-info">Personalizado</small>' : ''}
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="appState.updateCartQuantity(${item.id}, ${item.quantity - 1}, ${JSON.stringify(item.customizations)})">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="quantity-btn" onclick="appState.updateCartQuantity(${item.id}, ${item.quantity + 1}, ${JSON.stringify(item.customizations)})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="appState.removeFromCart(${item.id}, ${JSON.stringify(item.customizations)})">
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
    }
}

// Initialize global state
const appState = new AppState();

// ========================================
// Authentication & Navigation
// ========================================

class AuthManager {
    static login(email, password) {
        // Fixed credentials authentication
        let user = null;
        
        if (email === 'admin@mobiliari.mx' && password === 'admin123') {
            user = {
                email: email,
                role: 'administrador',
                name: 'Administrador'
            };
        } else if (email === 'cliente@mobiliari.mx' && password === 'cliente123') {
            user = {
                email: email,
                role: 'cliente',
                name: 'Cliente Usuario'
            };
        } else {
            alert('Credenciales incorrectas. Use:\nAdmin: admin@mobiliari.mx / admin123\nCliente: cliente@mobiliari.mx / cliente123');
            return false;
        }
        
        appState.currentUser = user;
        document.body.className = `role-${user.role}`;
        
        if (user.role === 'cliente') {
            this.showEcommerceInterface();
        } else {
            this.showManagementInterface();
        }
        
        // Hide login modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        return true;
    }
    
    static logout() {
        appState.currentUser = null;
        document.body.className = '';
        this.hideAllInterfaces();
        
        // Show login modal
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }
    
    static showEcommerceInterface() {
        document.getElementById('ecommerceInterface').classList.remove('d-none');
        document.getElementById('managementInterface').classList.add('d-none');
        loadEcommerceModule('catalogo');
    }
    
    static showManagementInterface() {
        document.getElementById('managementInterface').classList.remove('d-none');
        document.getElementById('ecommerceInterface').classList.add('d-none');
        loadManagementModule('dashboard');
        
        // Show/hide elements based on role
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = appState.currentUser.role === 'administrador' ? 'block' : 'none';
        });
    }
    
    static hideAllInterfaces() {
        document.getElementById('ecommerceInterface').classList.add('d-none');
        document.getElementById('managementInterface').classList.add('d-none');
    }
}

// ========================================
// E-commerce Module Functions
// ========================================

function loadEcommerceModule(section) {
    // Update navigation
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    
    // Show/hide sections
    document.getElementById('catalogoSection').classList.add('d-none');
    document.getElementById('personalizarSection').classList.add('d-none');
    
    switch (section) {
        case 'catalogo':
            document.getElementById('catalogoSection').classList.remove('d-none');
            renderProductGrid();
            break;
        case 'personalizar':
            document.getElementById('personalizarSection').classList.remove('d-none');
            break;
    }
}

function renderProductGrid(filteredProducts = null) {
    const products = filteredProducts || appState.products;
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) return;
    
    productGrid.innerHTML = products.map(product => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card h-100 border-0 shadow-sm" onclick="showProductModal(${product.id})">
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
                            <button class="btn btn-outline-wood btn-sm flex-grow-1" onclick="event.stopPropagation(); showProductModal(${product.id})">
                                <i class="bi bi-eye me-1"></i>Ver
                            </button>
                            <button class="btn btn-wood btn-sm flex-grow-1" onclick="event.stopPropagation(); addToCartQuick(${product.id})">
                                <i class="bi bi-cart-plus me-1"></i>Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showProductModal(productId) {
    const product = appState.products.find(p => p.id === productId);
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
                
                <!-- Additional product images would go here -->
                <div class="row g-2">
                    <div class="col-4">
                        <img src="${product.image}" class="img-fluid rounded border" style="height: 60px; object-fit: cover; cursor: pointer;">
                    </div>
                    <div class="col-4">
                        <img src="${product.image}" class="img-fluid rounded border" style="height: 60px; object-fit: cover; cursor: pointer;">
                    </div>
                    <div class="col-4">
                        <img src="${product.image}" class="img-fluid rounded border" style="height: 60px; object-fit: cover; cursor: pointer;">
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
                                <strong>Material Principal:</strong><br>
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
                                <strong>Peso:</strong><br>
                                <span class="text-muted">${product.weight || '15-25 kg'}</span>
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
                                <strong>Acabado:</strong><br>
                                <span class="text-muted">${product.finish || 'Barniz natural'}</span>
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
                
                <!-- Usos Recomendados -->
                <div class="mb-4">
                    <h6 class="text-dark-wood mb-3">
                        <i class="bi bi-house me-2"></i>Usos Recomendados
                    </h6>
                    <div class="d-flex flex-wrap gap-2">
                        ${getRecommendedUses(product.category).map(use => 
                            `<span class="badge bg-light text-dark border">${use}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <!-- Materiales Adicionales -->
                <div class="mb-4">
                    <h6 class="text-dark-wood mb-3">
                        <i class="bi bi-box me-2"></i>Materiales y Componentes
                    </h6>
                    <ul class="list-unstyled mb-0">
                        <li><i class="bi bi-check-circle text-success me-2"></i>Madera de ${product.material} certificada</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i>Herrajes de alta calidad</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i>Acabado resistente al agua</li>
                        <li><i class="bi bi-check-circle text-success me-2"></i>Embalaje ecológico</li>
                    </ul>
                </div>
                
                <!-- Formas de Compra -->
                <div class="mb-4">
                    <h6 class="text-dark-wood mb-3">
                        <i class="bi bi-credit-card me-2"></i>Formas de Compra
                    </h6>
                    <div class="row g-2">
                        <div class="col-12">
                            <div class="d-flex align-items-center p-2 border rounded">
                                <i class="bi bi-cash text-success me-2"></i>
                                <div>
                                    <strong>Pago de contado</strong><br>
                                    <small class="text-muted">10% de descuento adicional</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex align-items-center p-2 border rounded">
                                <i class="bi bi-calendar3 text-info me-2"></i>
                                <div>
                                    <strong>Financiamiento</strong><br>
                                    <small class="text-muted">3, 6, 9 y 12 meses sin intereses</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-wood btn-lg" onclick="addToCartQuick(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                        <i class="bi bi-cart-plus me-2"></i>Agregar al Carrito
                    </button>
                    <button class="btn btn-outline-wood" onclick="customizeFromProduct(${product.id}); bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();">
                        <i class="bi bi-gear me-2"></i>Personalizar Este Producto
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Helper function to get recommended uses based on category
function getRecommendedUses(category) {
    const usesMap = {
        'salas': ['Sala de estar', 'Sala familiar', 'Recepción', 'Espacios de reunión'],
        'comedores': ['Comedor formal', 'Comedor diario', 'Cocina integral', 'Área de desayuno'],
        'dormitorios': ['Dormitorio principal', 'Dormitorio secundario', 'Habitación de huéspedes', 'Dormitorio juvenil'],
        'oficina': ['Oficina en casa', 'Estudio', 'Área de trabajo', 'Oficina corporativa']
    };
    return usesMap[category] || ['Uso general', 'Hogar', 'Oficina'];
}

// Function to customize from an existing product
function customizeFromProduct(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Show customization content
    document.getElementById('customizeContent').style.display = 'block';
    
    // Update form with product info
    const form = document.getElementById('customizeForm');
    form.querySelector('[name="tipo"]').value = product.category === 'comedores' ? 'mesa' : 
                                                 product.category === 'salas' ? 'sofa' : 
                                                 product.category === 'dormitorios' ? 'cama' : 'escritorio';
    
    // Set default material if it matches our options
    const materialSelect = form.querySelector('[name="material"]');
    const productMaterial = product.material.toLowerCase();
    if (['roble', 'pino', 'cedro', 'mdf', 'melamina'].includes(productMaterial)) {
        materialSelect.value = productMaterial;
    }
    
    // Update the title to show selected product
    const title = document.querySelector('#personalizarSection h2');
    title.innerHTML = `<i class="bi bi-gear me-2"></i>Personalizando: ${product.name}`;
    
    // Switch to personalization section
    loadEcommerceModule('personalizar');
    
    showToast(`Producto seleccionado para personalización: ${product.name}`, 'success');
}

// Function to start customization from scratch
function createFromScratch() {
    // Show customization content
    document.getElementById('customizeContent').style.display = 'block';
    
    // Reset the form
    const form = document.getElementById('customizeForm');
    form.reset();
    
    // Update the title
    const title = document.querySelector('#personalizarSection h2');
    title.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Diseño Personalizado Desde Cero`;
    
    showToast('¡Empezemos a crear tu mueble personalizado!', 'success');
}

function addToCartQuick(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (product) {
        appState.addToCart(product);
        showToast('Producto agregado al carrito', 'success');
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    let filtered = appState.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        let matchesPrice = true;
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(p => p.replace('+', ''));
            const minPrice = parseInt(min) || 0;
            const maxPrice = max ? parseInt(max) : Infinity;
            matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        }
        
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    renderProductGrid(filtered);
}

// ========================================
// Management Module Functions
// ========================================

function loadManagementModule(module) {
    appState.currentModule = module;
    
    // Update navigation
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-module="${module}"]`)?.classList.add('active');
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        pedidos: 'Pedidos y Tareas',
        inventario: 'Materia Prima',
        proveedores: 'Proveedores',
        reportes: 'Reportes',
        usuarios: 'Usuarios',
        pagos: 'Pagos'
    };
    
    document.getElementById('moduleTitle').textContent = titles[module] || 'Dashboard';
    
    // Load module content
    switch (module) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'pedidos':
            renderPedidosModule();
            break;
        case 'inventario':
            renderInventarioModule();
            break;
        case 'proveedores':
            renderProveedoresModule();
            break;
        case 'reportes':
            renderReportesModule();
            break;
        case 'usuarios':
            renderUsuariosModule();
            break;
        case 'pagos':
            renderPagosModule();
            break;
    }
}

function renderDashboard() {
    const contentArea = document.getElementById('contentArea');
    
    const totalOrders = appState.orders.length;
    const pendingOrders = appState.orders.filter(o => o.status === 'Pendiente').length;
    const totalInventoryValue = appState.inventory.reduce((sum, item) => sum + (item.currentQuantity * item.pricePerUnit), 0);
    const lowStockItems = appState.inventory.filter(item => item.status === 'Bajo inventario' || item.status === 'Agotado').length;
    
    contentArea.innerHTML = `
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-clipboard-check"></i>
                        </div>
                        <div>
                            <p class="stat-number">${totalOrders}</p>
                            <p class="stat-label">Pedidos Totales</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-clock"></i>
                        </div>
                        <div>
                            <p class="stat-number">${pendingOrders}</p>
                            <p class="stat-label">Pedidos Pendientes</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div>
                            <p class="stat-number">$${(totalInventoryValue / 1000).toFixed(0)}k</p>
                            <p class="stat-label">Valor Inventario</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-exclamation-triangle"></i>
                        </div>
                        <div>
                            <p class="stat-number">${lowStockItems}</p>
                            <p class="stat-label">Stock Bajo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Actividad Reciente</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            ${appState.orders.slice(0, 5).map(order => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">${order.product}</h6>
                                        <small class="text-muted">Cliente: ${order.client}</small>
                                    </div>
                                    <span class="status-badge status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPedidosModule() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Pedidos y Tareas</h3>
            <button class="btn btn-wood" onclick="showNewOrderModal()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo Pedido
            </button>
        </div>
        
        <div class="kanban-board" id="kanbanBoard">
            <div class="kanban-column">
                <div class="kanban-header d-flex justify-content-between align-items-center">
                    <span>Pendiente</span>
                    <span class="badge bg-light text-dark">${appState.orders.filter(o => o.status === 'Pendiente').length}</span>
                </div>
                <div class="kanban-cards" id="pendienteCards">
                    ${renderKanbanCards('Pendiente')}
                </div>
            </div>
            
            <div class="kanban-column">
                <div class="kanban-header d-flex justify-content-between align-items-center">
                    <span>En Progreso</span>
                    <span class="badge bg-light text-dark">${appState.orders.filter(o => o.status === 'En Progreso').length}</span>
                </div>
                <div class="kanban-cards" id="progresoCards">
                    ${renderKanbanCards('En Progreso')}
                </div>
            </div>
            
            <div class="kanban-column">
                <div class="kanban-header d-flex justify-content-between align-items-center">
                    <span>Completado</span>
                    <span class="badge bg-light text-dark">${appState.orders.filter(o => o.status === 'Completado').length}</span>
                </div>
                <div class="kanban-cards" id="completadoCards">
                    ${renderKanbanCards('Completado')}
                </div>
            </div>
        </div>
    `;
    
    setupKanbanDragDrop();
}

function renderKanbanCards(status) {
    const orders = appState.orders.filter(order => order.status === status);
    
    return orders.map(order => `
        <div class="kanban-card" data-order-id="${order.id}">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">${order.id}</h6>
                <small class="text-muted">${order.date}</small>
            </div>
            <p class="mb-1 fw-medium">${order.product}</p>
            <p class="mb-2 text-muted small">${order.client}</p>
            <div class="mb-2">
                <small class="text-muted">Asignado a:</small>
                <span class="fw-medium">${order.assignedTo || 'Sin asignar'}</span>
            </div>
            
            ${status === 'En Progreso' || order.progress > 0 ? `
                <div class="progress mb-2" style="height: 4px;">
                    <div class="progress-bar bg-wood" style="width: ${order.progress}%"></div>
                </div>
                <small class="text-muted">${order.progress}% completado</small>
            ` : ''}
            
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-wood">$${order.amount.toLocaleString()}</span>
            </div>
            
            <div class="d-flex gap-1 flex-wrap">
                ${status === 'Pendiente' ? `
                    <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); assignCarpenter('${order.id}')" title="Asignar Carpintero">
                        <i class="bi bi-person-plus"></i>
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="event.stopPropagation(); changeOrderStatus('${order.id}', 'En Progreso')" title="Iniciar">
                        <i class="bi bi-play"></i>
                    </button>
                ` : status === 'En Progreso' ? `
                    <button class="btn btn-outline-success btn-sm" onclick="event.stopPropagation(); changeOrderStatus('${order.id}', 'Completado')" title="Completar">
                        <i class="bi bi-check"></i>
                    </button>
                ` : ''}
                <button class="btn btn-outline-secondary btn-sm" onclick="event.stopPropagation(); showOrderDetails('${order.id}')" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function setupKanbanDragDrop() {
    const columns = ['pendienteCards', 'progresoCards', 'completadoCards'];
    const statusMap = {
        'pendienteCards': 'Pendiente',
        'progresoCards': 'En Progreso',
        'completadoCards': 'Completado'
    };
    
    columns.forEach(columnId => {
        const column = document.getElementById(columnId);
        if (column) {
            new Sortable(column, {
                group: 'kanban',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: function(evt) {
                    const orderId = evt.item.dataset.orderId;
                    const newStatus = statusMap[evt.to.id];
                    
                    // Update order status
                    const order = appState.orders.find(o => o.id === orderId);
                    if (order) {
                        order.status = newStatus;
                        if (newStatus === 'Completado') {
                            order.progress = 100;
                        } else if (newStatus === 'En Progreso' && order.progress === 0) {
                            order.progress = 25;
                        }
                        
                        appState.emit('ordersUpdated', appState.orders);
                        appState.saveToLocalStorage();
                        showToast(`Pedido ${orderId} movido a ${newStatus}`, 'success');
                    }
                }
            });
        }
    });
}

function renderInventarioModule() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Materia Prima</h3>
            <button class="btn btn-wood" onclick="showNewMaterialModal()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo Material
            </button>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Buscar material..." id="materialSearch">
                    <button class="btn btn-outline-wood" type="button">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="statusFilter">
                    <option value="">Todos los estados</option>
                    <option value="Disponible">Disponible</option>
                    <option value="Bajo inventario">Bajo inventario</option>
                    <option value="Agotado">Agotado</option>
                </select>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-custom">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Cantidad Actual</th>
                        <th>Unidad</th>
                        <th>Umbral Mínimo</th>
                        <th>Precio por Unidad</th>
                        <th>Estado</th>
                        <th>Proveedor</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.inventory.map(item => `
                        <tr>
                            <td class="fw-medium">${item.material}</td>
                            <td>${item.currentQuantity}</td>
                            <td>${item.unit}</td>
                            <td>${item.minThreshold}</td>
                            <td>$${item.pricePerUnit}</td>
                            <td>
                                <span class="status-badge status-${item.status.toLowerCase().replace(' ', '')}">${item.status}</span>
                            </td>
                            <td>${item.supplier}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-wood me-1" onclick="showEditMaterialModal(${item.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteMaterial(${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderProveedoresModule() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Proveedores</h3>
            <button class="btn btn-wood" onclick="showNewSupplierModal()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo Proveedor
            </button>
        </div>
        
        <div class="row">
            ${appState.suppliers.map(supplier => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title">${supplier.name}</h5>
                                <span class="status-badge ${supplier.accountStatus === 'Activo' ? 'status-disponible' : 'status-bajo'}">${supplier.accountStatus}</span>
                            </div>
                            
                            <div class="mb-3">
                                <small class="text-muted">Contacto Principal:</small>
                                <p class="mb-1">${supplier.contact}</p>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-12">
                                    <small class="text-muted">Teléfono:</small>
                                    <p class="mb-1">${supplier.phone}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <small class="text-muted">Email:</small>
                                <p class="mb-1">${supplier.email}</p>
                            </div>
                            
                            <div class="mb-3">
                                <small class="text-muted">Materiales:</small>
                                <p class="mb-0">
                                    ${supplier.materials.map(m => `<span class="badge bg-light text-dark me-1">${m}</span>`).join('')}
                                </p>
                            </div>
                            
                            <div class="d-flex gap-2 mt-auto">
                                <button class="btn btn-outline-wood btn-sm flex-grow-1" onclick="showEditSupplierModal(${supplier.id})">
                                    <i class="bi bi-pencil me-1"></i>Editar
                                </button>
                                <button class="btn btn-outline-${supplier.accountStatus === 'Activo' ? 'warning' : 'success'} btn-sm" onclick="toggleSupplierStatus(${supplier.id})">
                                    <i class="bi bi-${supplier.accountStatus === 'Activo' ? 'pause' : 'play'}"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderReportesModule() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Reportes y Analytics</h3>
            <div>
                <select class="form-select d-inline-block w-auto me-2">
                    <option>Último mes</option>
                    <option>Últimos 3 meses</option>
                    <option>Último año</option>
                </select>
                <button class="btn btn-outline-wood">
                    <i class="bi bi-download me-1"></i>Exportar
                </button>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-clipboard-check"></i>
                        </div>
                        <div>
                            <p class="stat-number">${appState.orders.length}</p>
                            <p class="stat-label">Pedidos Totales</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div>
                            <p class="stat-number">$${(appState.orders.reduce((sum, o) => sum + o.amount, 0) / 1000).toFixed(0)}k</p>
                            <p class="stat-label">Ingresos Totales</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-boxes"></i>
                        </div>
                        <div>
                            <p class="stat-number">${appState.inventory.reduce((sum, i) => sum + i.currentQuantity, 0).toFixed(0)}</p>
                            <p class="stat-label">Material Consumido</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                            <i class="bi bi-clock"></i>
                        </div>
                        <div>
                            <p class="stat-number">7.2</p>
                            <p class="stat-label">Tiempo Promedio (días)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-8 mb-4">
                <div class="chart-container">
                    <h5 class="mb-3">Evolución de Ventas</h5>
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
            <div class="col-lg-4 mb-4">
                <div class="chart-container">
                    <h5 class="mb-3">Distribución de Inventario</h5>
                    <canvas id="inventoryChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Materiales Más Consumidos</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            ${appState.inventory.slice(0, 5).map(item => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">${item.material}</h6>
                                        <small class="text-muted">${item.supplier}</small>
                                    </div>
                                    <span class="fw-bold">${item.currentQuantity} ${item.unit}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Clientes Frecuentes</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush">
                            ${appState.orders.slice(0, 5).map(order => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">${order.client}</h6>
                                        <small class="text-muted">Último: ${order.date}</small>
                                    </div>
                                    <span class="fw-bold">$${order.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize charts
    setTimeout(() => {
        initializeCharts();
    }, 100);
}

function renderUsuariosModule() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Usuarios</h3>
            <button class="btn btn-wood" onclick="showNewUserModal()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo Usuario
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-custom">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.users.map(user => `
                        <tr>
                            <td class="fw-medium">${user.name}</td>
                            <td>${user.email}</td>
                            <td>
                                <span class="badge bg-wood">${user.role}</span>
                            </td>
                            <td>
                                <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
                            </td>
                            <td>${user.lastLogin}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-wood me-1" onclick="editUser(${user.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderPagosModule() {
    const contentArea = document.getElementById('contentArea');
    
    const clientPayments = appState.payments.filter(p => p.type === 'cliente');
    const supplierPayments = appState.payments.filter(p => p.type === 'proveedor');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3>Gestión de Pagos</h3>
            <button class="btn btn-wood" onclick="showNewPaymentModal()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo Pago
            </button>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Pagos de Clientes</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Monto</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${clientPayments.map(payment => `
                                        <tr>
                                            <td>${payment.id}</td>
                                            <td>${payment.client}</td>
                                            <td>$${payment.amount.toLocaleString()}</td>
                                            <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Pagos a Proveedores</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Proveedor</th>
                                        <th>Monto</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${supplierPayments.map(payment => `
                                        <tr>
                                            <td>${payment.id}</td>
                                            <td>${payment.supplier}</td>
                                            <td>$${payment.amount.toLocaleString()}</td>
                                            <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Historial Completo de Transacciones</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Cliente/Proveedor</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${appState.payments.map(payment => `
                                <tr>
                                    <td>${payment.id}</td>
                                    <td>${payment.date}</td>
                                    <td><span class="badge ${payment.type === 'cliente' ? 'bg-success' : 'bg-info'}">${payment.type}</span></td>
                                    <td>${payment.client || payment.supplier}</td>
                                    <td>$${payment.amount.toLocaleString()}</td>
                                    <td>${payment.method}</td>
                                    <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-wood me-1" onclick="viewPayment('${payment.id}')">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deletePayment('${payment.id}')">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// Chart Initialization
// ========================================

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Ventas',
                    data: [12, 19, 3, 5, 8, 12],
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart');
    if (inventoryCtx) {
        new Chart(inventoryCtx, {
            type: 'doughnut',
            data: {
                labels: appState.inventory.map(item => item.material),
                datasets: [{
                    data: appState.inventory.map(item => item.currentQuantity),
                    backgroundColor: [
                        '#8B4513',
                        '#A0522D',
                        '#DEB887',
                        '#654321',
                        '#D2691E'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Product selection for customization
function showProductSelectionModal() {
    const modal = document.getElementById('productSelectionModal');
    const grid = document.getElementById('productSelectionGrid');
    
    grid.innerHTML = appState.products.map(product => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card product-card h-100 border-0 shadow-sm">
                <img src="${product.image}" alt="${product.name}" class="card-img-top product-image">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted small">${product.description}</p>
                    <div class="mt-auto">
                        <div class="d-flex align-items-center mb-3">
                            <span class="product-price">$${product.price.toLocaleString()}</span>
                        </div>
                        <button class="btn btn-wood w-100" onclick="selectProductForCustomization(${product.id})">
                            <i class="bi bi-gear me-2"></i>Personalizar Este Producto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    const productModal = new bootstrap.Modal(modal);
    productModal.show();
}

function selectProductForCustomization(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Hide selection modal
    const selectionModal = bootstrap.Modal.getInstance(document.getElementById('productSelectionModal'));
    selectionModal.hide();
    
    // Show customization content
    document.getElementById('customizeContent').style.display = 'block';
    
    // Update form with product info
    const form = document.getElementById('customizeForm');
    form.querySelector('[name="tipo"]').value = product.category === 'comedores' ? 'mesa' : 
                                                 product.category === 'salas' ? 'sofa' : 
                                                 product.category === 'dormitorios' ? 'cama' : 'escritorio';
    
    // Update the title to show selected product
    const title = document.querySelector('#personalizarSection h2');
    title.textContent = `Personalizando: ${product.name}`;
    
    showToast(`Producto seleccionado: ${product.name}`, 'success');
}

// Order management functions
function assignCarpenter(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const carpenter = prompt('Ingrese el nombre del carpintero:', order.assignedTo || '');
    if (carpenter !== null) {
        order.assignedTo = carpenter.trim() || 'Sin asignar';
        appState.emit('ordersUpdated', appState.orders);
        appState.saveToLocalStorage();
        showToast(`Carpintero asignado: ${carpenter}`, 'success');
        renderPedidosModule();
    }
}

function changeOrderStatus(orderId, newStatus) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = newStatus;
    if (newStatus === 'En Progreso' && order.progress === 0) {
        order.progress = 25;
    } else if (newStatus === 'Completado') {
        order.progress = 100;
    }
    
    appState.emit('ordersUpdated', appState.orders);
    appState.saveToLocalStorage();
    showToast(`Pedido ${orderId} cambiado a ${newStatus}`, 'success');
    renderPedidosModule();
}

function showOrderDetails(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles del Pedido ${order.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Cliente:</strong> ${order.client}</p>
                                <p><strong>Producto:</strong> ${order.product}</p>
                                <p><strong>Fecha:</strong> ${order.date}</p>
                                <p><strong>Estado:</strong> <span class="badge bg-${order.status === 'Completado' ? 'success' : order.status === 'En Progreso' ? 'warning' : 'secondary'}">${order.status}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Asignado a:</strong> ${order.assignedTo || 'Sin asignar'}</p>
                                <p><strong>Progreso:</strong> ${order.progress}%</p>
                                <p><strong>Monto:</strong> $${order.amount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h6>Personalizaciones:</h6>
                            <ul>
                                <li>Dimensiones: ${order.customizations.dimensions} cm</li>
                                <li>Material: ${order.customizations.material}</li>
                                <li>Acabado: ${order.customizations.finish}</li>
                            </ul>
                        </div>
                        ${order.notes && order.notes.length > 0 ? `
                            <div class="mt-3">
                                <h6>Notas:</h6>
                                <ul>
                                    ${order.notes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// Material management functions
function showEditMaterialModal(materialId) {
    const material = appState.inventory.find(m => m.id === materialId);
    if (!material) return;
    
    const modalContent = `
        <div class="modal fade" id="editMaterialModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Material</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editMaterialForm">
                            <input type="hidden" id="materialId" value="${material.id}">
                            <div class="mb-3">
                                <label class="form-label">Material</label>
                                <input type="text" class="form-control" id="materialName" value="${material.material}" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Cantidad Actual</label>
                                        <input type="number" step="0.1" class="form-control" id="currentQuantity" value="${material.currentQuantity}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Unidad</label>
                                        <select class="form-select" id="unit" required>
                                            <option value="m²" ${material.unit === 'm²' ? 'selected' : ''}>m²</option>
                                            <option value="pzas" ${material.unit === 'pzas' ? 'selected' : ''}>pzas</option>
                                            <option value="kg" ${material.unit === 'kg' ? 'selected' : ''}>kg</option>
                                            <option value="lt" ${material.unit === 'lt' ? 'selected' : ''}>lt</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Umbral Mínimo</label>
                                        <input type="number" step="0.1" class="form-control" id="minThreshold" value="${material.minThreshold}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Precio por Unidad</label>
                                        <input type="number" step="0.01" class="form-control" id="pricePerUnit" value="${material.pricePerUnit}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Proveedor</label>
                                <select class="form-select" id="supplier" required>
                                    ${appState.suppliers.filter(s => s.accountStatus === 'Activo').map(s => 
                                        `<option value="${s.name}" ${material.supplier === s.name ? 'selected' : ''}>${s.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-wood" onclick="saveMaterialEdit()">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('editMaterialModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const modal = new bootstrap.Modal(document.getElementById('editMaterialModal'));
    modal.show();
}

function saveMaterialEdit() {
    const materialId = parseInt(document.getElementById('materialId').value);
    const material = appState.inventory.find(m => m.id === materialId);
    if (!material) return;
    
    material.material = document.getElementById('materialName').value;
    material.currentQuantity = parseFloat(document.getElementById('currentQuantity').value);
    material.unit = document.getElementById('unit').value;
    material.minThreshold = parseFloat(document.getElementById('minThreshold').value);
    material.pricePerUnit = parseFloat(document.getElementById('pricePerUnit').value);
    material.supplier = document.getElementById('supplier').value;
    
    // Update status based on quantity
    if (material.currentQuantity === 0) {
        material.status = 'Agotado';
    } else if (material.currentQuantity <= material.minThreshold) {
        material.status = 'Bajo inventario';
    } else {
        material.status = 'Disponible';
    }
    
    appState.emit('inventoryUpdated', appState.inventory);
    appState.saveToLocalStorage();
    showToast('Material actualizado correctamente', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editMaterialModal'));
    modal.hide();
    renderInventarioModule();
}

// Supplier management functions
function showEditSupplierModal(supplierId) {
    const supplier = appState.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    const modalContent = `
        <div class="modal fade" id="editSupplierModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Proveedor</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editSupplierForm">
                            <input type="hidden" id="supplierId" value="${supplier.id}">
                            <div class="mb-3">
                                <label class="form-label">Nombre del Proveedor</label>
                                <input type="text" class="form-control" id="supplierName" value="${supplier.name}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Contacto Principal</label>
                                <input type="text" class="form-control" id="contact" value="${supplier.contact}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" class="form-control" id="phone" value="${supplier.phone}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" value="${supplier.email}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Dirección</label>
                                <textarea class="form-control" id="address" rows="2">${supplier.address}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Materiales</label>
                                <div class="row">
                                    ${['Roble', 'Pino', 'Cedro', 'MDF', 'Melamina', 'Aglomerado'].map(material => `
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="${material}" id="material_${material}" ${supplier.materials.includes(material) ? 'checked' : ''}>
                                                <label class="form-check-label" for="material_${material}">${material}</label>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-wood" onclick="saveSupplierEdit()">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('editSupplierModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const modal = new bootstrap.Modal(document.getElementById('editSupplierModal'));
    modal.show();
}

function saveSupplierEdit() {
    const supplierId = parseInt(document.getElementById('supplierId').value);
    const supplier = appState.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    supplier.name = document.getElementById('supplierName').value;
    supplier.contact = document.getElementById('contact').value;
    supplier.phone = document.getElementById('phone').value;
    supplier.email = document.getElementById('email').value;
    supplier.address = document.getElementById('address').value;
    
    // Get selected materials
    const materials = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        materials.push(checkbox.value);
    });
    supplier.materials = materials;
    
    appState.saveToLocalStorage();
    showToast('Proveedor actualizado correctamente', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplierModal'));
    modal.hide();
    renderProveedoresModule();
}

function showNewSupplierModal() {
    const modalContent = `
        <div class="modal fade" id="newSupplierModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nuevo Proveedor</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="newSupplierForm">
                            <div class="mb-3">
                                <label class="form-label">Nombre del Proveedor</label>
                                <input type="text" class="form-control" id="newSupplierName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Contacto Principal</label>
                                <input type="text" class="form-control" id="newContact" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" class="form-control" id="newPhone" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="newEmail" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Dirección</label>
                                <textarea class="form-control" id="newAddress" rows="2"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Materiales que Suministra</label>
                                <div class="row">
                                    ${['Roble', 'Pino', 'Cedro', 'MDF', 'Melamina', 'Aglomerado'].map(material => `
                                        <div class="col-md-6">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" value="${material}" id="newMaterial_${material}">
                                                <label class="form-check-label" for="newMaterial_${material}">${material}</label>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-wood" onclick="saveNewSupplier()">Crear Proveedor</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('newSupplierModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalContent);
    const modal = new bootstrap.Modal(document.getElementById('newSupplierModal'));
    modal.show();
}

function saveNewSupplier() {
    const name = document.getElementById('newSupplierName').value;
    const contact = document.getElementById('newContact').value;
    const phone = document.getElementById('newPhone').value;
    const email = document.getElementById('newEmail').value;
    const address = document.getElementById('newAddress').value;
    
    if (!name || !contact || !phone || !email) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    // Get selected materials
    const materials = [];
    document.querySelectorAll('#newSupplierModal input[type="checkbox"]:checked').forEach(checkbox => {
        materials.push(checkbox.value);
    });
    
    if (materials.length === 0) {
        alert('Por favor seleccione al menos un material');
        return;
    }
    
    const newSupplier = {
        id: Math.max(...appState.suppliers.map(s => s.id)) + 1,
        name: name,
        contact: contact,
        phone: phone,
        email: email,
        address: address,
        accountStatus: 'Activo',
        materials: materials
    };
    
    appState.suppliers.push(newSupplier);
    appState.saveToLocalStorage();
    showToast('Nuevo proveedor creado correctamente', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('newSupplierModal'));
    modal.hide();
    renderProveedoresModule();
}

function toggleSupplierStatus(supplierId) {
    const supplier = appState.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;
    
    supplier.accountStatus = supplier.accountStatus === 'Activo' ? 'Inactivo' : 'Activo';
    appState.saveToLocalStorage();
    showToast(`Proveedor ${supplier.accountStatus === 'Activo' ? 'activado' : 'desactivado'}`, 'success');
    renderProveedoresModule();
}

// Toast notification function
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'primary'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast element after hiding
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// ========================================
// Utility Functions
// ========================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    
    const bgClass = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 
                   type === 'warning' ? 'bg-warning' : 'bg-info';
    
    toast.innerHTML = `
        <div class="toast-body ${bgClass} text-white rounded">
            <i class="bi bi-check-circle me-2"></i>${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showConfirmDialog(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email && password) {
            AuthManager.login(email, password);
        }
    });

    // Registration form
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (name && email && password) {
            alert('Registro simulado exitoso. Use las credenciales de demostración para ingresar.');
            // Hide register modal and show login modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    });

    // Toggle between login and register modals
    document.getElementById('showRegisterForm')?.addEventListener('click', function(e) {
        e.preventDefault();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
    });

    document.getElementById('showLoginForm')?.addEventListener('click', function(e) {
        e.preventDefault();
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        registerModal.hide();
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    });
    
    // Logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', AuthManager.logout);
    document.getElementById('logoutBtnMgmt')?.addEventListener('click', AuthManager.logout);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
    
    // Navigation events
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadEcommerceModule(this.dataset.section);
        });
    });
    
    document.querySelectorAll('.nav-link[data-module]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadManagementModule(this.dataset.module);
        });
    });
    
    // Category navigation
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('categoryFilter').value = this.dataset.category;
            filterProducts();
        });
    });
    
    // Cart button
    document.getElementById('cartBtn')?.addEventListener('click', function() {
        const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
        cartOffcanvas.show();
    });
    
    // Search and filters
    document.addEventListener('input', function(e) {
        if (e.target.id === 'searchInput') {
            filterProducts();
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.id === 'categoryFilter' || e.target.id === 'priceFilter') {
            filterProducts();
        }
    });
    
    // Customize form
    document.getElementById('customizeForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const customizations = {
            tipo: formData.get('tipo'),
            material: formData.get('material'),
            ancho: formData.get('ancho'),
            alto: formData.get('alto'),
            profundidad: formData.get('profundidad'),
            acabado: formData.get('acabado'),
            notas: formData.get('notas')
        };
        
        // Calculate estimated price
        const basePrice = 8000; // Base price for customizations
        const materialMultiplier = {
            'roble': 1.5,
            'cedro': 1.8,
            'pino': 1.0,
            'mdf': 0.8,
            'melamina': 0.7
        };
        
        const volume = (customizations.ancho * customizations.alto * customizations.profundidad) / 1000000;
        const materialCost = basePrice * (materialMultiplier[customizations.material] || 1.0) * volume;
        const laborCost = 2500;
        const finishCost = 800;
        const total = materialCost + laborCost + finishCost;
        
        // Update cost display
        document.getElementById('materialCost').textContent = `$${materialCost.toFixed(0)}`;
        document.getElementById('laborCost').textContent = `$${laborCost}`;
        document.getElementById('finishCost').textContent = `$${finishCost}`;
        document.getElementById('totalCost').textContent = `$${total.toFixed(0)}`;
        
        // Add to cart
        const customProduct = {
            id: Date.now(),
            name: `${customizations.tipo} Personalizado`,
            price: total,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
        };
        
        appState.addToCart(customProduct, customizations);
        showToast('Cotización generada y agregada al carrito', 'success');
    });
    
    // Product selection for customization
    document.getElementById('selectProductBtn')?.addEventListener('click', function() {
        showProductSelectionModal();
    });
    
    // Create from scratch button
    document.getElementById('createFromScratchBtn')?.addEventListener('click', function() {
        createFromScratch();
    });
    
    // Update UI on state changes
    appState.updateCartUI();
});

// ========================================
// Modal Functions (placeholder implementations)
// ========================================

function showNewOrderModal() { showToast('Función en desarrollo', 'info'); }
function showOrderDetails(orderId) { showToast(`Mostrando detalles del pedido ${orderId}`, 'info'); }
function showNewMaterialModal() { showToast('Función en desarrollo', 'info'); }
function editMaterial(id) { showToast('Función en desarrollo', 'info'); }
function deleteMaterial(id) { showToast('Función en desarrollo', 'info'); }
function showNewSupplierModal() { showToast('Función en desarrollo', 'info'); }
function editSupplier(id) { showToast('Función en desarrollo', 'info'); }
function deleteSupplier(id) { showToast('Función en desarrollo', 'info'); }
function showNewUserModal() { showToast('Función en desarrollo', 'info'); }
function editUser(id) { showToast('Función en desarrollo', 'info'); }
function deleteUser(id) { showToast('Función en desarrollo', 'info'); }
function showNewPaymentModal() { showToast('Función en desarrollo', 'info'); }
function viewPayment(id) { showToast('Función en desarrollo', 'info'); }
function deletePayment(id) { showToast('Función en desarrollo', 'info'); }
