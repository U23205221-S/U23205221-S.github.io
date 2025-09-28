/**
 * MobiliAri - Micro Frontend Router - BACKUP
 * Simple version to fix loading issues
 */

class MicroFrontendRouter {
    constructor() {
        this.currentMicroFrontend = null;
        this.container = null;
        this.currentUser = null;
        this.microFrontends = {
            // Login module
            login: {
                path: '../login/',
                htmlFile: 'login.html',
                cssFile: 'css/login.css',
                jsFile: 'js/login.js',
                title: 'Iniciar Sesión - MobiliAri'
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
            // Products module
            products: {
                path: '../products-module/',
                htmlFile: 'products.html',
                cssFile: 'css/products.css',
                jsFile: 'js/products.js',
                title: 'Productos - MobiliAri'
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
        // Listen for custom events from micro frontends
        window.addEventListener('navigate-to-module', (event) => {
            this.loadMicroFrontend(event.detail.module, event.detail.data);
        });

        // Listen for logout events
        window.addEventListener('user-logout', () => {
            this.currentUser = null;
            this.loadMicroFrontend('login');
        });
    }

    setupGlobalState() {
        // Create global state management
        if (!window.MobiliAriState) {
            window.MobiliAriState = {
                currentUser: null,
                data: {},
                
                updateState: function(key, value) {
                    this.data[key] = value;
                    window.dispatchEvent(new CustomEvent('state-updated', { 
                        detail: { key, value } 
                    }));
                },

                getState: function(key) {
                    return this.data[key] || [];
                }
            };
        }
    }

    async init() {
        this.container = document.getElementById('micro-frontend-container');
        if (!this.container) {
            console.error('Container not found');
            return;
        }

        // Check for saved user
        const savedUser = localStorage.getItem('mobiliariCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            window.MobiliAriState.currentUser = this.currentUser;
            this.loadMicroFrontend('dashboard');
        } else {
            this.loadMicroFrontend('login');
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
            await new Promise(resolve => setTimeout(resolve, 100));

            // Initialize the module if it has an init function
            setTimeout(() => {
                // Preserve admin state
                if (document.body.classList.contains('role-administrador')) {
                    sessionStorage.setItem('isAdmin', 'true');
                }
                
                // Try to find and initialize module
                let moduleObject = window[`${moduleName}Module`];
                
                if (moduleObject && moduleObject.init) {
                    console.log(`Initializing ${moduleName} module`);
                    try {
                        moduleObject.init(data);
                    } catch (initError) {
                        console.error(`Error initializing ${moduleName} module:`, initError);
                    }
                }
                
                // Restore admin state
                setTimeout(() => {
                    const wasAdmin = sessionStorage.getItem('isAdmin');
                    if (wasAdmin === 'true') {
                        document.body.classList.add('role-administrador');
                        const adminElements = document.querySelectorAll('.admin-only');
                        adminElements.forEach(el => {
                            el.style.display = '';
                        });
                    }
                }, 50);
            }, 100);

            // Update current module
            this.currentMicroFrontend = moduleName;

        } catch (error) {
            console.error(`Error loading micro frontend ${moduleName}:`, error);
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
                    <i class="bi bi-exclamation-triangle text-danger display-1 mb-3"></i>
                    <h3 class="text-danger mb-3">Error</h3>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="bi bi-arrow-clockwise me-2"></i>Recargar
                    </button>
                </div>
            </div>
        `;
    }
}

// Global utility functions
window.restoreAdminState = function() {
    const wasAdmin = sessionStorage.getItem('isAdmin');
    if (wasAdmin === 'true') {
        document.body.classList.add('role-administrador');
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = '';
        });
    }
};

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MicroFrontendRouter.init().then(router => router.init());
    });
} else {
    MicroFrontendRouter.init().then(router => router.init());
}

// Export for use in other modules
window.MicroFrontendRouter = MicroFrontendRouter;
