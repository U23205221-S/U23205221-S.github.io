/**
 * Orders Module
 * Handles order management, kanban board, and task tracking
 */

window.ordersModule = {
    orders: [],
    filteredOrders: [],
    complaints: [],
    filteredComplaints: [],
    sortableInstances: {},
    currentSection: 'orders-main',
    
    init: async function(data) {
        console.log('Orders module initialized');
        await this.loadOrders();
        await this.loadComplaints();
        this.setupEventListeners();
        this.setupKanbanBoard();
        this.renderOrders();
        this.updateUserInfo();
    },

    loadOrders: async function() {
        let orders = window.MobiliAriState.getState('orders');

        if (!orders || orders.length === 0) {
            try {
                const response = await fetch('../data/orders.json');
                orders = await response.json();
                window.MobiliAriState.updateState('orders', orders);
            } catch (error) {
                console.error('Error loading orders:', error);
                orders = [];
            }
        }

        this.orders = orders;
        this.filteredOrders = [...this.orders];
    },

    loadComplaints: async function() {
        let complaints = window.MobiliAriState.getState('complaints');

        if (!complaints || complaints.length === 0) {
            // Create sample complaints data
            complaints = this.getDefaultComplaints();
            window.MobiliAriState.updateState('complaints', complaints);
        }

        this.complaints = complaints;
        this.filteredComplaints = [...this.complaints];
    },

    getDefaultComplaints: function() {
        return [
            {
                id: 'REC-001',
                clientName: 'María González',
                clientEmail: 'maria.gonzalez@email.com',
                relatedOrder: 'ORD-002',
                complaintType: 'Pedido no entregado',
                description: 'El pedido fue programado para entrega el 15 de enero pero no ha llegado. El cliente ha intentado contactar sin respuesta.',
                date: '2025-01-18',
                status: 'Pendiente',
                priority: 'Alta',
                assignedTo: '',
                resolution: '',
                evidence: []
            },
            {
                id: 'REC-002',
                clientName: 'Carlos Ruiz',
                clientEmail: 'carlos.ruiz@email.com',
                relatedOrder: 'ORD-005',
                complaintType: 'Pedido incorrecto',
                description: 'Se entregó una mesa de roble cuando el pedido especificaba cedro. Las dimensiones también son incorrectas.',
                date: '2025-01-16',
                status: 'En Revisión',
                priority: 'Media',
                assignedTo: 'Admin',
                resolution: 'Se está verificando el error en producción y se programará reemplazo.',
                evidence: ['foto_mesa_incorrecta.jpg']
            },
            {
                id: 'REC-003',
                clientName: 'Ana López',
                clientEmail: 'ana.lopez@email.com',
                relatedOrder: 'ORD-001',
                complaintType: 'Producto dañado',
                description: 'La mesa llegó con rayones profundos en la superficie y una pata suelta.',
                date: '2025-01-14',
                status: 'Resuelto',
                priority: 'Media',
                assignedTo: 'Admin',
                resolution: 'Se envió técnico para reparación in situ. Cliente satisfecho con la solución.',
                evidence: ['danos_mesa.jpg', 'reparacion_completada.jpg']
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
        
        // Close modal button (X)
        const closeModalBtn = document.getElementById('closeModalBtn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeNewOrderModal();
            });
        }
        
        // Cancel order button
        const cancelOrderBtn = document.getElementById('cancelOrderBtn');
        if (cancelOrderBtn) {
            cancelOrderBtn.addEventListener('click', () => {
                this.closeNewOrderModal();
            });
        }
        
        // Modal backdrop click (close when clicking outside)
        const newOrderModal = document.getElementById('newOrderModal');
        if (newOrderModal) {
            newOrderModal.addEventListener('click', (e) => {
                if (e.target === newOrderModal) {
                    this.closeNewOrderModal();
                }
            });
            
            // Also listen for Bootstrap modal events
            newOrderModal.addEventListener('hidden.bs.modal', () => {
                // Ensure everything is cleaned up when modal is hidden
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
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

        // Section navigation
        const sectionLinks = document.querySelectorAll('[data-section]');
        sectionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section') || 
                              e.target.closest('[data-section]').getAttribute('data-section');
                
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Complaints event listeners
        const newComplaintBtn = document.getElementById('newComplaintBtn');
        if (newComplaintBtn) {
            newComplaintBtn.addEventListener('click', () => {
                this.showNewComplaintModal();
            });
        }

        const createComplaintBtn = document.getElementById('createComplaintBtn');
        if (createComplaintBtn) {
            createComplaintBtn.addEventListener('click', () => {
                this.createNewComplaint();
            });
        }

        const saveComplaintBtn = document.getElementById('saveComplaintBtn');
        if (saveComplaintBtn) {
            saveComplaintBtn.addEventListener('click', () => {
                this.saveComplaintChanges();
            });
        }

        // Complaint filters
        const complaintStatusFilter = document.getElementById('complaintStatusFilter');
        const complaintTypeFilter = document.getElementById('complaintTypeFilter');
        const complaintClientSearch = document.getElementById('complaintClientSearch');
        const complaintDateFilter = document.getElementById('complaintDateFilter');

        if (complaintStatusFilter) {
            complaintStatusFilter.addEventListener('change', () => this.applyComplaintFilters());
        }
        if (complaintTypeFilter) {
            complaintTypeFilter.addEventListener('change', () => this.applyComplaintFilters());
        }
        if (complaintClientSearch) {
            complaintClientSearch.addEventListener('input', () => this.applyComplaintFilters());
        }
        if (complaintDateFilter) {
            complaintDateFilter.addEventListener('change', () => this.applyComplaintFilters());
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'orders') {
                this.orders = event.detail.value;
                this.applyFilters();
            } else if (event.detail.key === 'complaints') {
                this.complaints = event.detail.value;
                this.applyComplaintFilters();
                this.updateComplaintStats();
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

    loadProductOptions: function() {
        const productSelect = document.getElementById('productSelect');
        if (!productSelect) return;
        
        // Get available products from inventory or predefined list
        const availableProducts = this.getAvailableProducts();
        
        // Clear existing options except the first one
        productSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
        
        // Add product options
        availableProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = `${product.name} - $${product.price.toLocaleString()}`;
            option.setAttribute('data-price', product.price);
            option.setAttribute('data-type', product.type);
            productSelect.appendChild(option);
        });
        
        // Add event listener to auto-fill price and type when product is selected
        productSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.getAttribute('data-price')) {
                const amountInput = document.querySelector('[name="amount"]');
                const typeInput = document.getElementById('productType');
                
                if (amountInput) {
                    amountInput.value = selectedOption.getAttribute('data-price');
                }
                
                if (typeInput) {
                    const productType = selectedOption.getAttribute('data-type');
                    typeInput.value = productType === 'personalizado' ? 'Personalizado' : 'Prefabricado';
                }
            } else {
                // Clear fields if no product selected
                const amountInput = document.querySelector('[name="amount"]');
                const typeInput = document.getElementById('productType');
                if (amountInput) amountInput.value = '';
                if (typeInput) typeInput.value = '';
            }
        });
    },

    getAvailableProducts: function() {
        // This could be loaded from inventory module or a separate products list
        // For now, we'll use a predefined list of common furniture products
        return [
            // Mesas
            { name: 'Mesa de Comedor Rectangular', price: 15000, type: 'personalizado', category: 'mesas' },
            { name: 'Mesa de Comedor Redonda', price: 18000, type: 'personalizado', category: 'mesas' },
            { name: 'Mesa de Centro', price: 8500, type: 'prefabricado', category: 'mesas' },
            { name: 'Mesa de Noche', price: 4500, type: 'prefabricado', category: 'mesas' },
            { name: 'Mesa de Trabajo/Escritorio', price: 12000, type: 'personalizado', category: 'mesas' },
            
            // Sillas
            { name: 'Silla de Comedor (Unidad)', price: 2500, type: 'prefabricado', category: 'sillas' },
            { name: 'Juego de 4 Sillas', price: 9000, type: 'prefabricado', category: 'sillas' },
            { name: 'Silla Ejecutiva', price: 8000, type: 'personalizado', category: 'sillas' },
            
            // Armarios y Closets
            { name: 'Armario de Dormitorio 2 Puertas', price: 25000, type: 'personalizado', category: 'armarios' },
            { name: 'Armario de Dormitorio 3 Puertas', price: 35000, type: 'personalizado', category: 'armarios' },
            { name: 'Closet Empotrado', price: 45000, type: 'personalizado', category: 'armarios' },
            
            // Camas
            { name: 'Cama Individual', price: 18000, type: 'personalizado', category: 'camas' },
            { name: 'Cama Matrimonial', price: 25000, type: 'personalizado', category: 'camas' },
            { name: 'Cama King Size', price: 32000, type: 'personalizado', category: 'camas' },
            
            // Sofás y Salas
            { name: 'Sofá 2 Puestos', price: 20000, type: 'personalizado', category: 'sofas' },
            { name: 'Sofá 3 Puestos', price: 28000, type: 'personalizado', category: 'sofas' },
            { name: 'Sofá Esquinero', price: 35000, type: 'personalizado', category: 'sofas' },
            
            // Libreros y Estanterías
            { name: 'Librero Modular', price: 15000, type: 'personalizado', category: 'libreros' },
            { name: 'Estantería de Pared', price: 8000, type: 'prefabricado', category: 'libreros' },
            
            // Cocina
            { name: 'Mueble de Cocina Integral', price: 80000, type: 'personalizado', category: 'cocina' },
            { name: 'Isla de Cocina', price: 35000, type: 'personalizado', category: 'cocina' },
            
            // Otros
            { name: 'Aparador/Buffet', price: 22000, type: 'personalizado', category: 'otros' },
            { name: 'Cómoda', price: 18000, type: 'personalizado', category: 'otros' },
            { name: 'Banco/Taburete', price: 3500, type: 'prefabricado', category: 'otros' }
        ];
    },

    showNewOrderModal: function() {
        const modal = document.getElementById('newOrderModal');
        const form = document.getElementById('newOrderForm');
        
        // Reset form
        form.reset();
        
        // Load products into select
        this.loadProductOptions();
        
        // Set default delivery date (30 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 30);
        form.querySelector('[name="deliveryDate"]').value = deliveryDate.toISOString().split('T')[0];

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    closeNewOrderModal: function() {
        const modal = document.getElementById('newOrderModal');
        
        try {
            // Try to get existing modal instance
            let bsModal = bootstrap.Modal.getInstance(modal);
            
            if (bsModal) {
                // Close the modal
                bsModal.hide();
            } else {
                // If no instance exists, create one and hide it
                bsModal = new bootstrap.Modal(modal);
                bsModal.hide();
            }
            
            // Force remove modal backdrop and classes after a short delay
            setTimeout(() => {
                // Remove modal backdrop
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                
                // Remove modal-open class from body
                document.body.classList.remove('modal-open');
                
                // Reset body styles
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
                
                // Hide modal element
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
                
            }, 150);
            
        } catch (error) {
            console.error('Error closing modal:', error);
            
            // Fallback: force close modal
            this.forceCloseModal();
        }
        
        // Reset form
        const form = document.getElementById('newOrderForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        // Clear product selection
        const productSelect = document.getElementById('productSelect');
        const amountInput = document.querySelector('[name="amount"]');
        const typeInput = document.getElementById('productType');
        
        if (productSelect) productSelect.value = '';
        if (amountInput) amountInput.value = '';
        if (typeInput) typeInput.value = '';
        
        console.log('Modal cerrado - permaneciendo en módulo de pedidos');
    },
    
    forceCloseModal: function() {
        const modal = document.getElementById('newOrderModal');
        
        // Force remove all modal-related elements and classes
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Reset body styles
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Hide modal
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        }
        
        console.log('Modal forzado a cerrar');
    },
    
    // Emergency function to close modal (can be called from console)
    emergencyCloseModal: function() {
        console.log('🚨 Cerrando modal de emergencia...');
        
        // Remove all possible modal elements
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show', 'fade');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        });
        
        // Remove all backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Clean body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Reset form
        const form = document.getElementById('newOrderForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('✅ Modal cerrado exitosamente');
    },

    createNewOrder: function() {
        const form = document.getElementById('newOrderForm');
        const formData = new FormData(form);

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Determine product type and initial status
        const productType = formData.get('productType');
        const isPersonalizado = productType === 'Personalizado';
        
        const newOrder = {
            id: `ORD-${String(Date.now()).slice(-3)}`,
            client: formData.get('client'),
            product: formData.get('product'),
            status: isPersonalizado ? 'Emitido' : 'Pagado', // Personalizado starts at Emitido, Prefabricado starts at Pagado
            date: new Date().toISOString().split('T')[0],
            deliveryDate: formData.get('deliveryDate'),
            amount: parseFloat(formData.get('amount')),
            paidAmount: isPersonalizado ? 0 : parseFloat(formData.get('amount')), // Prefabricados are paid in full
            customizations: formData.get('customizations') || (isPersonalizado ? 'Pendiente de definir personalizaciones' : 'Producto en stock - Sin personalizaciones'),
            assignedTo: '',
            progress: isPersonalizado ? 10 : 100, // Personalizado starts at 10%, Prefabricado is 100%
            notes: [
                isPersonalizado ? 
                    'Nuevo pedido personalizado - Cliente debe realizar primer pago del 50%' : 
                    'Producto prefabricado - Pago completo recibido, listo para entrega'
            ],
            priority: 'medium',
            type: isPersonalizado ? 'personalizado' : 'prefabricado'
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

    // Complaints Management Functions
    switchSection: function(section) {
        this.currentSection = section;
        
        // Update active states in sidebar
        const sectionLinks = document.querySelectorAll('[data-section]');
        sectionLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        // Show/hide sections
        const ordersSection = document.getElementById('ordersMainSection');
        const complaintsSection = document.getElementById('complaintsSection');

        if (section === 'orders-main') {
            ordersSection.style.display = 'block';
            complaintsSection.style.display = 'none';
        } else if (section === 'complaints') {
            ordersSection.style.display = 'none';
            complaintsSection.style.display = 'block';
            this.renderComplaints();
            this.updateComplaintStats();
        }
    },

    showNewComplaintModal: function() {
        const modal = new bootstrap.Modal(document.getElementById('newComplaintModal'));
        
        // Set today's date as default
        const dateInput = document.querySelector('[name="complaintDate"]');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Load related orders
        this.loadRelatedOrdersOptions();
        
        modal.show();
    },

    loadRelatedOrdersOptions: function() {
        const select = document.querySelector('[name="relatedOrder"]');
        if (!select) return;

        select.innerHTML = '<option value="">Seleccionar pedido...</option>';
        
        this.orders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.id;
            option.textContent = `${order.id} - ${order.client} - ${order.product}`;
            select.appendChild(option);
        });
    },

    createNewComplaint: function() {
        const form = document.getElementById('newComplaintForm');
        const formData = new FormData(form);
        
        const complaint = {
            id: 'REC-' + String(this.complaints.length + 1).padStart(3, '0'),
            clientName: formData.get('clientName'),
            clientEmail: formData.get('clientEmail'),
            relatedOrder: formData.get('relatedOrder'),
            complaintType: formData.get('complaintType'),
            description: formData.get('description'),
            date: formData.get('complaintDate'),
            status: 'Pendiente',
            priority: formData.get('priority'),
            assignedTo: '',
            resolution: '',
            evidence: []
        };

        this.complaints.push(complaint);
        window.MobiliAriState.updateState('complaints', this.complaints);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newComplaintModal'));
        modal.hide();
        
        // Refresh complaints view
        this.applyComplaintFilters();
        this.updateComplaintStats();
        
        this.showAlert('success', 'Reclamo registrado exitosamente');
    },

    applyComplaintFilters: function() {
        const statusFilter = document.getElementById('complaintStatusFilter')?.value || '';
        const typeFilter = document.getElementById('complaintTypeFilter')?.value || '';
        const clientSearch = document.getElementById('complaintClientSearch')?.value.toLowerCase() || '';
        const dateFilter = document.getElementById('complaintDateFilter')?.value || '';

        this.filteredComplaints = this.complaints.filter(complaint => {
            const matchesStatus = !statusFilter || complaint.status === statusFilter;
            const matchesType = !typeFilter || complaint.complaintType === typeFilter;
            const matchesClient = !clientSearch || 
                complaint.clientName.toLowerCase().includes(clientSearch) ||
                complaint.clientEmail.toLowerCase().includes(clientSearch);
            
            let matchesDate = true;
            if (dateFilter) {
                const complaintDate = new Date(complaint.date);
                const filterDate = new Date(dateFilter);
                matchesDate = complaintDate.toDateString() === filterDate.toDateString();
            }

            return matchesStatus && matchesType && matchesClient && matchesDate;
        });

        this.renderComplaints();
    },

    renderComplaints: function() {
        const tableBody = document.getElementById('complaintsTableBody');
        if (!tableBody) return;

        if (this.filteredComplaints.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="bi bi-inbox text-muted display-4 d-block mb-2"></i>
                        No se encontraron reclamos
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredComplaints.map(complaint => `
            <tr>
                <td><strong>${complaint.id}</strong></td>
                <td>
                    <div>
                        <strong>${complaint.clientName}</strong>
                        ${complaint.clientEmail ? `<br><small class="text-muted">${complaint.clientEmail}</small>` : ''}
                    </div>
                </td>
                <td>
                    ${complaint.relatedOrder ? `<span class="badge bg-light text-dark">${complaint.relatedOrder}</span>` : '<span class="text-muted">N/A</span>'}
                </td>
                <td>
                    <span class="badge bg-${this.getComplaintTypeColor(complaint.complaintType)}">
                        ${complaint.complaintType}
                    </span>
                </td>
                <td>${this.formatDate(complaint.date)}</td>
                <td>
                    <span class="badge bg-${this.getComplaintStatusColor(complaint.status)}">
                        ${complaint.status}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${this.getPriorityColor(complaint.priority.toLowerCase())}">
                        <i class="bi bi-${this.getPriorityIcon(complaint.priority.toLowerCase())} me-1"></i>
                        ${complaint.priority}
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="ordersModule.showComplaintDetail('${complaint.id}')" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="ordersModule.updateComplaintStatus('${complaint.id}', 'En Revisión')" title="Marcar en revisión">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="ordersModule.updateComplaintStatus('${complaint.id}', 'Resuelto')" title="Marcar como resuelto">
                            <i class="bi bi-check-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateComplaintStats: function() {
        const pending = this.complaints.filter(c => c.status === 'Pendiente').length;
        const reviewing = this.complaints.filter(c => c.status === 'En Revisión').length;
        const resolved = this.complaints.filter(c => c.status === 'Resuelto').length;
        const total = this.complaints.length;

        document.getElementById('pendingComplaints').textContent = pending;
        document.getElementById('reviewingComplaints').textContent = reviewing;
        document.getElementById('resolvedComplaints').textContent = resolved;
        document.getElementById('totalComplaints').textContent = total;
    },

    showComplaintDetail: function(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        const modalContent = document.getElementById('complaintModalContent');
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="text-dark-wood mb-3">Información del Reclamo</h6>
                    <div class="mb-2"><strong>ID:</strong> ${complaint.id}</div>
                    <div class="mb-2"><strong>Cliente:</strong> ${complaint.clientName}</div>
                    <div class="mb-2"><strong>Email:</strong> ${complaint.clientEmail || 'N/A'}</div>
                    <div class="mb-2"><strong>Pedido Relacionado:</strong> ${complaint.relatedOrder || 'N/A'}</div>
                    <div class="mb-2"><strong>Tipo:</strong> 
                        <span class="badge bg-${this.getComplaintTypeColor(complaint.complaintType)}">${complaint.complaintType}</span>
                    </div>
                    <div class="mb-2"><strong>Fecha:</strong> ${this.formatDate(complaint.date)}</div>
                    <div class="mb-2"><strong>Estado:</strong> 
                        <span class="badge bg-${this.getComplaintStatusColor(complaint.status)}">${complaint.status}</span>
                    </div>
                    <div class="mb-2"><strong>Prioridad:</strong> 
                        <span class="badge bg-${this.getPriorityColor(complaint.priority.toLowerCase())}">${complaint.priority}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <h6 class="text-dark-wood mb-3">Gestión</h6>
                    <div class="mb-3">
                        <label class="form-label">Estado</label>
                        <select class="form-select" id="complaintStatusUpdate">
                            <option value="Pendiente" ${complaint.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="En Revisión" ${complaint.status === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
                            <option value="Resuelto" ${complaint.status === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                            <option value="Cerrado" ${complaint.status === 'Cerrado' ? 'selected' : ''}>Cerrado</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Asignado a</label>
                        <input type="text" class="form-control" id="complaintAssignedTo" value="${complaint.assignedTo || ''}" placeholder="Nombre del responsable">
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="text-dark-wood mb-3">Descripción del Problema</h6>
                    <p class="bg-light p-3 rounded">${complaint.description}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="text-dark-wood mb-3">Resolución</h6>
                    <textarea class="form-control" id="complaintResolution" rows="4" placeholder="Describe la resolución del reclamo...">${complaint.resolution || ''}</textarea>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('complaintModal'));
        modal.show();

        // Store current complaint for saving
        this.currentComplaint = complaint;
    },

    updateComplaintStatus: function(complaintId, newStatus) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        complaint.status = newStatus;
        if (newStatus === 'En Revisión' && !complaint.assignedTo) {
            complaint.assignedTo = 'Admin';
        }

        window.MobiliAriState.updateState('complaints', this.complaints);
        this.applyComplaintFilters();
        this.updateComplaintStats();
        
        this.showAlert('success', `Reclamo ${complaintId} actualizado a: ${newStatus}`);
    },

    getComplaintTypeColor: function(type) {
        const colorMap = {
            'Pedido no entregado': 'danger',
            'Pedido incorrecto': 'warning',
            'Producto dañado': 'danger',
            'Retraso en entrega': 'warning',
            'Calidad deficiente': 'info'
        };
        return colorMap[type] || 'secondary';
    },

    getComplaintStatusColor: function(status) {
        const colorMap = {
            'Pendiente': 'warning',
            'En Revisión': 'info',
            'Resuelto': 'success',
            'Cerrado': 'secondary'
        };
        return colorMap[status] || 'secondary';
    },

    saveComplaintChanges: function() {
        if (!this.currentComplaint) return;

        const newStatus = document.getElementById('complaintStatusUpdate')?.value;
        const assignedTo = document.getElementById('complaintAssignedTo')?.value;
        const resolution = document.getElementById('complaintResolution')?.value;

        // Update complaint
        this.currentComplaint.status = newStatus || this.currentComplaint.status;
        this.currentComplaint.assignedTo = assignedTo || this.currentComplaint.assignedTo;
        this.currentComplaint.resolution = resolution || this.currentComplaint.resolution;

        // Save to state
        window.MobiliAriState.updateState('complaints', this.complaints);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
        modal.hide();

        // Refresh view
        this.applyComplaintFilters();
        this.updateComplaintStats();

        this.showAlert('success', `Reclamo ${this.currentComplaint.id} actualizado exitosamente`);
        this.currentComplaint = null;
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

// Global emergency function for modal issues
window.emergencyCloseModal = function() {
    if (window.ordersModule && window.ordersModule.emergencyCloseModal) {
        window.ordersModule.emergencyCloseModal();
    } else {
        console.log('🚨 Cerrando modal de emergencia (fallback)...');
        
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
        
        console.log('✅ Modal cerrado con fallback');
    }
};
