// Sales Module - MobiliAri System
const salesModule = {
    sales: [],
    filteredSales: [],
    currentPage: 1,
    itemsPerPage: 10,
    sortColumn: 'sale_date',
    sortDirection: 'desc',
    currentSaleId: null,

    init: async function(data) {
        console.log('Sales module initialized');
        await this.loadData();
        this.setupEventListeners();
        this.setupSidebar();
        this.updateStats();
        this.renderTable();
    },

    loadData: async function() {
        // Load sales data from state or initialize with sample data
        this.sales = window.MobiliAriState?.getState('sales') || this.getSampleSales();
        
        if (!window.MobiliAriState?.getState('sales') || window.MobiliAriState.getState('sales').length === 0) {
            window.MobiliAriState?.updateState('sales', this.sales);
        }
        
        this.filteredSales = [...this.sales];
    },

    getSampleSales: function() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        return [
            {
                id: 1,
                product_name: 'Mesa de Comedor Roble',
                sale_number_id: 'VTA-2024-001',
                sale_date: today.toISOString().split('T')[0],
                sale_time: '10:30',
                subtotal: 1200.00,
                total: 1416.00,
                client: 'Juan Pérez García',
                status: 'Completada',
                delivery_date: '2024-01-20',
                first_payment: 700.00,
                final_payment: 716.00,
                created_at: today.toISOString()
            },
            {
                id: 2,
                product_name: 'Armario Empotrado',
                sale_number_id: 'VTA-2024-002',
                sale_date: yesterday.toISOString().split('T')[0],
                sale_time: '14:15',
                subtotal: 2500.00,
                total: 2950.00,
                client: 'María González López',
                status: 'En Proceso',
                delivery_date: '2024-01-25',
                first_payment: 1500.00,
                final_payment: 1450.00,
                created_at: yesterday.toISOString()
            },
            {
                id: 3,
                product_name: 'Estantería Modular',
                sale_number_id: 'VTA-2024-003',
                sale_date: yesterday.toISOString().split('T')[0],
                sale_time: '16:45',
                subtotal: 800.00,
                total: 944.00,
                client: 'Carlos Rodríguez',
                status: 'Pendiente',
                delivery_date: null,
                first_payment: 400.00,
                final_payment: 544.00,
                created_at: yesterday.toISOString()
            }
        ];
    },

    setupEventListeners: function() {
        // Search and filters
        document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFromFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('dateToFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('applyFiltersBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => this.clearFilters());

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortTable(column);
            });
        });

        // Action buttons
        document.getElementById('newSaleBtn')?.addEventListener('click', () => this.showNewSaleModal());
        document.getElementById('refreshTableBtn')?.addEventListener('click', () => this.refreshTable());
        document.getElementById('exportSalesBtn')?.addEventListener('click', () => this.exportSales());
        document.getElementById('exportExcelBtn')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportToPdf());

        // Modal buttons
        document.getElementById('printSaleBtn')?.addEventListener('click', () => this.printSale());
        document.getElementById('editSaleBtn')?.addEventListener('click', () => this.editSale());
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => this.deleteSale());
    },

    applyFilters: function() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const dateFrom = document.getElementById('dateFromFilter')?.value || '';
        const dateTo = document.getElementById('dateToFilter')?.value || '';

        this.filteredSales = this.sales.filter(sale => {
            const matchesSearch = !searchTerm || 
                sale.product_name.toLowerCase().includes(searchTerm) ||
                sale.sale_number_id.toLowerCase().includes(searchTerm) ||
                sale.client.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || sale.status === statusFilter;
            
            const matchesDateFrom = !dateFrom || sale.sale_date >= dateFrom;
            const matchesDateTo = !dateTo || sale.sale_date <= dateTo;

            return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    },

    clearFilters: function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        
        this.filteredSales = [...this.sales];
        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    },

    sortTable: function(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredSales.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'total' || column === 'first_payment' || column === 'final_payment') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateSortIcons();
        this.renderTable();
    },

    updateSortIcons: function() {
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.className = 'bi bi-chevron-expand sort-icon';
        });

        const activeHeader = document.querySelector(`[data-sort="${this.sortColumn}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.className = `bi bi-chevron-${this.sortDirection === 'asc' ? 'up' : 'down'} sort-icon`;
        }
    },

    renderTable: function() {
        const tableBody = document.getElementById('salesTableBody');
        if (!tableBody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedSales = this.filteredSales.slice(startIndex, endIndex);

        if (paginatedSales.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-4">
                        <div class="text-muted">
                            <i class="bi bi-inbox display-1"></i>
                            <p class="mt-2">No se encontraron ventas</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = paginatedSales.map(sale => `
            <tr class="fade-in">
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-box text-primary me-2"></i>
                        <span class="fw-medium">${sale.product_name}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${sale.sale_number_id}</span>
                </td>
                <td>${this.formatDate(sale.sale_date)}</td>
                <td>
                    <i class="bi bi-clock text-muted me-1"></i>
                    ${sale.sale_time}
                </td>
                <td class="fw-bold text-success">$${sale.total.toLocaleString()}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person-circle text-muted me-2"></i>
                        ${sale.client}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(sale.status)}">
                        ${sale.status}
                    </span>
                </td>
                <td>
                    ${sale.delivery_date ? 
                        `<i class="bi bi-truck text-info me-1"></i>${this.formatDate(sale.delivery_date)}` : 
                        '<span class="text-muted">No programada</span>'
                    }
                </td>
                <td class="text-success">$${sale.first_payment.toLocaleString()}</td>
                <td class="text-primary">$${sale.final_payment.toLocaleString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-view" onclick="salesModule.viewSaleDetails(${sale.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="salesModule.showDeleteConfirm(${sale.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
        this.updateTableInfo();
    },

    renderPagination: function() {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('paginationContainer');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="salesModule.goToPage(${this.currentPage - 1})">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="salesModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="salesModule.goToPage(${this.currentPage + 1})">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        paginationContainer.innerHTML = paginationHTML;
    },

    goToPage: function(page) {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    },

    updateTableInfo: function() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredSales.length);
        
        document.getElementById('showingCount').textContent = this.filteredSales.length > 0 ? `${startIndex + 1}-${endIndex}` : '0';
        document.getElementById('totalCount').textContent = this.filteredSales.length;
    },

    updateStats: function() {
        const totalSales = this.sales.length;
        const todaySales = this.sales.filter(sale => sale.sale_date === new Date().toISOString().split('T')[0]).length;
        const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.total, 0);
        const pendingSales = this.sales.filter(sale => sale.status === 'Pendiente').length;

        document.getElementById('totalSales').textContent = totalSales;
        document.getElementById('todaySales').textContent = todaySales;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('pendingSales').textContent = pendingSales;
    },

    viewSaleDetails: function(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        this.currentSaleId = saleId;
        this.renderSaleDetails(sale);
        
        const modal = new bootstrap.Modal(document.getElementById('saleDetailModal'));
        modal.show();
    },

    renderSaleDetails: function(sale) {
        const content = document.getElementById('saleDetailContent');
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Información General</h6>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label text-muted">Código de Venta</label>
                                    <div class="fw-bold">${sale.sale_number_id}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">Producto</label>
                                    <div class="fw-bold">${sale.product_name}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted">Fecha</label>
                                    <div>${this.formatDate(sale.sale_date)}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted">Hora</label>
                                    <div>${sale.sale_time}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">Cliente</label>
                                    <div class="fw-bold">${sale.client}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">Estado</label>
                                    <div>
                                        <span class="status-badge status-${this.getStatusClass(sale.status)}">
                                            ${sale.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Información Financiera</h6>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label text-muted">Subtotal</label>
                                    <div class="h5 text-secondary">$${sale.subtotal.toLocaleString()}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">Total</label>
                                    <div class="h4 text-success fw-bold">$${sale.total.toLocaleString()}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted">Primer Pago</label>
                                    <div class="fw-bold text-primary">$${sale.first_payment.toLocaleString()}</div>
                                </div>
                                <div class="col-6">
                                    <label class="form-label text-muted">Pago Final</label>
                                    <div class="fw-bold text-info">$${sale.final_payment.toLocaleString()}</div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label text-muted">Fecha de Entrega</label>
                                    <div class="fw-bold ${sale.delivery_date ? 'text-warning' : 'text-muted'}">
                                        ${sale.delivery_date ? this.formatDate(sale.delivery_date) : 'No programada'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    showDeleteConfirm: function(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        this.currentSaleId = saleId;
        
        document.getElementById('deleteConfirmContent').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            <strong>Código:</strong> ${sale.sale_number_id}
                        </div>
                        <div class="col-12">
                            <strong>Producto:</strong> ${sale.product_name}
                        </div>
                        <div class="col-12">
                            <strong>Cliente:</strong> ${sale.client}
                        </div>
                        <div class="col-12">
                            <strong>Total:</strong> $${sale.total.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    },

    deleteSale: function() {
        if (!this.currentSaleId) return;

        this.sales = this.sales.filter(sale => sale.id !== this.currentSaleId);
        window.MobiliAriState?.updateState('sales', this.sales);
        
        this.applyFilters();
        this.updateStats();
        
        bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
        this.showSuccessMessage('Venta eliminada exitosamente');
        
        this.currentSaleId = null;
    },

    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    getStatusClass: function(status) {
        const statusClasses = {
            'Completada': 'success',
            'Pendiente': 'warning',
            'En Proceso': 'info',
            'Entregada': 'primary',
            'Cancelada': 'danger'
        };
        return statusClasses[status] || 'secondary';
    },

    showSuccessMessage: function(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    },

    // Placeholder functions for future implementation
    showNewSaleModal: function() {
        console.log('Nueva venta - Función por implementar');
        this.showSuccessMessage('Función "Nueva Venta" será implementada próximamente');
    },

    refreshTable: function() {
        this.loadData();
        this.applyFilters();
        this.showSuccessMessage('Tabla actualizada');
    },

    exportSales: function() {
        console.log('Exportar ventas - Función por implementar');
        this.showSuccessMessage('Función de exportación será implementada próximamente');
    },

    exportToExcel: function() {
        console.log('Exportar a Excel - Función por implementar');
        this.showSuccessMessage('Exportación a Excel será implementada próximamente');
    },

    exportToPdf: function() {
        console.log('Exportar a PDF - Función por implementar');
        this.showSuccessMessage('Exportación a PDF será implementada próximamente');
    },

    printSale: function() {
        if (!this.currentSaleId) return;
        console.log('Imprimir venta - Función por implementar');
        this.showSuccessMessage('Función de impresión será implementada próximamente');
    },

    editSale: function() {
        if (!this.currentSaleId) return;
        console.log('Editar venta - Función por implementar');
        this.showSuccessMessage('Función de edición será implementada próximamente');
    },

    // Sidebar functionality
    setupSidebar: function() {
        // Setup sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle('show');
                    this.toggleOverlay();
                } else {
                    sidebar.classList.toggle('collapsed');
                    mainContent.classList.toggle('expanded');
                }
            });
        }

        // Setup navigation links
        document.querySelectorAll('[data-module]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = link.dataset.module;
                if (module && module !== 'sales') {
                    window.dispatchEvent(new CustomEvent('navigate-to-module', {
                        detail: { module: module }
                    }));
                }
            });
        });

        // Setup logout
        const logoutBtn = document.getElementById('logoutBtnMgmt');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        // Setup user info
        this.updateUserInfo();

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('show');
                this.removeOverlay();
            }
        });
    },

    toggleOverlay: function() {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('show');
                this.removeOverlay();
            });
        }
        overlay.classList.toggle('show');
    },

    removeOverlay: function() {
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    },

    updateUserInfo: function() {
        const currentUser = window.MobiliAriState?.currentUser;
        if (currentUser) {
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            
            if (userName) userName.textContent = currentUser.name || 'Usuario';
            if (userRole) userRole.textContent = currentUser.role || 'Rol';
        }
    }
};

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.MobiliAriState === 'undefined') {
        console.warn('MobiliAriState not found, creating mock state');
        window.MobiliAriState = {
            getState: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
            updateState: (key, value) => localStorage.setItem(key, JSON.stringify(value))
        };
    }
    
    salesModule.init();
});

// Export for global access
window.salesModule = salesModule;
