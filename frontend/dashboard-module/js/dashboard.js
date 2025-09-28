/**
 * Dashboard Module
 * Handles admin dashboard functionality, stats, and navigation
 */

window.dashboardModule = {
    orders: [],
    inventory: [],
    users: [],
    payments: [],
    products: [],
    
    init: function(data) {
        console.log('Dashboard module initialized');
        this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.loadRecentOrders();
        this.loadCriticalInventory();
        this.updateUserInfo();
        
        // Restore admin state if preserved in session
        setTimeout(() => {
            if (window.restoreAdminState) {
                window.restoreAdminState();
            }
        }, 100);
    },

    loadData: function() {
        this.orders = window.MobiliAriState.getState('orders') || this.getDefaultOrders();
        this.inventory = window.MobiliAriState.getState('inventory') || this.getDefaultInventory();
        this.users = window.MobiliAriState.getState('users') || [];
        this.payments = window.MobiliAriState.getState('payments') || [];
        this.products = window.MobiliAriState.getState('products') || [];
        
        // Initialize with default data if empty
        if (window.MobiliAriState.getState('orders').length === 0) {
            window.MobiliAriState.updateState('orders', this.orders);
        }
        if (window.MobiliAriState.getState('inventory').length === 0) {
            window.MobiliAriState.updateState('inventory', this.inventory);
        }
    },

    getDefaultOrders: function() {
        return [
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
                lastPurchase: '2025-01-05'
            }
        ];
    },

    setupEventListeners: function() {
        // Sidebar navigation and quick action buttons (unified handler)
        const moduleElements = document.querySelectorAll('[data-module]');
        moduleElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                              e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'dashboard') {
                    // Store current admin state before navigation
                    const isAdmin = document.body.classList.contains('role-administrador');
                    sessionStorage.setItem('isAdmin', isAdmin.toString());
                    
                    // Navigate to module
                    window.dispatchEvent(new CustomEvent('navigate-to-module', {
                        detail: { module: module }
                    }));
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                const mainContent = document.querySelector('.main-content');
                
                if (sidebar) {
                    sidebar.classList.toggle('collapsed');
                }
                if (mainContent) {
                    mainContent.classList.toggle('expanded');
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtnMgmt');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (['orders', 'inventory', 'users', 'payments', 'products'].includes(event.detail.key)) {
                this[event.detail.key] = event.detail.value;
                this.updateStats();
                if (event.detail.key === 'orders') {
                    this.loadRecentOrders();
                }
                if (event.detail.key === 'inventory') {
                    this.loadCriticalInventory();
                }
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

    updateStats: function() {
        // Total active orders
        const activeOrders = this.orders.filter(order => order.status !== 'Completado').length;
        document.getElementById('totalOrders').textContent = activeOrders;

        // Low stock items
        const lowStockItems = this.inventory.filter(item => 
            item.currentQuantity <= item.minThreshold
        ).length;
        document.getElementById('lowStockItems').textContent = lowStockItems;

        // Monthly revenue (simulate current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = this.orders
            .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear;
            })
            .reduce((total, order) => total + order.amount, 0);
        
        document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toLocaleString()}`;

        // Active users
        const activeUsers = this.users.filter(user => user.status === 'Activo').length;
        document.getElementById('activeUsers').textContent = activeUsers;
        
        // Products stats (admin-only)
        this.updateProductsStats();
    },
    
    updateProductsStats: function() {
        // Only update if products data exists
        if (!this.products || this.products.length === 0) {
            // Set default values if no products
            const totalProductsEl = document.getElementById('totalProducts');
            const inStockProductsEl = document.getElementById('inStockProducts');
            const lowStockProductsEl = document.getElementById('lowStockProducts');
            const outOfStockProductsEl = document.getElementById('outOfStockProducts');
            
            if (totalProductsEl) totalProductsEl.textContent = '0';
            if (inStockProductsEl) inStockProductsEl.textContent = '0';
            if (lowStockProductsEl) lowStockProductsEl.textContent = '0';
            if (outOfStockProductsEl) outOfStockProductsEl.textContent = '0';
            return;
        }
        
        // Calculate product statistics
        const totalProducts = this.products.length;
        const inStockProducts = this.products.filter(p => p.stock > p.minStock).length;
        const lowStockProducts = this.products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
        const outOfStockProducts = this.products.filter(p => p.stock === 0).length;
        
        // Update DOM elements
        const totalProductsEl = document.getElementById('totalProducts');
        const inStockProductsEl = document.getElementById('inStockProducts');
        const lowStockProductsEl = document.getElementById('lowStockProducts');
        const outOfStockProductsEl = document.getElementById('outOfStockProducts');
        
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (inStockProductsEl) inStockProductsEl.textContent = inStockProducts;
        if (lowStockProductsEl) lowStockProductsEl.textContent = lowStockProducts;
        if (outOfStockProductsEl) outOfStockProductsEl.textContent = outOfStockProducts;
    },

    loadRecentOrders: function() {
        const tableBody = document.getElementById('recentOrdersTable');
        if (!tableBody) return;

        if (this.orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox display-4 d-block mb-2"></i>
                        No hay pedidos registrados
                    </td>
                </tr>
            `;
            return;
        }

        // Sort orders by date (most recent first) and take first 5
        const recentOrders = [...this.orders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        tableBody.innerHTML = recentOrders.map(order => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.client}</td>
                <td>${order.product}</td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td><strong>$${order.amount.toLocaleString()}</strong></td>
            </tr>
        `).join('');
    },

    loadCriticalInventory: function() {
        const container = document.getElementById('criticalInventory');
        if (!container) return;

        const criticalItems = this.inventory.filter(item => 
            item.currentQuantity <= item.minThreshold
        );

        if (criticalItems.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-check-circle display-4 d-block mb-2"></i>
                    <p>Todos los materiales están en stock adecuado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = criticalItems.map(item => `
            <div class="inventory-item">
                <div>
                    <div class="inventory-item-name">${item.material}</div>
                    <div class="inventory-item-quantity">
                        ${item.currentQuantity} ${item.unit} disponible
                    </div>
                </div>
                <span class="status-badge status-${this.getInventoryStatusClass(item.status)}">
                    ${item.status}
                </span>
            </div>
        `).join('');
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
                if (shouldShow) {
                    el.style.display = '';
                    document.body.classList.add('role-administrador');
                } else {
                    el.style.display = 'none';
                    document.body.classList.remove('role-administrador');
                }
            });
        } else {
            // If no user, show admin elements by default (development mode)
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = '';
            });
            document.body.classList.add('role-administrador');
        }
    },

    getStatusClass: function(status) {
        const statusMap = {
            'Pendiente': 'pendiente',
            'En Progreso': 'proceso',
            'Completado': 'completado'
        };
        return statusMap[status] || 'pendiente';
    },

    getInventoryStatusClass: function(status) {
        const statusMap = {
            'Disponible': 'disponible',
            'Bajo inventario': 'bajo',
            'Agotado': 'agotado'
        };
        return statusMap[status] || 'disponible';
    },
    
    restoreAdminState: function() {
        // Check if admin state was preserved in session
        const wasAdmin = sessionStorage.getItem('isAdmin');
        if (wasAdmin === 'true') {
            document.body.classList.add('role-administrador');
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = '';
            });
        }
    },
    
    // Utility methods for other modules to call
    refreshStats: function() {
        this.loadData();
        this.updateStats();
        this.loadRecentOrders();
        this.loadCriticalInventory();
    },
    
    refreshData: function() {
        this.loadData();
        this.updateStats();
        this.loadRecentOrders();
        this.loadCriticalInventory();
    }
};
