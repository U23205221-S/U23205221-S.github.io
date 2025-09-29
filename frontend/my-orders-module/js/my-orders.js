/**
 * My Orders Module
 * Handles client order history, tracking, and management
 */

window.myOrdersModule = {
    orders: [],
    filteredOrders: [],
    currentUser: null,
    
    init: function(data) {
        console.log('My Orders module initialized');
        this.currentUser = window.MobiliAriState.currentUser;
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        this.updateStats();
        this.updateUserInfo();
        this.updateCartCount();
    },

    loadOrders: function() {
        // Get all orders and filter by current user
        const allOrders = window.MobiliAriState.getState('orders') || [];
        this.orders = allOrders.filter(order => 
            order.clientId === this.currentUser?.id || 
            order.clientEmail === this.currentUser?.email
        );
        this.filteredOrders = [...this.orders];
        
        // If no orders, create some sample orders for demo
        if (this.orders.length === 0) {
            this.createSampleOrders();
        }
    },

    createSampleOrders: function() {
        const sampleOrders = [
            {
                id: 'ORD-001',
                clientId: this.currentUser?.id,
                clientEmail: this.currentUser?.email,
                clientName: this.currentUser?.name,
                date: '2025-09-25',
                status: 'completado',
                deliveryDate: '2025-10-05',
                total: 15000,
                products: [
                    {
                        id: 1,
                        name: 'Mesa de Comedor Rústica',
                        quantity: 1,
                        price: 15000,
                        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                        customizations: ['Material: Roble', 'Dimensiones: 200x100x75 cm']
                    }
                ],
                notes: 'Pedido completado satisfactoriamente'
            },
            {
                id: 'ORD-002',
                clientId: this.currentUser?.id,
                clientEmail: this.currentUser?.email,
                clientName: this.currentUser?.name,
                date: '2025-09-28',
                status: 'en_proceso',
                deliveryDate: '2025-10-15',
                total: 8500,
                products: [
                    {
                        id: 2,
                        name: 'Silla Moderna Tapizada',
                        quantity: 4,
                        price: 2000,
                        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                        customizations: ['Material: Cedro', 'Tapizado: Cuero negro']
                    },
                    {
                        id: 3,
                        name: 'Mesa Auxiliar',
                        quantity: 1,
                        price: 500,
                        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                        customizations: ['Material: Pino']
                    }
                ],
                notes: 'En proceso de fabricación'
            },
            {
                id: 'ORD-003',
                clientId: this.currentUser?.id,
                clientEmail: this.currentUser?.email,
                clientName: this.currentUser?.name,
                date: '2025-09-29',
                status: 'pendiente',
                deliveryDate: '2025-10-20',
                total: 25000,
                products: [
                    {
                        id: 4,
                        name: 'Closet Personalizado',
                        quantity: 1,
                        price: 25000,
                        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                        customizations: ['Material: MDF', 'Dimensiones: 300x200x60 cm', 'Puertas corredizas']
                    }
                ],
                notes: 'Esperando confirmación de medidas'
            }
        ];

        // Add sample orders to global state
        const existingOrders = window.MobiliAriState.getState('orders') || [];
        const updatedOrders = [...existingOrders, ...sampleOrders];
        window.MobiliAriState.updateState('orders', updatedOrders);
        
        this.orders = sampleOrders;
        this.filteredOrders = [...this.orders];
    },

    setupEventListeners: function() {
        // Navigation
        const brandLink = document.getElementById('brandLink');
        const catalogNavLink = document.getElementById('catalogNavLink');
        const customizeNavLink = document.getElementById('customizeNavLink');
        const cartBtn = document.getElementById('cartBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (brandLink) {
            brandLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToModule('catalog');
            });
        }

        if (catalogNavLink) {
            catalogNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToModule('catalog');
            });
        }

        if (customizeNavLink) {
            customizeNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToModule('customization');
            });
        }

        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToModule('cart');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Handle data-module links (like empty state button)
        const dataModuleLinks = document.querySelectorAll('[data-module]');
        dataModuleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                            e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'my-orders') {
                    this.navigateToModule(module);
                }
            });
        });

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchOrders = document.getElementById('searchOrders');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
        if (searchOrders) {
            searchOrders.addEventListener('input', () => this.applyFilters());
        }
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }
        if (refreshOrdersBtn) {
            refreshOrdersBtn.addEventListener('click', () => this.refreshOrders());
        }

        // Reorder button
        const reorderBtn = document.getElementById('reorderBtn');
        if (reorderBtn) {
            reorderBtn.addEventListener('click', () => this.reorderItems());
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'orders') {
                this.loadOrders();
                this.renderOrders();
                this.updateStats();
            } else if (event.detail.key === 'cart') {
                this.updateCartCount();
            }
        });
    },

    navigateToModule: function(module) {
        window.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { module: module }
        }));
    },

    updateCartCount: function() {
        const cart = window.MobiliAriState.getState('cart') || [];
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
    },

    applyFilters: function() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        const searchTerm = document.getElementById('searchOrders')?.value.toLowerCase() || '';

        this.filteredOrders = this.orders.filter(order => {
            const matchesStatus = !statusFilter || order.status === statusFilter;
            const matchesSearch = !searchTerm || 
                order.id.toLowerCase().includes(searchTerm) ||
                order.products.some(p => p.name.toLowerCase().includes(searchTerm));
            
            let matchesDate = true;
            if (dateFilter) {
                const orderDate = new Date(order.date);
                const today = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = orderDate.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = orderDate >= weekAgo;
                        break;
                    case 'month':
                        matchesDate = orderDate.getMonth() === today.getMonth() && 
                                    orderDate.getFullYear() === today.getFullYear();
                        break;
                    case 'year':
                        matchesDate = orderDate.getFullYear() === today.getFullYear();
                        break;
                }
            }

            return matchesStatus && matchesSearch && matchesDate;
        });

        this.renderOrders();
        this.updateStats();
    },

    renderOrders: function() {
        const tableBody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tableBody) return;

        if (this.filteredOrders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="bi bi-search text-muted me-2"></i>
                        No se encontraron pedidos con los filtros aplicados
                    </td>
                </tr>
            `;
            if (this.orders.length === 0 && emptyState) {
                emptyState.classList.remove('d-none');
            }
            return;
        }

        if (emptyState) {
            emptyState.classList.add('d-none');
        }

        tableBody.innerHTML = this.filteredOrders.map(order => `
            <tr class="fade-in">
                <td>
                    <strong>${order.id}</strong>
                </td>
                <td>${this.formatDate(order.date)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${order.products[0]?.image || '/images/placeholder.jpg'}" 
                             alt="Producto" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;">
                        <div>
                            <div class="fw-bold">${order.products[0]?.name}</div>
                            ${order.products.length > 1 ? `<small class="text-muted">+${order.products.length - 1} más</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <strong class="text-wood">$${order.total.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${this.getStatusText(order.status)}
                    </span>
                </td>
                <td>${this.formatDate(order.deliveryDate)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-action btn-outline-primary" 
                                onclick="myOrdersModule.showOrderDetail('${order.id}')" 
                                title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-action btn-outline-success" 
                                onclick="myOrdersModule.reorder('${order.id}')" 
                                title="Volver a pedir">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStats: function() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'pendiente').length;
        const inProcessOrders = this.orders.filter(o => o.status === 'en_proceso').length;
        const completedOrders = this.orders.filter(o => o.status === 'completado').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingOrders').textContent = pendingOrders;
        document.getElementById('inProcessOrders').textContent = inProcessOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
    },

    updateUserInfo: function() {
        // This function can be used to update user info if needed
        // Currently not needed for this design
    },

    showOrderDetail: function(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modalContent = document.getElementById('orderDetailContent');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="order-detail-section">
                <h6><i class="bi bi-info-circle me-2"></i>Información del Pedido</h6>
                <div class="detail-item">
                    <span class="detail-label">ID del Pedido:</span>
                    <span class="detail-value"><strong>${order.id}</strong></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fecha del Pedido:</span>
                    <span class="detail-value">${this.formatDate(order.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Estado:</span>
                    <span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Fecha de Entrega:</span>
                    <span class="detail-value">${this.formatDate(order.deliveryDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value"><strong class="text-wood">$${order.total.toLocaleString()}</strong></span>
                </div>
            </div>

            <div class="order-detail-section">
                <h6><i class="bi bi-box me-2"></i>Productos</h6>
                ${order.products.map(product => `
                    <div class="product-item">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-details">
                                Cantidad: ${product.quantity} | 
                                Precio unitario: $${product.price.toLocaleString()}
                                ${product.customizations ? `<br><small class="text-muted">${product.customizations.join(', ')}</small>` : ''}
                            </div>
                        </div>
                        <div class="product-price">
                            $${(product.price * product.quantity).toLocaleString()}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${order.notes ? `
                <div class="order-detail-section">
                    <h6><i class="bi bi-chat-dots me-2"></i>Notas</h6>
                    <p class="text-muted">${order.notes}</p>
                </div>
            ` : ''}
        `;

        // Store current order for reorder functionality
        this.currentOrderDetail = order;

        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();
    },

    reorder: function(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Add products to cart
        const cart = window.MobiliAriState.getState('cart') || [];
        order.products.forEach(product => {
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += product.quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    image: product.image,
                    customizations: product.customizations || []
                });
            }
        });

        window.MobiliAriState.updateState('cart', cart);
        this.showAlert('success', `Productos del pedido ${orderId} agregados al carrito`);
    },

    reorderItems: function() {
        if (this.currentOrderDetail) {
            this.reorder(this.currentOrderDetail.id);
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailModal'));
            modal.hide();
        }
    },

    refreshOrders: function() {
        this.loadOrders();
        this.renderOrders();
        this.updateStats();
        this.showAlert('info', 'Pedidos actualizados');
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    getStatusText: function(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_proceso': 'En Proceso',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
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
        if (window.myOrdersModule) {
            window.myOrdersModule.init();
        }
    });
} else {
    if (window.myOrdersModule) {
        window.myOrdersModule.init();
    }
}
