/**
 * MobiliAri - Micro Frontend Router
 * Manages loading and routing between different micro frontends
 */

class MicroFrontendRouter {
    constructor() {
        this.currentMicroFrontend = null;
        this.container = null;
        this.currentUser = null;
        this.microFrontends = {
            // Authentication module
            auth: {
                path: '../auth-module/',
                htmlFile: 'auth.html',
                cssFile: 'css/auth.css',
                jsFile: 'js/auth.js',
                title: 'Autenticación - MobiliAri'
            },
            // E-commerce catalog module
            catalog: {
                path: '../catalog-module/',
                htmlFile: 'catalog.html',
                cssFile: 'css/catalog.css',
                jsFile: 'js/catalog.js',
                title: 'Catálogo - MobiliAri'
            },
            // Customization module
            customization: {
                path: '../customization-module/',
                htmlFile: 'customization.html',
                cssFile: 'css/customization.css',
                jsFile: 'js/customization.js',
                title: 'Personalización - MobiliAri'
            },
            // Management dashboard module
            dashboard: {
                path: '../dashboard-module/',
                htmlFile: 'dashboard.html',
                cssFile: 'css/dashboard.css',
                jsFile: 'js/dashboard.js',
                title: 'Dashboard - MobiliAri'
            },
            // Orders/Tasks module
            orders: {
                path: '../orders-module/',
                htmlFile: 'orders.html',
                cssFile: 'css/orders.css',
                jsFile: 'js/orders.js',
                title: 'Pedidos - MobiliAri'
            },
            // Inventory module
            inventory: {
                path: '../inventory-module/',
                htmlFile: 'inventory.html',
                cssFile: 'css/inventory.css',
                jsFile: 'js/inventory.js',
                title: 'Inventario - MobiliAri'
            },
            // Suppliers module
            suppliers: {
                path: '../suppliers-module/',
                htmlFile: 'suppliers.html',
                cssFile: 'css/suppliers.css',
                jsFile: 'js/suppliers.js',
                title: 'Proveedores - MobiliAri'
            },
            // Reports module
            reports: {
                path: '../reports-module/',
                htmlFile: 'reports.html',
                cssFile: 'css/reports.css',
                jsFile: 'js/reports.js',
                title: 'Reportes - MobiliAri'
            },
            // Users module
            users: {
                path: '../users-module/',
                htmlFile: 'users.html',
                cssFile: 'css/users.css',
                jsFile: 'js/users.js',
                title: 'Usuarios - MobiliAri'
            },
            // Payments module
            payments: {
                path: '../payments-module/',
                htmlFile: 'payments.html',
                cssFile: 'css/payments.css',
                jsFile: 'js/payments.js',
                title: 'Pagos - MobiliAri'
            },
            // Shopping cart module
            cart: {
                path: '../cart-module/',
                htmlFile: 'cart.html',
                cssFile: 'css/cart.css',
                jsFile: 'js/cart.js',
                title: 'Carrito - MobiliAri'
            }
        };
        
        this.setupEventListeners();
        this.setupGlobalState();
    }

    static init() {
        if (!window.MicroFrontendRouterInstance) {
            window.MicroFrontendRouterInstance = new MicroFrontendRouter();
        }
        return window.MicroFrontendRouterInstance;
    }

    setupEventListeners() {
        // Listen for hash changes for client-side routing
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // Listen for custom events from micro frontends
        window.addEventListener('navigate-to-module', (event) => {
            this.loadMicroFrontend(event.detail.module, event.detail.data);
        });

        // Listen for authentication events
        window.addEventListener('user-authenticated', (event) => {
            this.currentUser = event.detail.user;
            this.handleAuthentication(event.detail.user);
        });

        // Listen for logout events
        window.addEventListener('user-logout', () => {
            this.currentUser = null;
            this.loadMicroFrontend('auth');
        });
    }

    setupGlobalState() {
        // Create global state management
        window.MobiliAriState = {
            currentUser: null,
            cart: JSON.parse(localStorage.getItem('mobiliariCart') || '[]'),
            products: JSON.parse(localStorage.getItem('mobiliariProducts') || '[]'),
            orders: JSON.parse(localStorage.getItem('mobiliariOrders') || '[]'),
            inventory: JSON.parse(localStorage.getItem('mobiliariInventory') || '[]'),
            suppliers: JSON.parse(localStorage.getItem('mobiliariSuppliers') || '[]'),
            users: JSON.parse(localStorage.getItem('mobiliariUsers') || '[]'),
            payments: JSON.parse(localStorage.getItem('mobiliariPayments') || '[]'),
            
            // State update methods
            updateState: function(key, value) {
                this[key] = value;
                localStorage.setItem(`mobiliari${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(value));
                window.dispatchEvent(new CustomEvent('state-updated', { 
                    detail: { key, value } 
                }));
            },

            // Get state method
            getState: function(key) {
                return this[key];
            }
        };

        // Initialize default data if empty
        if (window.MobiliAriState.products.length === 0) {
            this.initializeDefaultData();
        }
    }

    initializeDefaultData() {
        // Initialize with default products, orders, etc.
        const defaultProducts = [
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
            }
        ];

        window.MobiliAriState.updateState('products', defaultProducts);
    }

    async init() {
        this.container = document.getElementById('micro-frontend-container');
        
        // Check if user is already authenticated
        const savedUser = localStorage.getItem('mobiliariCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            window.MobiliAriState.currentUser = this.currentUser;
            this.handleAuthentication(this.currentUser);
        } else {
            // Load authentication module by default
            await this.loadMicroFrontend('auth');
        }
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1);
        if (hash && this.microFrontends[hash]) {
            this.loadMicroFrontend(hash);
        }
    }

    handleAuthentication(user) {
        localStorage.setItem('mobiliariCurrentUser', JSON.stringify(user));
        window.MobiliAriState.currentUser = user;
        
        // Route based on user role
        if (user.role === 'cliente') {
            this.loadMicroFrontend('catalog');
        } else if (user.role === 'administrador') {
            this.loadMicroFrontend('dashboard');
        }
    }

    async loadMicroFrontend(moduleName, data = null) {
        if (!this.microFrontends[moduleName]) {
            console.error(`Micro frontend ${moduleName} not found`);
            return;
        }

        const module = this.microFrontends[moduleName];
        
        try {
            // Show loading spinner
            this.showLoading();

            // Update page title
            document.title = module.title;

            // Load HTML content
            const htmlResponse = await fetch(module.path + module.htmlFile);
            const htmlContent = await htmlResponse.text();

            // Load CSS if not already loaded
            await this.loadCSS(module.path + module.cssFile, moduleName);

            // Update container content
            this.container.innerHTML = htmlContent;

            // Load and execute JavaScript
            await this.loadJS(module.path + module.jsFile, moduleName);
            
            // Wait a bit for the script to execute
            await new Promise(resolve => setTimeout(resolve, 50));

            // Initialize the module if it has an init function
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                const moduleObject = window[`${moduleName}Module`];
                console.log(`Looking for module: ${moduleName}Module`, moduleObject);
                
                if (moduleObject && moduleObject.init) {
                    console.log(`Initializing ${moduleName} module`);
                    try {
                        moduleObject.init(data);
                    } catch (initError) {
                        console.error(`Error initializing ${moduleName} module:`, initError);
                    }
                } else {
                    console.warn(`Module ${moduleName}Module not found or has no init function`);
                }
            }, 100);

            // Update current module
            this.currentMicroFrontend = moduleName;

            // Update URL hash
            if (window.location.hash !== `#${moduleName}`) {
                window.location.hash = moduleName;
            }

            // Dispatch module loaded event
            window.dispatchEvent(new CustomEvent('module-loaded', {
                detail: { module: moduleName, data }
            }));

        } catch (error) {
            console.error(`Error loading micro frontend ${moduleName}:`, error);
            console.error('Module config:', module);
            console.error('Error details:', error.message, error.stack);
            this.showError(`Error loading ${moduleName} module: ${error.message}`);
        }
    }

    async loadCSS(cssPath, moduleName) {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            if (document.querySelector(`link[data-module="${moduleName}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.setAttribute('data-module', moduleName);
            
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${cssPath}`));
            
            document.head.appendChild(link);
        });
    }

    async loadJS(jsPath, moduleName) {
        return new Promise((resolve, reject) => {
            // Remove existing script for this module
            const existingScript = document.querySelector(`script[data-module="${moduleName}"]`);
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = jsPath;
            script.setAttribute('data-module', moduleName);
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load JS: ${jsPath}`));
            
            document.body.appendChild(script);
        });
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
                <div class="text-center">
                    <div class="spinner-custom mb-3"></div>
                    <p class="text-muted">Cargando módulo...</p>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
                <div class="text-center">
                    <i class="bi bi-exclamation-triangle text-danger display-1 mb-3"></i>
                    <h3 class="text-danger mb-3">Error</h3>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-wood" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise me-2"></i>Recargar
                    </button>
                </div>
            </div>
        `;
    }

    // Public methods for navigation
    navigateToModule(moduleName, data = null) {
        this.loadMicroFrontend(moduleName, data);
    }

    getCurrentModule() {
        return this.currentMicroFrontend;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.MicroFrontendRouter = MicroFrontendRouter.init();
    window.MicroFrontendRouter.init();
});

// Export for use in other modules
window.MicroFrontendRouter = MicroFrontendRouter;
