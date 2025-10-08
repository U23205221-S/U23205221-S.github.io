/**
 * MobiliAri - Simple Router
 * Fixed version to resolve loading issues
 */

class MicroFrontendRouter {
    constructor() {
        this.currentMicroFrontend = null;
        this.container = null;
        this.currentUser = null;
        this.microFrontends = {
            login: {
                path: '../login/',
                htmlFile: 'login.html',
                cssFile: 'css/login.css',
                jsFile: 'js/login.js',
                title: 'Iniciar Sesión - MobiliAri'
            },
            register: {
                path: '../register/',
                htmlFile: 'register.html',
                cssFile: 'css/register.css',
                jsFile: 'js/register.js',
                title: 'Crear Cuenta - MobiliAri'
            },
            catalog: {
                path: '../catalog-module/',
                htmlFile: 'catalog.html',
                cssFile: 'css/catalog.css',
                jsFile: 'js/catalog.js',
                title: 'Catálogo - MobiliAri'
            },
            customization: {
                path: '../customization-module/',
                htmlFile: 'customization.html',
                cssFile: 'css/customization.css',
                jsFile: 'js/customization.js',
                title: 'Personalización - MobiliAri'
            },
            'my-orders': {
                path: '../my-orders-module/',
                htmlFile: 'my-orders.html',
                cssFile: 'css/my-orders.css',
                jsFile: 'js/my-orders.js',
                title: 'Mis Pedidos - MobiliAri'
            },
            cart: {
                path: '../cart-module/',
                htmlFile: 'cart.html',
                cssFile: 'css/cart.css',
                jsFile: 'js/cart.js',
                title: 'Carrito - MobiliAri'
            },
            dashboard: {
                path: '../dashboard-module/',
                htmlFile: 'dashboard.html',
                cssFile: 'css/dashboard.css',
                jsFile: 'js/dashboard.js',
                title: 'Dashboard - MobiliAri'
            },
            orders: {
                path: '../orders-module/',
                htmlFile: 'orders.html',
                cssFile: 'css/orders.css',
                jsFile: 'js/orders.js',
                title: 'Pedidos - MobiliAri'
            },
            inventory: {
                path: '../inventory-module/',
                htmlFile: 'inventory.html',
                cssFile: 'css/inventory.css',
                jsFile: 'js/inventory.js',
                title: 'Inventario - MobiliAri'
            },
            suppliers: {
                path: '../suppliers-module/',
                htmlFile: 'suppliers.html',
                cssFile: 'css/suppliers.css',
                jsFile: 'js/suppliers.js',
                title: 'Proveedores - MobiliAri'
            },
            products: {
                path: '../products-module/',
                htmlFile: 'products.html',
                cssFile: 'css/products.css',
                jsFile: 'js/products.js',
                title: 'Productos - MobiliAri'
            },
            reports: {
                path: '../reports-module/',
                htmlFile: 'reports.html',
                cssFile: 'css/reports.css',
                jsFile: 'js/reports.js',
                title: 'Reportes - MobiliAri'
            },
            users: {
                path: '../users-module/',
                htmlFile: 'users.html',
                cssFile: 'css/users.css',
                jsFile: 'js/users.js',
                title: 'Usuarios - MobiliAri'
            },
            payments: {
                path: '../payments-module/',
                htmlFile: 'payments.html',
                cssFile: 'css/payments.css',
                jsFile: 'js/payments.js',
                title: 'Pagos - MobiliAri'
            }
        };
        
        this.setupEventListeners();
        this.setupGlobalState().then(() => {
            console.log('Router initialized successfully');
        });
    }

    static init() {
        if (!window.MicroFrontendRouterInstance) {
            window.MicroFrontendRouterInstance = new MicroFrontendRouter();
        }
        return window.MicroFrontendRouterInstance;
    }

    setupEventListeners() {
        window.addEventListener('navigate-to-module', (event) => {
            this.loadMicroFrontend(event.detail.module, event.detail.data);
        });

        window.addEventListener('user-authenticated', (event) => {
            this.currentUser = event.detail.user;
            this.handleAuthentication(event.detail.user);
        });

        window.addEventListener('user-logout', () => {
            this.currentUser = null;
            localStorage.removeItem('mobiliariCurrentUser');
            this.loadMicroFrontend('login');
        });
    }

    async setupGlobalState() {
        if (!window.MobiliAriState) {
            window.MobiliAriState = {
                currentUser: null,
                data: {},
                
                updateState: function(key, value) {
                    this.data[key] = value;
                    localStorage.setItem(`mobiliari${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(value));
                    window.dispatchEvent(new CustomEvent('state-updated', { 
                        detail: { key, value } 
                    }));
                },

                getState: function(key) {
                    // Try to get from memory first, then from localStorage
                    if (this.data[key] && this.data[key].length > 0) {
                        return this.data[key];
                    }
                    const stored = localStorage.getItem(`mobiliari${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (stored) {
                        this.data[key] = JSON.parse(stored);
                        return this.data[key];
                    }
                    return [];
                }
            };
        }
        
        // Load users data if not already loaded
        if (!window.MobiliAriState.getState('users').length) {
            await this.loadUsersData();
        }
    }

    async loadUsersData() {
        try {
            const response = await fetch('../data/users.json');
            if (response.ok) {
                const users = await response.json();
                window.MobiliAriState.updateState('users', users);
                console.log('Users data loaded successfully');
            } else {
                console.error('Failed to load users data');
            }
        } catch (error) {
            console.error('Error loading users data:', error);
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
        } else {
            // Default to dashboard for other roles
            this.loadMicroFrontend('dashboard');
        }
    }

    async init() {
        this.container = document.getElementById('micro-frontend-container');
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        const savedUser = localStorage.getItem('mobiliariCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            window.MobiliAriState.currentUser = this.currentUser;
            this.handleAuthentication(this.currentUser);
        } else {
            this.loadMicroFrontend('login');
        }
    }

    async loadMicroFrontend(moduleName, data = null) {
        if (!this.microFrontends[moduleName]) {
            console.error(`Module ${moduleName} not found`);
            return;
        }

        const module = this.microFrontends[moduleName];
        
        try {
            this.showLoading();
            document.title = module.title;

            const htmlResponse = await fetch(module.path + module.htmlFile);
            const htmlContent = await htmlResponse.text();

            await this.loadCSS(module.path + module.cssFile, moduleName);
            this.container.innerHTML = htmlContent;
            await this.loadJS(module.path + module.jsFile, moduleName);
            
            await new Promise(resolve => setTimeout(resolve, 100));

            setTimeout(() => {
                // Preserve admin state
                if (document.body.classList.contains('role-administrador')) {
                    sessionStorage.setItem('isAdmin', 'true');
                }
                
                let moduleObject = window[`${moduleName}Module`];
                
                if (moduleObject && moduleObject.init) {
                    try {
                        moduleObject.init(data);
                    } catch (initError) {
                        console.error(`Error initializing ${moduleName}:`, initError);
                    }
                }
                
                // Restore admin state
                setTimeout(() => {
                    if (window.restoreAdminState) {
                        window.restoreAdminState();
                    }
                }, 50);
            }, 100);

            this.currentMicroFrontend = moduleName;

        } catch (error) {
            console.error(`Error loading ${moduleName}:`, error);
            this.showError(`Error loading ${moduleName}: ${error.message}`);
        }
    }

    async loadCSS(cssPath, moduleName) {
        return new Promise((resolve, reject) => {
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
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-muted mt-3">Cargando módulo...</p>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
                <div class="text-center">
                    <h3 class="text-danger mb-3">Error</h3>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recargar</button>
                </div>
            </div>
        `;
    }
}

// Global utility function
window.restoreAdminState = function() {
    const wasAdmin = sessionStorage.getItem('isAdmin');
    const currentUser = window.MobiliAriState?.currentUser;
    
    // Check if user is admin from current user or session
    const isAdmin = wasAdmin === 'true' || 
                   (currentUser && (currentUser.role === 'administrador' || currentUser.role === 'admin'));
    
    if (isAdmin) {
        document.body.classList.add('role-administrador');
        sessionStorage.setItem('isAdmin', 'true');
        
        // Show admin elements with a small delay to ensure DOM is ready
        setTimeout(() => {
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = '';
                el.classList.remove('d-none');
            });
        }, 10);
    }
};

// Initialize router
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const router = MicroFrontendRouter.init();
        router.init();
    });
} else {
    const router = MicroFrontendRouter.init();
    router.init();
}

window.MicroFrontendRouter = MicroFrontendRouter;
