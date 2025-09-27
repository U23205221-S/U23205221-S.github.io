/**
 * Payments Module
 * Handles payment processing, reconciliation, and financial management
 */

window.paymentsModule = {
    payments: [],
    filteredPayments: [],
    reconciliationData: [],
    
    init: function(data) {
        console.log('Payments module initialized');
        try {
            this.loadPayments();
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

    loadPayments: function() {
        this.payments = window.MobiliAriState.getState('payments') || this.getDefaultPayments();
        this.filteredPayments = [...this.payments];
        
        // Initialize with default data if empty
        if (window.MobiliAriState.getState('payments').length === 0) {
            window.MobiliAriState.updateState('payments', this.payments);
        }
    },

    getDefaultPayments: function() {
        return [
            {
                id: 1,
                type: 'ingreso',
                concept: 'Venta Mesa Comedor #001',
                amount: 15000,
                method: 'transferencia',
                status: 'pagado',
                date: '2024-01-15',
                dueDate: '2024-01-15',
                client: 'Juan Pérez',
                reference: 'TRF-001-2024',
                description: 'Pago por mesa de comedor rústica',
                orderId: 'ORD-001'
            },
            {
                id: 2,
                type: 'egreso',
                concept: 'Compra Madera Roble',
                amount: 8500,
                method: 'efectivo',
                status: 'pagado',
                date: '2024-01-10',
                dueDate: '2024-01-10',
                supplier: 'Maderas del Norte',
                reference: 'EFE-002-2024',
                description: 'Compra de madera para producción',
                purchaseId: 'PUR-001'
            },
            {
                id: 3,
                type: 'ingreso',
                concept: 'Anticipo Proyecto Oficina',
                amount: 25000,
                method: 'cheque',
                status: 'pendiente',
                date: '2024-01-20',
                dueDate: '2024-01-25',
                client: 'Empresa ABC',
                reference: 'CHE-003-2024',
                description: 'Anticipo 50% proyecto mobiliario oficina',
                orderId: 'ORD-002'
            },
            {
                id: 4,
                type: 'egreso',
                concept: 'Pago Servicios Enero',
                amount: 3200,
                method: 'transferencia',
                status: 'vencido',
                date: '2024-01-05',
                dueDate: '2024-01-31',
                supplier: 'Servicios Generales',
                reference: 'TRF-004-2024',
                description: 'Pago de servicios básicos del taller',
                serviceId: 'SER-001'
            },
            {
                id: 5,
                type: 'ingreso',
                concept: 'Venta Sillas Comedor',
                amount: 14000,
                method: 'tarjeta',
                status: 'pagado',
                date: '2024-01-18',
                dueDate: '2024-01-18',
                client: 'María González',
                reference: 'TAR-005-2024',
                description: 'Venta de 4 sillas tapizadas',
                orderId: 'ORD-003'
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
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const methodFilter = document.getElementById('methodFilter')?.value || '';
        const dateFrom = document.getElementById('dateFrom')?.value || '';
        const dateTo = document.getElementById('dateTo')?.value || '';
        const searchTerm = document.getElementById('searchPayments')?.value.toLowerCase() || '';

        this.filteredPayments = this.payments.filter(payment => {
            const matchesStatus = !statusFilter || payment.status === statusFilter;
            const matchesType = !typeFilter || payment.type === typeFilter;
            const matchesMethod = !methodFilter || payment.method === methodFilter;
            const matchesDateFrom = !dateFrom || payment.date >= dateFrom;
            const matchesDateTo = !dateTo || payment.date <= dateTo;
            const matchesSearch = !searchTerm || 
                payment.concept.toLowerCase().includes(searchTerm) ||
                payment.client?.toLowerCase().includes(searchTerm) ||
                payment.supplier?.toLowerCase().includes(searchTerm) ||
                payment.reference.toLowerCase().includes(searchTerm);

            return matchesStatus && matchesType && matchesMethod && 
                matchesDateFrom && matchesDateTo && matchesSearch;
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
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-${payment.type === 'ingreso' ? 'arrow-down-circle text-success' : 'arrow-up-circle text-danger'} me-2"></i>
                        <div>
                            <strong>${payment.concept}</strong>
                            <br>
                            <small class="text-muted">${payment.reference}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="payment-amount ${payment.type === 'ingreso' ? 'positive' : 'negative'}">
                        ${payment.type === 'ingreso' ? '+' : '-'}$${payment.amount.toLocaleString()}
                    </span>
                </td>
                <td>
                    <span class="payment-method method-${payment.method}">
                        <i class="bi bi-${this.getMethodIcon(payment.method)} me-1"></i>
                        ${this.getMethodName(payment.method)}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${payment.status}">
                        ${payment.status}
                    </span>
                </td>
                <td>${this.formatDate(payment.date)}</td>
                <td>${this.formatDate(payment.dueDate)}</td>
                <td>${payment.client || payment.supplier || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-view btn-view-payment" 
                                data-payment-id="${payment.id}" 
                                title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${payment.status === 'pendiente' ? `
                            <button class="btn btn-action btn-confirm btn-confirm-payment" 
                                    data-payment-id="${payment.id}" 
                                    title="Confirmar pago">
                                <i class="bi bi-check"></i>
                            </button>
                        ` : ''}
                        ${payment.status !== 'cancelado' && payment.status !== 'pagado' ? `
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
        const totalIncome = this.payments
            .filter(p => p.type === 'ingreso' && p.status === 'pagado')
            .reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = this.payments
            .filter(p => p.type === 'egreso' && p.status === 'pagado')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayments = this.payments
            .filter(p => p.status === 'pendiente').length;

        const overduePayments = this.payments
            .filter(p => p.status === 'vencido').length;

        // Update stat cards
        document.getElementById('totalIncome').textContent = `$${totalIncome.toLocaleString()}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toLocaleString()}`;
        document.getElementById('pendingPayments').textContent = pendingPayments;
        document.getElementById('overduePayments').textContent = overduePayments;

        // Update balance
        const balance = totalIncome - totalExpenses;
        const balanceElement = document.getElementById('currentBalance');
        if (balanceElement) {
            balanceElement.textContent = `$${balance.toLocaleString()}`;
            balanceElement.className = `payment-amount ${balance >= 0 ? 'positive' : 'negative'}`;
        }
    },

    showPaymentDetail: function(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        // Populate modal with payment details
        document.getElementById('detailConcept').textContent = payment.concept;
        document.getElementById('detailAmount').textContent = `$${payment.amount.toLocaleString()}`;
        document.getElementById('detailType').textContent = payment.type === 'ingreso' ? 'Ingreso' : 'Egreso';
        document.getElementById('detailMethod').textContent = this.getMethodName(payment.method);
        document.getElementById('detailStatus').textContent = payment.status;
        document.getElementById('detailDate').textContent = this.formatDate(payment.date);
        document.getElementById('detailDueDate').textContent = this.formatDate(payment.dueDate);
        document.getElementById('detailClient').textContent = payment.client || payment.supplier || '-';
        document.getElementById('detailReference').textContent = payment.reference;
        document.getElementById('detailDescription').textContent = payment.description || '-';

        const modal = new bootstrap.Modal(document.getElementById('paymentDetailModal'));
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
        
        // Setup method change listener
        this.setupPaymentMethodListener();

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    loadClientOptions: function() {
        const clientSelect = document.querySelector('#newPaymentForm [name="clientId"]');
        if (!clientSelect) return;
        
        // Get clients from orders module if available
        const orders = window.MobiliAriState.getState('orders') || [];
        const clients = [...new Set(orders.map(order => order.cliente).filter(Boolean))];
        
        clientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>' +
            clients.map(client => `<option value="${client}">${client}</option>`).join('');
    },
    
    setupPaymentMethodListener: function() {
        const methodSelect = document.querySelector('#newPaymentForm [name="method"]');
        const bankDetailsSection = document.getElementById('bankDetailsSection');
        
        if (!methodSelect || !bankDetailsSection) return;
        
        methodSelect.addEventListener('change', function() {
            if (this.value === 'Transferencia') {
                bankDetailsSection.style.display = 'block';
            } else {
                bankDetailsSection.style.display = 'none';
            }
        });
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
            type: 'Ingreso',
            concept: formData.get('concept'),
            amount: parseFloat(formData.get('amount')),
            method: formData.get('method'),
            status: formData.get('autoConfirm') ? 'Confirmado' : 'Pendiente',
            date: formData.get('paymentDate'),
            client: formData.get('clientId'),
            orderId: formData.get('orderId'),
            reference: formData.get('reference'),
            notes: formData.get('notes'),
            bankName: formData.get('bankName'),
            accountNumber: formData.get('accountNumber'),
            sendReceipt: formData.get('sendReceipt') === 'on'
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
            payment.status = 'pagado';
            payment.date = new Date().toISOString().split('T')[0];
            
            window.MobiliAriState.updateState('payments', this.payments);
            this.applyFilters();
            
            this.showAlert('success', 'Pago confirmado exitosamente');
        }
    },

    cancelPayment: function(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        if (confirm(`¿Cancelar el pago "${payment.concept}"?`)) {
            payment.status = 'cancelado';
            
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
