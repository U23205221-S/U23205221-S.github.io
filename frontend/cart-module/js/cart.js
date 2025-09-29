/**
 * Cart Module
 * Handles shopping cart functionality, checkout process, and order creation
 */

window.cartModule = {
    cart: [],
    currentUser: null,
    
    init: function(data) {
        console.log('Cart module initialized');
        this.currentUser = window.MobiliAriState.currentUser;
        this.loadCart();
        this.setupEventListeners();
        this.renderCart();
        this.updateSummary();
        this.updateCartCount();
    },

    loadCart: function() {
        this.cart = window.MobiliAriState.getState('cart') || [];
    },

    setupEventListeners: function() {
        // Navigation
        const brandLink = document.getElementById('brandLink');
        const catalogNavLink = document.getElementById('catalogNavLink');
        const customizeNavLink = document.getElementById('customizeNavLink');
        const myOrdersNavLink = document.getElementById('myOrdersNavLink');
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

        if (myOrdersNavLink) {
            myOrdersNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToModule('my-orders');
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Handle data-module links (like continue shopping button)
        const dataModuleLinks = document.querySelectorAll('[data-module]');
        dataModuleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                            e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'cart') {
                    this.navigateToModule(module);
                }
            });
        });

        // Clear cart
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                this.clearCart();
            });
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.showCheckoutModal();
            });
        }

        // Confirm order
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', () => {
                this.confirmOrder();
            });
        }

        // Listen for cart updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'cart') {
                this.loadCart();
                this.renderCart();
                this.updateSummary();
                this.updateCartCount();
            }
        });
    },

    navigateToModule: function(module) {
        window.dispatchEvent(new CustomEvent('navigate-to-module', {
            detail: { module: module }
        }));
    },

    renderCart: function() {
        const cartItemsList = document.getElementById('cartItemsList');
        const emptyCartState = document.getElementById('emptyCartState');
        const cartItemCount = document.getElementById('cartItemCount');
        
        if (!cartItemsList) return;

        if (this.cart.length === 0) {
            cartItemsList.innerHTML = '';
            if (emptyCartState) {
                emptyCartState.classList.remove('d-none');
            }
            if (cartItemCount) {
                cartItemCount.textContent = '0';
            }
            return;
        }

        if (emptyCartState) {
            emptyCartState.classList.add('d-none');
        }
        
        if (cartItemCount) {
            cartItemCount.textContent = this.cart.length;
        }

        cartItemsList.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item d-flex align-items-center fade-in">
                <img src="${item.image || '/images/placeholder.jpg'}" 
                     alt="${item.name}" class="cart-item-image">
                
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        Precio unitario: $${item.price.toLocaleString()}
                    </div>
                    ${item.customizations && item.customizations.length > 0 ? `
                        <div class="cart-item-customizations">
                            ${item.customizations.join(', ')}
                        </div>
                    ` : ''}
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cartModule.updateQuantity(${index}, ${item.quantity - 1})">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               min="1" onchange="cartModule.updateQuantity(${index}, this.value)">
                        <button class="quantity-btn" onclick="cartModule.updateQuantity(${index}, ${item.quantity + 1})">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="text-end">
                    <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString()}</div>
                    <button class="remove-item-btn mt-2" onclick="cartModule.removeItem(${index})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    updateQuantity: function(index, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (quantity < 1) {
            this.removeItem(index);
            return;
        }

        this.cart[index].quantity = quantity;
        window.MobiliAriState.updateState('cart', this.cart);
    },

    removeItem: function(index) {
        this.cart.splice(index, 1);
        window.MobiliAriState.updateState('cart', this.cart);
        this.showAlert('info', 'Producto eliminado del carrito');
    },

    clearCart: function() {
        if (this.cart.length === 0) return;
        
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            this.cart = [];
            window.MobiliAriState.updateState('cart', this.cart);
            this.showAlert('info', 'Carrito vaciado');
        }
    },

    updateSummary: function() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.cart.length > 0 ? 500 : 0;
        const tax = subtotal * 0.16; // 16% IVA
        const total = subtotal + shipping + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toLocaleString()}`;
        document.getElementById('shipping').textContent = `$${shipping.toLocaleString()}`;
        document.getElementById('tax').textContent = `$${tax.toLocaleString()}`;
        document.getElementById('total').textContent = `$${total.toLocaleString()}`;

        // Enable/disable checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    },

    showCheckoutModal: function() {
        if (this.cart.length === 0) {
            this.showAlert('warning', 'Tu carrito está vacío');
            return;
        }

        // Set minimum delivery date (3 days from now)
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 3);
        const deliveryDateInput = document.querySelector('[name="deliveryDate"]');
        if (deliveryDateInput) {
            deliveryDateInput.min = minDate.toISOString().split('T')[0];
            deliveryDateInput.value = minDate.toISOString().split('T')[0];
        }

        // Pre-fill user info if available
        if (this.currentUser) {
            const fullNameInput = document.querySelector('[name="fullName"]');
            if (fullNameInput) {
                fullNameInput.value = this.currentUser.name || '';
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        modal.show();
    },

    confirmOrder: function() {
        const form = document.getElementById('checkoutForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const orderData = {
            id: 'ORD-' + Date.now(),
            clientId: this.currentUser?.id,
            clientEmail: this.currentUser?.email,
            clientName: this.currentUser?.name,
            date: new Date().toISOString().split('T')[0],
            status: 'pendiente',
            deliveryDate: formData.get('deliveryDate'),
            total: this.calculateTotal(),
            products: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                customizations: item.customizations || []
            })),
            deliveryInfo: {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                address: formData.get('address')
            },
            notes: formData.get('notes') || ''
        };

        // Add order to global state
        const orders = window.MobiliAriState.getState('orders') || [];
        orders.push(orderData);
        window.MobiliAriState.updateState('orders', orders);

        // Clear cart
        this.cart = [];
        window.MobiliAriState.updateState('cart', this.cart);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        modal.hide();

        // Show success message
        this.showAlert('success', `¡Pedido ${orderData.id} creado exitosamente!`);

        // Navigate to orders after a delay
        setTimeout(() => {
            this.navigateToModule('my-orders');
        }, 2000);
    },

    calculateTotal: function() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.cart.length > 0 ? 500 : 0;
        const tax = subtotal * 0.16;
        return subtotal + shipping + tax;
    },

    updateCartCount: function() {
        const cartCount = document.getElementById('cartCount');
        const cartItemCount = document.getElementById('cartItemCount');
        
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }
        if (cartItemCount) {
            cartItemCount.textContent = this.cart.length;
        }
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : type === 'info' ? 'info' : type === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-triangle'} me-2"></i>
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
        if (window.cartModule) {
            window.cartModule.init();
        }
    });
} else {
    if (window.cartModule) {
        window.cartModule.init();
    }
}
