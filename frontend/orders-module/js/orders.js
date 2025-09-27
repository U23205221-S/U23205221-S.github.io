/**
 * Orders Module
 * Handles order management, kanban board, and task tracking
 */

window.ordersModule = {
    orders: [],
    filteredOrders: [],
    sortableInstances: {},
    
    init: function(data) {
        console.log('Orders module initialized');
        this.loadOrders();
        this.setupEventListeners();
        this.setupKanbanBoard();
        this.renderOrders();
        this.updateUserInfo();
    },

    loadOrders: function() {
        this.orders = window.MobiliAriState.getState('orders') || this.getDefaultOrders();
        this.filteredOrders = [...this.orders];
        
        // Initialize with default data if empty
        if (window.MobiliAriState.getState('orders').length === 0) {
            window.MobiliAriState.updateState('orders', this.orders);
        }
    },

    getDefaultOrders: function() {
        return [
            {
                id: 'ORD-001',
                client: 'Juan Pérez',
                product: 'Mesa de Comedor Personalizada',
                status: 'Emitido',
                date: '2025-01-15',
                deliveryDate: '2025-02-15',
                amount: 16500,
                paidAmount: 0,
                customizations: 'Dimensiones: 180x90x75cm, Material: Roble, Acabado: Barniz mate',
                assignedTo: '',
                progress: 10,
                notes: ['Cliente debe seleccionar acabado final', 'Pendiente primer pago 50%'],
                priority: 'high',
                type: 'personalizado'
            },
            {
                id: 'ORD-002',
                client: 'María González',
                product: 'Armario de Dormitorio Personalizado',
                status: 'En Producción',
                date: '2025-01-10',
                deliveryDate: '2025-02-10',
                amount: 28000,
                paidAmount: 14000,
                customizations: 'Dimensiones: 200x60x220cm, Material: MDF, Acabado: Pintura blanca',
                assignedTo: 'Carlos Mendoza',
                progress: 60,
                notes: ['Corte completado', 'Ensamblaje en proceso', 'Pintura programada para mañana'],
                priority: 'medium',
                type: 'personalizado'
            },
            {
                id: 'ORD-003',
                client: 'Roberto Silva',
                product: 'Escritorio Ejecutivo',
                status: 'Finalizado',
                date: '2025-01-05',
                deliveryDate: '2025-01-20',
                amount: 13500,
                paidAmount: 13500,
                customizations: 'Dimensiones: 160x80x75cm, Material: Cedro, Acabado: Barniz brillante',
                assignedTo: 'Luis Torres',
                progress: 100,
                notes: ['Entregado satisfactoriamente', 'Cliente muy satisfecho', 'Producto personalizado completado'],
                priority: 'low',
                type: 'personalizado'
            },
            {
                id: 'ORD-004',
                client: 'Ana Martínez',
                product: 'Sofá de Sala Personalizado',
                status: 'Pendiente',
                date: '2025-01-16',
                deliveryDate: '2025-02-20',
                amount: 24000,
                paidAmount: 12000,
                customizations: 'Dimensiones: 220x90x85cm, Material: Pino y Tela, Color: Azul marino',
                assignedTo: 'María Rodriguez',
                progress: 85,
                notes: ['Producto construido', 'Esperando pago del 50% restante', 'Cliente confirmado para entrega'],
                priority: 'medium',
                type: 'personalizado'
            },
            {
                id: 'ORD-005',
                client: 'Pedro Ramirez',
                product: 'Mesa de Centro Prefabricada',
                status: 'Pagado',
                date: '2025-01-18',
                deliveryDate: '2025-01-25',
                amount: 8500,
                paidAmount: 8500,
                customizations: 'Producto en stock - Sin personalizaciones',
                assignedTo: 'Equipo de Entrega',
                progress: 100,
                notes: ['Producto prefabricado', 'Pago completo recibido', 'Listo para entrega'],
                priority: 'low',
                type: 'prefabricado'
            },
            {
                id: 'ORD-006',
                client: 'Laura Vega',
                product: 'Librero Modular',
                status: 'Entregando',
                date: '2025-01-12',
                deliveryDate: '2025-01-22',
                amount: 15000,
                paidAmount: 15000,
                customizations: 'Dimensiones: 180x30x200cm, Material: Melamina, Color: Blanco',
                assignedTo: 'Equipo de Entrega',
                progress: 100,
                notes: ['Coordinando entrega para el sábado', 'Cliente disponible de 9am a 2pm'],
                priority: 'high',
                type: 'personalizado'
            },
            {
                id: 'ORD-007',
                client: 'Diego Morales',
                product: 'Cama King Size Personalizada',
                status: 'Construido',
                date: '2025-01-08',
                deliveryDate: '2025-02-08',
                amount: 32000,
                paidAmount: 16000,
                customizations: 'Dimensiones: 200x200x120cm, Material: Roble, Cabecera tapizada',
                assignedTo: 'Ana Gutierrez',
                progress: 90,
                notes: ['Producto terminado', 'Pendiente pago final', 'Calidad verificada'],
                priority: 'medium',
                type: 'personalizado'
            },
            {
                id: 'ORD-008',
                client: 'Carmen Flores',
                product: 'Juego de Comedor',
                status: 'Cancelado',
                date: '2025-01-20',
                deliveryDate: '2025-02-25',
                amount: 45000,
                paidAmount: 0,
                customizations: 'Mesa + 6 sillas, Material: Cedro, Acabado: Natural',
                assignedTo: '',
                progress: 5,
                notes: ['Cliente canceló por cambio de domicilio', 'Dentro del periodo de cancelación'],
                priority: 'low',
                type: 'personalizado'
            }
        ];
    },

    setupEventListeners: function() {
        // Sidebar navigation
        const navLinks = document.querySelectorAll('[data-module]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                              e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'orders') {
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

        // New order button
        const newOrderBtn = document.getElementById('newOrderBtn');
        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => {
                this.showNewOrderModal();
            });
        }

        // Create order button
        const createOrderBtn = document.getElementById('createOrderBtn');
        if (createOrderBtn) {
            createOrderBtn.addEventListener('click', () => {
                this.createNewOrder();
            });
        }

        // Save order button
        const saveOrderBtn = document.getElementById('saveOrderBtn');
        if (saveOrderBtn) {
            saveOrderBtn.addEventListener('click', () => {
                this.saveOrderChanges();
            });
        }

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const clientSearch = document.getElementById('clientSearch');
        const dateFilter = document.getElementById('dateFilter');
        const assignedFilter = document.getElementById('assignedFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (clientSearch) {
            clientSearch.addEventListener('input', () => this.applyFilters());
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
        if (assignedFilter) {
            assignedFilter.addEventListener('change', () => this.applyFilters());
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'orders') {
                this.orders = event.detail.value;
                this.applyFilters();
            }
        });
    },

    setupKanbanBoard: function() {
        const columns = [
            'emitidoCards', 'produccionCards', 'construidoCards', 'pendienteCards',
            'pagadoCards', 'entregandoCards', 'finalizadoCards', 'canceladoCards'
        ];
        const statusMap = {
            'emitidoCards': 'Emitido',
            'produccionCards': 'En Producción',
            'construidoCards': 'Construido',
            'pendienteCards': 'Pendiente',
            'pagadoCards': 'Pagado',
            'entregandoCards': 'Entregando',
            'finalizadoCards': 'Finalizado',
            'canceladoCards': 'Cancelado'
        };

        columns.forEach(columnId => {
            const column = document.getElementById(columnId);
            if (column) {
                this.sortableInstances[columnId] = new Sortable(column, {
                    group: 'kanban',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    onEnd: (evt) => {
                        const orderId = evt.item.getAttribute('data-order-id');
                        const newStatus = statusMap[evt.to.id];
                        this.updateOrderStatus(orderId, newStatus);
                    }
                });
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
        const clientSearch = document.getElementById('clientSearch')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        const assignedFilter = document.getElementById('assignedFilter')?.value || '';

        this.filteredOrders = this.orders.filter(order => {
            const matchesStatus = !statusFilter || order.status === statusFilter;
            const matchesClient = !clientSearch || order.client.toLowerCase().includes(clientSearch);
            const matchesDate = !dateFilter || order.date === dateFilter;
            const matchesAssigned = assignedFilter === '' || 
                                  (assignedFilter === '' && !order.assignedTo) ||
                                  order.assignedTo === assignedFilter;

            return matchesStatus && matchesClient && matchesDate && matchesAssigned;
        });

        this.renderOrders();
    },

    renderOrders: function() {
        // Get all kanban card containers
        const containers = {
            'Emitido': document.getElementById('emitidoCards'),
            'En Producción': document.getElementById('produccionCards'),
            'Construido': document.getElementById('construidoCards'),
            'Pendiente': document.getElementById('pendienteCards'),
            'Pagado': document.getElementById('pagadoCards'),
            'Entregando': document.getElementById('entregandoCards'),
            'Finalizado': document.getElementById('finalizadoCards'),
            'Cancelado': document.getElementById('canceladoCards')
        };

        // Clear existing cards
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // Group orders by status
        const ordersByStatus = {
            'Emitido': [],
            'En Producción': [],
            'Construido': [],
            'Pendiente': [],
            'Pagado': [],
            'Entregando': [],
            'Finalizado': [],
            'Cancelado': []
        };

        this.filteredOrders.forEach(order => {
            if (ordersByStatus[order.status]) {
                ordersByStatus[order.status].push(order);
            }
        });

        // Render cards for each status
        Object.keys(ordersByStatus).forEach(status => {
            const orders = ordersByStatus[status];
            const container = containers[status];
            
            if (!container) return;

            if (orders.length === 0) {
                container.innerHTML = `
                    <div class="empty-column">
                        <i class="bi bi-inbox"></i>
                        <p>No hay pedidos en ${status.toLowerCase()}</p>
                    </div>
                `;
            } else {
                container.innerHTML = orders.map(order => this.createOrderCard(order)).join('');
            }
        });

        // Update counters
        const counters = {
            'emitidoCount': ordersByStatus['Emitido'].length,
            'produccionCount': ordersByStatus['En Producción'].length,
            'construidoCount': ordersByStatus['Construido'].length,
            'pendienteCount': ordersByStatus['Pendiente'].length,
            'pagadoCount': ordersByStatus['Pagado'].length,
            'entregandoCount': ordersByStatus['Entregando'].length,
            'finalizadoCount': ordersByStatus['Finalizado'].length,
            'canceladoCount': ordersByStatus['Cancelado'].length
        };
        
        Object.keys(counters).forEach(counterId => {
            const element = document.getElementById(counterId);
            if (element) {
                element.textContent = counters[counterId];
            }
        });
    },

    createOrderCard: function(order) {
        const priorityIcon = this.getPriorityIcon(order.priority);
        const statusInfo = this.getStatusInfo(order.status);
        
        // Progress bar for production states
        const showProgress = ['En Producción', 'Construido', 'Pendiente'].includes(order.status);
        const progressBar = showProgress ? `
            <div class="order-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${order.progress}%"></div>
                </div>
                <small class="text-muted">${order.progress}% completado</small>
            </div>
        ` : '';
        
        // Payment information
        const paidAmount = order.paidAmount || 0;
        const remainingAmount = order.amount - paidAmount;
        const paymentInfo = order.amount > 0 ? `
            <div class="payment-info mt-2">
                <div class="d-flex justify-content-between">
                    <small class="text-muted">Pagado:</small>
                    <small class="text-success">$${paidAmount.toLocaleString()}</small>
                </div>
                ${remainingAmount > 0 ? `
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">Pendiente:</small>
                        <small class="text-warning">$${remainingAmount.toLocaleString()}</small>
                    </div>
                ` : ''}
            </div>
        ` : '';
        
        // Product type badge
        const typeBadge = order.type ? `
            <span class="badge ${order.type === 'personalizado' ? 'bg-info' : 'bg-secondary'} mb-2">
                ${order.type === 'personalizado' ? 'Personalizado' : 'Prefabricado'}
            </span>
        ` : '';

        return `
            <div class="kanban-card fade-in" data-order-id="${order.id}" onclick="ordersModule.showOrderDetail('${order.id}')">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="order-id">${order.id}</span>
                    <i class="bi bi-${priorityIcon} text-${this.getPriorityColor(order.priority)}"></i>
                </div>
                ${typeBadge}
                <h6 class="order-client">${order.client}</h6>
                <p class="order-product">${order.product}</p>
                <div class="status-info mb-2">
                    <span class="status-badge status-${this.getStatusClass(order.status)}">
                        <i class="bi bi-${statusInfo.icon} me-1"></i>${order.status}
                    </span>
                    <small class="d-block text-muted mt-1">${statusInfo.phase}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="order-amount">$${order.amount.toLocaleString()}</span>
                    <small class="order-date">${this.formatDate(order.date)}</small>
                </div>
                ${progressBar}
                ${paymentInfo}
                ${order.assignedTo ? `<span class="order-assigned"><i class="bi bi-person me-1"></i>${order.assignedTo}</span>` : ''}
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="bi bi-calendar me-1"></i>Entrega: ${this.formatDate(order.deliveryDate)}
                    </small>
                </div>
            </div>
        `;
    },

    showOrderDetail: function(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderModal');
        const modalTitle = document.getElementById('orderModalTitle');
        const modalContent = document.getElementById('orderModalContent');

        modalTitle.textContent = `Pedido ${order.id}`;
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="order-detail-section">
                        <h6><i class="bi bi-person me-2"></i>Información del Cliente</h6>
                        <div class="detail-item">
                            <span class="detail-label">Cliente:</span>
                            <span class="detail-value">${order.client}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de Pedido:</span>
                            <span class="detail-value">${this.formatDate(order.date)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de Entrega:</span>
                            <span class="detail-value">${this.formatDate(order.deliveryDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Monto:</span>
                            <span class="detail-value">$${order.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="order-detail-section">
                        <h6><i class="bi bi-gear me-2"></i>Estado del Pedido</h6>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <span class="status-badge status-${this.getStatusClass(order.status)}">${order.status}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Asignado a:</span>
                            <span class="detail-value">${order.assignedTo || 'Sin asignar'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Progreso:</span>
                            <span class="detail-value">${order.progress}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Prioridad:</span>
                            <span class="badge bg-${this.getPriorityColor(order.priority)}">${order.priority}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="order-detail-section">
                <h6><i class="bi bi-box me-2"></i>Detalles del Producto</h6>
                <div class="detail-item">
                    <span class="detail-label">Producto:</span>
                    <span class="detail-value">${order.product}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Personalizaciones:</span>
                    <span class="detail-value">${order.customizations}</span>
                </div>
            </div>
            
            <div class="order-detail-section">
                <h6><i class="bi bi-chat-dots me-2"></i>Notas y Comentarios</h6>
                <div class="notes-list">
                    ${order.notes.map(note => `
                        <div class="note-item">
                            <div>${note}</div>
                            <div class="note-date">${this.formatDate(order.date)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3">
                    <textarea class="form-control" placeholder="Agregar nueva nota..." id="newNoteText"></textarea>
                    <button class="btn btn-outline-wood btn-sm mt-2" onclick="ordersModule.addNote('${order.id}')">
                        <i class="bi bi-plus me-1"></i>Agregar Nota
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <label class="form-label">Cambiar Estado:</label>
                    <select class="form-select" id="orderStatusSelect">
                        <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="En Progreso" ${order.status === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                        <option value="Completado" ${order.status === 'Completado' ? 'selected' : ''}>Completado</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Progreso (%):</label>
                    <input type="range" class="form-range" min="0" max="100" value="${order.progress}" id="orderProgressRange">
                    <div class="text-center"><span id="progressValue">${order.progress}</span>%</div>
                </div>
            </div>
        `;

        // Setup progress range listener
        const progressRange = document.getElementById('orderProgressRange');
        const progressValue = document.getElementById('progressValue');
        if (progressRange && progressValue) {
            progressRange.addEventListener('input', (e) => {
                progressValue.textContent = e.target.value;
            });
        }

        // Store current order for saving
        this.currentEditingOrder = order;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    showNewOrderModal: function() {
        const modal = document.getElementById('newOrderModal');
        const form = document.getElementById('newOrderForm');
        
        // Reset form
        form.reset();
        
        // Set default delivery date (30 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 30);
        form.querySelector('[name="deliveryDate"]').value = deliveryDate.toISOString().split('T')[0];

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    createNewOrder: function() {
        const form = document.getElementById('newOrderForm');
        const formData = new FormData(form);

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const newOrder = {
            id: `ORD-${String(Date.now()).slice(-3)}`,
            client: formData.get('client'),
            product: formData.get('product'),
            status: 'Pendiente',
            date: new Date().toISOString().split('T')[0],
            deliveryDate: formData.get('deliveryDate'),
            amount: parseFloat(formData.get('amount')),
            customizations: formData.get('customizations') || 'Sin personalizaciones especiales',
            assignedTo: '',
            progress: 0,
            notes: formData.get('notes') ? [formData.get('notes')] : [],
            priority: 'medium'
        };

        // Add to orders
        this.orders.push(newOrder);
        window.MobiliAriState.updateState('orders', this.orders);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
        modal.hide();

        // Show success message
        this.showAlert('success', `Pedido ${newOrder.id} creado exitosamente`);
    },

    saveOrderChanges: function() {
        if (!this.currentEditingOrder) return;

        const statusSelect = document.getElementById('orderStatusSelect');
        const progressRange = document.getElementById('orderProgressRange');

        if (statusSelect && progressRange) {
            const orderId = this.currentEditingOrder.id;
            const newStatus = statusSelect.value;
            const newProgress = parseInt(progressRange.value);

            this.updateOrderStatus(orderId, newStatus);
            this.updateOrderProgress(orderId, newProgress);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
            modal.hide();

            this.showAlert('success', 'Cambios guardados exitosamente');
        }
    },

    updateOrderStatus: function(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            
            // Auto-update progress based on status
            if (newStatus === 'Completado') {
                this.orders[orderIndex].progress = 100;
            } else if (newStatus === 'Pendiente') {
                this.orders[orderIndex].progress = 0;
            }

            window.MobiliAriState.updateState('orders', this.orders);
            this.showAlert('success', `Pedido ${orderId} actualizado a ${newStatus}`);
        }
    },

    updateOrderProgress: function(orderId, progress) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].progress = progress;
            window.MobiliAriState.updateState('orders', this.orders);
        }
    },

    addNote: function(orderId) {
        const noteText = document.getElementById('newNoteText');
        if (!noteText || !noteText.value.trim()) return;

        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].notes.push(noteText.value.trim());
            window.MobiliAriState.updateState('orders', this.orders);
            
            // Refresh modal content
            this.showOrderDetail(orderId);
            
            this.showAlert('success', 'Nota agregada exitosamente');
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

    // Helper functions
    getStatusClass: function(status) {
        const statusMap = {
            'Emitido': 'emitido',
            'En Producción': 'produccion',
            'Construido': 'construido',
            'Pendiente': 'pendiente',
            'Pagado': 'pagado',
            'Entregando': 'entregando',
            'Finalizado': 'finalizado',
            'Cancelado': 'cancelado'
        };
        return statusMap[status] || 'emitido';
    },

    getStatusInfo: function(status) {
        const statusInfo = {
            'Emitido': {
                phase: '1ª Fase del Personalizado',
                description: 'Venta personalizada ingresada. Cliente debe seleccionar producto y realizar primer pago (50%)',
                icon: 'file-earmark-plus',
                color: '#6c757d'
            },
            'En Producción': {
                phase: '2ª Fase del Personalizado',
                description: 'Elaboración del producto en proceso',
                icon: 'tools',
                color: '#fd7e14'
            },
            'Construido': {
                phase: '3ª Fase del Personalizado',
                description: 'Producto terminado en su elaboración',
                icon: 'check2-square',
                color: '#20c997'
            },
            'Pendiente': {
                phase: '4ª Fase del Personalizado',
                description: 'En espera del 50% restante del pago',
                icon: 'clock-history',
                color: '#ffc107'
            },
            'Pagado': {
                phase: '5ª Fase del Personalizado / 1ª Fase de Prefabricado',
                description: 'Cancelación completa del producto (100% pagado)',
                icon: 'credit-card-fill',
                color: '#198754'
            },
            'Entregando': {
                phase: '6ª Fase del Personalizado / 2ª Fase de Prefabricado',
                description: 'Coordinación del día de entrega con el cliente',
                icon: 'truck',
                color: '#0d6efd'
            },
            'Finalizado': {
                phase: '7ª Fase del Personalizado / 3ª Fase de Prefabricado',
                description: 'Finalización de la venta - Producto entregado',
                icon: 'check-circle-fill',
                color: '#198754'
            },
            'Cancelado': {
                phase: 'Estado Final',
                description: 'Venta cancelada por el cliente dentro del rango establecido',
                icon: 'x-circle-fill',
                color: '#dc3545'
            }
        };
        return statusInfo[status] || statusInfo['Emitido'];
    },

    getPriorityIcon: function(priority) {
        const iconMap = {
            'high': 'exclamation-triangle-fill',
            'medium': 'dash-circle-fill',
            'low': 'check-circle-fill'
        };
        return iconMap[priority] || 'dash-circle-fill';
    },

    getPriorityColor: function(priority) {
        const colorMap = {
            'high': 'danger',
            'medium': 'warning',
            'low': 'success'
        };
        return colorMap[priority] || 'secondary';
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
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
        window.ordersModule.init();
    });
} else {
    window.ordersModule.init();
}
