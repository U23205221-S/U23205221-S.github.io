/**
 * Payments Module
 * Handles payment processing, reconciliation, and financial management
 */

window.paymentsModule = {
    payments: [],
    filteredPayments: [],
    reconciliationData: [],
    
    init: async function(data) {
        console.log('Payments module initialized');
        try {
            await this.loadPayments();
            this.setupEventListeners();
            this.renderPayments();
            this.updateStats();
            this.updateUserInfo();
            this.loadReconciliationData();
            
            // Force show admin elements after initialization
            setTimeout(() => {
                this.forceShowAdminElements();
            }, 100);
        } catch (error) {
            console.error('Error initializing payments module:', error);
        }
    },

    loadPayments: async function() {
        let payments = window.MobiliAriState.getState('payments');

        if (!payments || payments.length === 0) {
            try {
                const response = await fetch('../data/payments.json');
                payments = await response.json();
                window.MobiliAriState.updateState('payments', payments);
            } catch (error) {
                console.error('Error loading payments:', error);
                payments = [];
            }
        }

        this.payments = payments;
        this.filteredPayments = [...this.payments];
    },


    setupEventListeners: function() {
        // Navigation
        const navLinks = document.querySelectorAll('[data-module]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                            e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'payments') {
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

        // Payment actions
        const newPaymentBtn = document.getElementById('newPaymentBtn');
        const reconcileBtn = document.getElementById('reconcileBtn');
        const exportBtn = document.getElementById('exportBtn');
        const createPaymentBtn = document.getElementById('createPaymentBtn');
        const confirmReconciliationBtn = document.getElementById('confirmReconciliationBtn');

        if (newPaymentBtn) {
            newPaymentBtn.addEventListener('click', () => {
                this.showNewPaymentModal();
            });
        }

        if (reconcileBtn) {
            reconcileBtn.addEventListener('click', () => {
                this.showReconciliationModal();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportOptions();
            });
        }

        if (createPaymentBtn) {
            createPaymentBtn.addEventListener('click', () => {
                this.createNewPayment();
            });
        }

        if (confirmReconciliationBtn) {
            confirmReconciliationBtn.addEventListener('click', () => {
                this.processReconciliation();
            });
        }
        
        // Modal close buttons
        const closeNewPaymentModalBtn = document.getElementById('closeNewPaymentModalBtn');
        const cancelNewPaymentBtn = document.getElementById('cancelNewPaymentBtn');
        const closeReconciliationModalBtn = document.getElementById('closeReconciliationModalBtn');
        const cancelReconciliationBtn = document.getElementById('cancelReconciliationBtn');
        
        if (closeNewPaymentModalBtn) {
            closeNewPaymentModalBtn.addEventListener('click', () => {
                this.closeNewPaymentModal();
            });
        }
        
        if (cancelNewPaymentBtn) {
            cancelNewPaymentBtn.addEventListener('click', () => {
                this.closeNewPaymentModal();
            });
        }
        
        if (closeReconciliationModalBtn) {
            closeReconciliationModalBtn.addEventListener('click', () => {
                this.closeReconciliationModal();
            });
        }
        
        if (cancelReconciliationBtn) {
            cancelReconciliationBtn.addEventListener('click', () => {
                this.closeReconciliationModal();
            });
        }
        
        // Modal backdrop clicks
        const newPaymentModal = document.getElementById('newPaymentModal');
        const reconciliationModal = document.getElementById('reconciliationModal');
        
        if (newPaymentModal) {
            newPaymentModal.addEventListener('click', (e) => {
                if (e.target === newPaymentModal) {
                    this.closeNewPaymentModal();
                }
            });
            
            newPaymentModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });
        }
        
        if (reconciliationModal) {
            reconciliationModal.addEventListener('click', (e) => {
                if (e.target === reconciliationModal) {
                    this.closeReconciliationModal();
                }
            });
            
            reconciliationModal.addEventListener('hidden.bs.modal', () => {
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
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        const methodFilter = document.getElementById('methodFilter');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const searchInput = document.getElementById('searchPayments');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }
        if (methodFilter) {
            methodFilter.addEventListener('change', () => this.applyFilters());
        }
        if (dateFrom) {
            dateFrom.addEventListener('change', () => this.applyFilters());
        }
        if (dateTo) {
            dateTo.addEventListener('change', () => this.applyFilters());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        // Payment table actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-payment')) {
                const paymentId = parseInt(e.target.getAttribute('data-payment-id'));
                this.showPaymentDetail(paymentId);
            } else if (e.target.classList.contains('btn-confirm-payment')) {
                const paymentId = parseInt(e.target.getAttribute('data-payment-id'));
                this.confirmPayment(paymentId);
            } else if (e.target.classList.contains('btn-cancel-payment')) {
                const paymentId = parseInt(e.target.getAttribute('data-payment-id'));
                this.cancelPayment(paymentId);
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

    applyFilters: function() {
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const methodFilter = document.getElementById('methodFilter')?.value || '';
        const clientSearch = document.getElementById('clientSearch')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';

        this.filteredPayments = this.payments.filter(payment => {
            const matchesStatus = !statusFilter || payment.paymentStatusName === statusFilter;
            const matchesMethod = !methodFilter || payment.paymentMethodName === methodFilter;
            const matchesClient = !clientSearch || payment.clientName.toLowerCase().includes(clientSearch);
            const matchesDate = !dateFilter || payment.paymentDate === dateFilter;

            return matchesStatus && matchesMethod && matchesClient && matchesDate;
        });

        this.renderPayments();
        this.updateStats();
    },

    renderPayments: function() {
        const tableBody = document.getElementById('paymentsTableBody');
        if (!tableBody) return;

        if (this.filteredPayments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <div class="empty-state">
                            <i class="bi bi-credit-card display-4 text-muted mb-3"></i>
                            <p class="text-muted">No se encontraron pagos</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredPayments.map(payment => `
            <tr>
                <td>${payment.clientName || '-'}</td>
                <td>${payment.orderId || '-'}</td>
                <td>$${(payment.total || 0).toLocaleString()}</td>
                <td>${payment.currency || 'N/A'}</td>
                <td>${this.formatDate(payment.paymentDate)}</td>
                <td>${this.formatDate(payment.processingDate)}</td>
                <td>${this.formatDate(payment.completionDate)}</td>
                <td><span class="status-badge status-${payment.paymentStatusName?.toLowerCase()}">${payment.paymentStatusName || '-'}</span></td>
                <td>${payment.paymentMethodName || '-'}</td>
                <td>${payment.paymentFormName || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-view btn-view-payment" 
                                data-payment-id="${payment.id}" 
                                title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${payment.paymentStatusName === 'Pendiente' ? `
                            <button class="btn btn-action btn-confirm btn-confirm-payment" 
                                    data-payment-id="${payment.id}" 
                                    title="Confirmar pago">
                                <i class="bi bi-check"></i>
                            </button>
                        ` : ''}
                        ${payment.paymentStatusName !== 'Cancelado' && payment.paymentStatusName !== 'Pagado' ? `
                            <button class="btn btn-action btn-cancel btn-cancel-payment" 
                                    data-payment-id="${payment.id}" 
                                    title="Cancelar">
                                <i class="bi bi-x"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStats: function() {
        const totalRevenue = this.payments
            .filter(p => p.paymentStatusName === 'Pagado')
            .reduce((sum, p) => sum + p.total, 0);

        const paidPayments = this.payments.filter(p => p.paymentStatusName === 'Pagado').length;
        const pendingPayments = this.payments.filter(p => p.paymentStatusName === 'Pendiente').length;
        const overduePayments = this.payments.filter(p => p.paymentStatusName === 'Vencido').length;

        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('paidPayments').textContent = paidPayments;
        document.getElementById('pendingPayments').textContent = pendingPayments;
        document.getElementById('overduePayments').textContent = overduePayments;
    },

    showPaymentDetail: function(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        let content = `
            <p><strong>Cliente:</strong> ${payment.clientName}</p>
            <p><strong>Pedido:</strong> ${payment.orderId}</p>
            <p><strong>Total:</strong> $${payment.total.toLocaleString()} ${payment.currency}</p>
            <hr>
            <p><strong>Fecha de Pago:</strong> ${this.formatDate(payment.paymentDate)}</p>
            <p><strong>Fecha de Procesamiento:</strong> ${this.formatDate(payment.processingDate)}</p>
            <p><strong>Fecha de Finalización:</strong> ${this.formatDate(payment.completionDate)}</p>
            <hr>
            <p><strong>Estado:</strong> ${payment.paymentStatusName}</p>
            <p><strong>Método:</strong> ${payment.paymentMethodName}</p>
            <p><strong>Forma de Pago:</strong> ${payment.paymentFormName}</p>
            <p><strong>Concepto:</strong> ${payment.concept}</p>
            <p><strong>Referencia:</strong> ${payment.reference}</p>
        `;

        document.getElementById('paymentModalTitle').textContent = `Detalle del Pago #${payment.id}`;
        document.getElementById('paymentModalContent').innerHTML = content;

        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    },

    showNewPaymentModal: function() {
        console.log('Abriendo modal de nuevo pago...');
        const modal = document.getElementById('newPaymentModal');
        const form = document.getElementById('newPaymentForm');
        
        if (!modal) {
            console.error('Modal newPaymentModal no encontrado');
            return;
        }
        
        if (!form) {
            console.error('Formulario newPaymentForm no encontrado');
            return;
        }
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Load clients into select
        this.loadClientOptions();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const paymentDateField = form.querySelector('[name="paymentDate"]');
        
        if (paymentDateField) paymentDateField.value = today;
        
        // Obsolete listener removed

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    loadClientOptions: function() {
        const clientSelect = document.querySelector('#newPaymentForm [name="clientName"]');
        if (!clientSelect) return;
        
        // Get clients from a predefined list or state
        const clients = ['Juan Pérez', 'Empresa ABC', 'María González', 'Nuevo Cliente']; // Example list
        
        clientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>' +
            clients.map(client => `<option value="${client}">${client}</option>`).join('');
    },
    

    createNewPayment: function() {
        const form = document.getElementById('newPaymentForm');
        const formData = new FormData(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newPayment = {
            id: Math.max(...this.payments.map(p => p.id), 0) + 1,
            clientName: formData.get('clientName'),
            orderId: formData.get('orderId'),
            total: parseFloat(formData.get('total')),
            currency: formData.get('currency'),
            paymentDate: formData.get('paymentDate'),
            processingDate: formData.get('processingDate'),
            completionDate: formData.get('completionDate'),
            paymentStatusName: formData.get('paymentStatusName'),
            paymentMethodName: formData.get('paymentMethodName'),
            paymentFormName: formData.get('paymentFormName'),
            sendReceipt: formData.get('sendReceipt') === 'on',
            // Add default values for fields not in the new form
            type: 'ingreso',
            concept: `Pago de ${formData.get('clientName')} para pedido ${formData.get('orderId') || 'N/A'}`,
            reference: `REF-${Date.now()}`
        };

        this.payments.push(newPayment);
        window.MobiliAriState.updateState('payments', this.payments);
        
        this.applyFilters();
        
        // Close modal
        this.closeNewPaymentModal();
        
        this.showAlert('success', 'Pago registrado exitosamente');
    },

    confirmPayment: function(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        if (confirm(`¿Confirmar el pago "${payment.concept}"?`)) {
            payment.paymentStatusName = 'Pagado';
            payment.completionDate = new Date().toISOString().split('T')[0];
            
            window.MobiliAriState.updateState('payments', this.payments);
            this.applyFilters();
            
            this.showAlert('success', 'Pago confirmado exitosamente');
        }
    },

    cancelPayment: function(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        if (confirm(`¿Cancelar el pago "${payment.concept}"?`)) {
            payment.paymentStatusName = 'Cancelado';
            
            window.MobiliAriState.updateState('payments', this.payments);
            this.applyFilters();
            
            this.showAlert('warning', 'Pago cancelado');
        }
    },

    loadReconciliationData: function() {
        // Simulate bank reconciliation data
        this.reconciliationData = [
            {
                id: 1,
                date: '2024-01-15',
                description: 'TRANSFERENCIA JUAN PEREZ',
                amount: 15000,
                matched: true,
                paymentId: 1
            },
            {
                id: 2,
                date: '2024-01-18',
                description: 'PAGO TARJETA MARIA GONZALEZ',
                amount: 14000,
                matched: true,
                paymentId: 5
            },
            {
                id: 3,
                date: '2024-01-20',
                description: 'DEPOSITO EMPRESA ABC',
                amount: 25000,
                matched: false,
                paymentId: null
            }
        ];
    },

    showReconciliationModal: function() {
        this.renderReconciliationList();
        const modal = new bootstrap.Modal(document.getElementById('reconciliationModal'));
        modal.show();
    },
    
    closeNewPaymentModal: function() {
        const modal = document.getElementById('newPaymentModal');
        
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
            console.error('Error closing new payment modal:', error);
            this.forceCloseModal('newPaymentModal');
        }
        
        // Reset form
        const form = document.getElementById('newPaymentForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de nuevo pago cerrado');
    },
    
    closeReconciliationModal: function() {
        const modal = document.getElementById('reconciliationModal');
        
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
            console.error('Error closing reconciliation modal:', error);
            this.forceCloseModal('reconciliationModal');
        }
        
        console.log('Modal de conciliación cerrado');
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

    renderReconciliationList: function() {
        const container = document.getElementById('reconciliationList');
        if (!container) return;

        container.innerHTML = this.reconciliationData.map(item => `
            <div class="reconciliation-item ${item.matched ? 'matched' : 'unmatched'}">
                <div>
                    <div class="reconciliation-amount">$${item.amount.toLocaleString()}</div>
                    <div>${item.description}</div>
                    <div class="reconciliation-date">${this.formatDate(item.date)}</div>
                </div>
                <div>
                    <span class="reconciliation-status ${item.matched ? 'matched' : 'unmatched'}">
                        ${item.matched ? 'Conciliado' : 'Pendiente'}
                    </span>
                </div>
            </div>
        `).join('');
    },

    processReconciliation: function() {
        // Simulate reconciliation process
        this.showAlert('info', 'Procesando conciliación...');
        
        setTimeout(() => {
            const unmatched = this.reconciliationData.filter(item => !item.matched);
            const matched = unmatched.length;
            
            // Mark all as matched for demo
            this.reconciliationData.forEach(item => item.matched = true);
            
            this.renderReconciliationList();
            this.showAlert('success', `Conciliación completada. ${matched} elementos conciliados.`);
        }, 2000);
    },

    showExportOptions: function() {
        const exportMenu = document.createElement('div');
        exportMenu.className = 'position-fixed bg-white border rounded shadow-lg p-3';
        exportMenu.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 200px;';
        exportMenu.innerHTML = `
            <h6 class="mb-3">Exportar Pagos</h6>
            <div class="export-options">
                <a href="#" class="export-btn d-block mb-2" onclick="paymentsModule.exportData('pdf')">
                    <i class="bi bi-file-pdf me-2"></i>PDF
                </a>
                <a href="#" class="export-btn d-block mb-2" onclick="paymentsModule.exportData('excel')">
                    <i class="bi bi-file-excel me-2"></i>Excel
                </a>
                <a href="#" class="export-btn d-block" onclick="paymentsModule.exportData('csv')">
                    <i class="bi bi-file-csv me-2"></i>CSV
                </a>
            </div>
        `;
        
        document.body.appendChild(exportMenu);
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function removeMenu(e) {
                if (!exportMenu.contains(e.target)) {
                    exportMenu.remove();
                    document.removeEventListener('click', removeMenu);
                }
            });
        }, 100);
    },

    exportData: function(format) {
        const fileName = `pagos_${new Date().toISOString().split('T')[0]}.${format}`;
        this.showAlert('success', `Exportando pagos en formato ${format.toUpperCase()}...`);
        
        // Remove export menu
        const exportMenu = document.querySelector('.position-fixed.bg-white.border.rounded.shadow-lg');
        if (exportMenu) {
            exportMenu.remove();
        }
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
                el.style.display = shouldShow ? 'block' : 'none';
            });
        } else {
            // If no user, show admin elements by default (development mode)
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
        }
    },

    forceShowAdminElements: function() {
        console.log('🔧 Forcing admin elements to show...');
        const adminElements = document.querySelectorAll('.admin-only');
        console.log('📋 Found admin elements:', adminElements.length);
        
        adminElements.forEach((el, index) => {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            console.log(`✅ Showing element ${index}:`, el.textContent.trim());
        });
        
        // Also ensure the payments link is active
        const paymentsLink = document.querySelector('[data-module="payments"]');
        if (paymentsLink) {
            paymentsLink.classList.add('active');
            console.log('✅ Payments link activated');
        }
    },

    // Helper functions
    getMethodIcon: function(method) {
        const icons = {
            'efectivo': 'cash',
            'transferencia': 'bank',
            'tarjeta': 'credit-card',
            'cheque': 'receipt'
        };
        return icons[method] || 'cash';
    },

    getMethodName: function(method) {
        const names = {
            'efectivo': 'Efectivo',
            'transferencia': 'Transferencia',
            'tarjeta': 'Tarjeta',
            'cheque': 'Cheque'
        };
        return names[method] || method;
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
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

// Initialize module when loaded (only if not in micro frontend environment)
if (typeof window.MicroFrontendRouter === 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.paymentsModule.init();
        });
    } else {
        window.paymentsModule.init();
    }
}

// Global emergency function for payments modals
window.emergencyClosePaymentsModals = function() {
    if (window.paymentsModule) {
        console.log('🚨 Cerrando modales de pagos de emergencia...');
        
        try {
            window.paymentsModule.forceCloseModal('newPaymentModal');
            window.paymentsModule.forceCloseModal('reconciliationModal');
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
        
        console.log('✅ Modales de pagos cerrados');
    }
};
