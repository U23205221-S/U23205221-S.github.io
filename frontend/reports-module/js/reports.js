/**
 * Reports Module
 * Handles analytics, charts, and report generation
 */

window.reportsModule = {
    charts: {},
    reportData: {},
    
    init: function(data) {
        console.log('Reports module initialized');
        try {
            this.loadReportData();
            this.setupEventListeners();
            this.updateKPIs();
            this.loadTables();
            this.updateUserInfo();
            this.setDefaultDateRange();
            // Initialize charts after a delay to ensure Chart.js is loaded
            setTimeout(() => this.initializeCharts(), 200);
        } catch (error) {
            console.error('Error initializing reports module:', error);
        }
    },

    loadReportData: function() {
        // Load data from global state
        const orders = window.MobiliAriState.getState('orders') || [];
        const inventory = window.MobiliAriState.getState('inventory') || [];
        const suppliers = window.MobiliAriState.getState('suppliers') || [];
        
        this.reportData = {
            orders: orders,
            inventory: inventory,
            suppliers: suppliers,
            // Generate sample analytics data
            monthlyRevenue: this.generateMonthlyData(),
            topProducts: this.generateTopProducts(),
            topClients: this.generateTopClients()
        };
    },

    generateMonthlyData: function() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        
        return months.map((month, index) => ({
            month: month,
            revenue: index <= currentMonth ? Math.floor(Math.random() * 50000) + 20000 : 0,
            orders: index <= currentMonth ? Math.floor(Math.random() * 20) + 5 : 0
        }));
    },

    generateTopProducts: function() {
        return [
            { name: 'Mesas', value: 35, color: '#8B4513' },
            { name: 'Sillas', value: 25, color: '#A0522D' },
            { name: 'Armarios', value: 20, color: '#DEB887' },
            { name: 'Escritorios', value: 15, color: '#654321' },
            { name: 'Sofás', value: 5, color: '#D4AF37' }
        ];
    },

    generateTopClients: function() {
        return [
            { name: 'Juan Pérez', orders: 8, total: 45000 },
            { name: 'María González', orders: 6, total: 38000 },
            { name: 'Roberto Silva', orders: 5, total: 32000 },
            { name: 'Ana Martínez', orders: 4, total: 28000 },
            { name: 'Carlos López', orders: 3, total: 22000 }
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
                
                if (module && module !== 'reports') {
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

        // Report actions
        const generateReportBtn = document.getElementById('generateReportBtn');
        const exportBtn = document.getElementById('exportBtn');
        const updateReportBtn = document.getElementById('updateReportBtn');
        const confirmGenerateBtn = document.getElementById('confirmGenerateBtn');

        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.showGenerateReportModal();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportOptions();
            });
        }

        if (updateReportBtn) {
            updateReportBtn.addEventListener('click', () => {
                this.updateReports();
            });
        }

        if (confirmGenerateBtn) {
            confirmGenerateBtn.addEventListener('click', () => {
                this.generateCustomReport();
            });
        }
        
        // Modal close buttons
        const closeGenerateReportModalBtn = document.getElementById('closeGenerateReportModalBtn');
        const cancelGenerateReportBtn = document.getElementById('cancelGenerateReportBtn');
        
        if (closeGenerateReportModalBtn) {
            closeGenerateReportModalBtn.addEventListener('click', () => {
                this.closeGenerateReportModal();
            });
        }
        
        if (cancelGenerateReportBtn) {
            cancelGenerateReportBtn.addEventListener('click', () => {
                this.closeGenerateReportModal();
            });
        }
        
        // Modal backdrop clicks
        const generateReportModal = document.getElementById('generateReportModal');
        
        if (generateReportModal) {
            generateReportModal.addEventListener('click', (e) => {
                if (e.target === generateReportModal) {
                    this.closeGenerateReportModal();
                }
            });
            
            generateReportModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });
        }

        // Chart controls
        const chartControls = document.querySelectorAll('[data-chart]');
        chartControls.forEach(control => {
            control.addEventListener('click', (e) => {
                const chartType = e.target.getAttribute('data-chart');
                this.switchChart(chartType);
                
                // Update active state
                chartControls.forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Date filters
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const reportType = document.getElementById('reportType');

        if (dateFrom) {
            dateFrom.addEventListener('change', () => this.updateReports());
        }
        if (dateTo) {
            dateTo.addEventListener('change', () => this.updateReports());
        }
        if (reportType) {
            reportType.addEventListener('change', () => this.updateReports());
        }
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

    setDefaultDateRange: function() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (dateFrom) {
            dateFrom.value = firstDayOfMonth.toISOString().split('T')[0];
        }
        if (dateTo) {
            dateTo.value = today.toISOString().split('T')[0];
        }
    },

    initializeCharts: function() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.initializeCharts(), 100);
            return;
        }
        this.createRevenueChart();
        this.createProductsChart();
    },

    createRevenueChart: function() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) {
            console.warn('Revenue chart canvas not found');
            return;
        }

        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available, retrying...');
            setTimeout(() => this.createRevenueChart(), 500);
            return;
        }

        const data = this.reportData.monthlyRevenue;
        
        try {
            this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Ingresos',
                    data: data.map(d => d.revenue),
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8B4513',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating revenue chart:', error);
        }
    },

    createProductsChart: function() {
        const ctx = document.getElementById('productsChart');
        if (!ctx) {
            console.warn('Products chart canvas not found');
            return;
        }

        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not available for products chart, retrying...');
            setTimeout(() => this.createProductsChart(), 500);
            return;
        }

        const data = this.reportData.topProducts;
        
        try {
            this.charts.products = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: data.map(d => d.color),
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
        } catch (error) {
            console.error('Error creating products chart:', error);
        }
    },

    switchChart: function(chartType) {
        if (!this.charts.revenue) return;

        const data = this.reportData.monthlyRevenue;
        let newData, label, color;

        if (chartType === 'orders') {
            newData = data.map(d => d.orders);
            label = 'Pedidos';
            color = '#A0522D';
        } else {
            newData = data.map(d => d.revenue);
            label = 'Ingresos';
            color = '#8B4513';
        }

        this.charts.revenue.data.datasets[0].data = newData;
        this.charts.revenue.data.datasets[0].label = label;
        this.charts.revenue.data.datasets[0].borderColor = color;
        this.charts.revenue.data.datasets[0].backgroundColor = color + '1A';
        this.charts.revenue.data.datasets[0].pointBackgroundColor = color;
        
        this.charts.revenue.update();
    },

    updateKPIs: function() {
        const orders = this.reportData.orders;
        const completedOrders = orders.filter(o => o.status === 'Completado');
        
        // Total Revenue
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('revenueTrend').textContent = '+12.5%';

        // Total Orders
        document.getElementById('totalOrders').textContent = completedOrders.length;
        document.getElementById('ordersTrend').textContent = '+8.3%';

        // Average Delivery Time
        const avgDeliveryTime = Math.floor(Math.random() * 10) + 15; // Simulated
        document.getElementById('avgDeliveryTime').textContent = avgDeliveryTime;
        document.getElementById('deliveryTrend').textContent = '-5.2%';

        // Customer Satisfaction
        const satisfaction = Math.floor(Math.random() * 10) + 85; // Simulated
        document.getElementById('customerSatisfaction').textContent = `${satisfaction}%`;
        document.getElementById('satisfactionTrend').textContent = '+2.1%';
    },

    loadTables: function() {
        this.loadTopClientsTable();
        this.loadCriticalInventoryTable();
    },

    loadTopClientsTable: function() {
        const tableBody = document.getElementById('topClientsTable');
        if (!tableBody) return;

        const topClients = this.reportData.topClients;
        
        tableBody.innerHTML = topClients.map(client => `
            <tr>
                <td><strong>${client.name}</strong></td>
                <td>${client.orders}</td>
                <td><strong>$${client.total.toLocaleString()}</strong></td>
            </tr>
        `).join('');
    },

    loadCriticalInventoryTable: function() {
        const tableBody = document.getElementById('criticalInventoryTable');
        if (!tableBody) return;

        const criticalItems = this.reportData.inventory.filter(item => 
            item.currentQuantity <= item.minThreshold
        ).slice(0, 5);

        if (criticalItems.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        <i class="bi bi-check-circle me-2"></i>
                        Todos los materiales en stock adecuado
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = criticalItems.map(item => `
            <tr>
                <td><strong>${item.material}</strong></td>
                <td>${item.currentQuantity} ${item.unit}</td>
                <td>
                    <span class="status-indicator status-${this.getInventoryStatusClass(item.status)}">
                        ${item.status}
                    </span>
                </td>
            </tr>
        `).join('');
    },

    updateReports: function() {
        // Show loading state
        this.showLoadingState();
        
        // Simulate data refresh
        setTimeout(() => {
            this.loadReportData();
            this.updateKPIs();
            this.loadTables();
            
            // Update charts
            if (this.charts.revenue) {
                const data = this.reportData.monthlyRevenue;
                this.charts.revenue.data.datasets[0].data = data.map(d => d.revenue);
                this.charts.revenue.update();
            }
            
            if (this.charts.products) {
                const data = this.reportData.topProducts;
                this.charts.products.data.datasets[0].data = data.map(d => d.value);
                this.charts.products.update();
            }
            
            this.hideLoadingState();
            this.showAlert('success', 'Reportes actualizados exitosamente');
        }, 1500);
    },

    showGenerateReportModal: function() {
        const modal = document.getElementById('generateReportModal');
        const form = document.getElementById('reportForm');
        
        // Reset form and set default dates
        form.reset();
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        form.querySelector('[name="startDate"]').value = firstDayOfMonth.toISOString().split('T')[0];
        form.querySelector('[name="endDate"]').value = today.toISOString().split('T')[0];

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    closeGenerateReportModal: function() {
        const modal = document.getElementById('generateReportModal');
        
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
            console.error('Error closing generate report modal:', error);
            this.forceCloseModal('generateReportModal');
        }
        
        // Reset form
        const form = document.getElementById('reportForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de generar reporte cerrado');
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

    generateCustomReport: function() {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const reportConfig = {
            type: formData.get('reportType'),
            format: formData.get('format'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            includeCharts: formData.get('includeCharts') === 'on',
            includeDetails: formData.get('includeDetails') === 'on',
            includeTrends: formData.get('includeTrends') === 'on',
            includeComparisons: formData.get('includeComparisons') === 'on',
            notes: formData.get('notes')
        };

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('generateReportModal'));
        modal.hide();

        // Simulate report generation
        this.showAlert('info', 'Generando reporte... Esto puede tomar unos momentos.');
        
        setTimeout(() => {
            this.downloadReport(reportConfig);
        }, 2000);
    },

    downloadReport: function(config) {
        // Simulate file download
        const fileName = `reporte_${config.type}_${config.startDate}_${config.endDate}.${config.format}`;
        
        // Create a blob with sample content
        const content = this.generateReportContent(config);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showAlert('success', `Reporte ${fileName} descargado exitosamente`);
    },

    generateReportContent: function(config) {
        return `
REPORTE DE ${config.type.toUpperCase()}
Período: ${config.startDate} - ${config.endDate}
Generado: ${new Date().toLocaleString()}

${config.notes ? 'Notas: ' + config.notes + '\n' : ''}

=== RESUMEN EJECUTIVO ===
- Ingresos Totales: $${Math.floor(Math.random() * 100000).toLocaleString()}
- Pedidos Completados: ${Math.floor(Math.random() * 50)}
- Tiempo Promedio de Entrega: ${Math.floor(Math.random() * 10) + 15} días
- Satisfacción del Cliente: ${Math.floor(Math.random() * 10) + 85}%

=== DETALLES ===
${config.includeDetails ? 'Detalles incluidos en el reporte...' : 'Detalles omitidos'}

=== TENDENCIAS ===
${config.includeTrends ? 'Análisis de tendencias incluido...' : 'Tendencias omitidas'}

=== COMPARACIONES ===
${config.includeComparisons ? 'Comparaciones incluidas...' : 'Comparaciones omitidas'}

Reporte generado por MobiliAri - Sistema de Gestión
        `;
    },

    showExportOptions: function() {
        const exportMenu = document.createElement('div');
        exportMenu.className = 'position-fixed bg-white border rounded shadow-lg p-3';
        exportMenu.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 200px;';
        exportMenu.innerHTML = `
            <h6 class="mb-3">Exportar Datos</h6>
            <div class="export-options">
                <a href="#" class="export-btn" onclick="reportsModule.exportData('pdf')">
                    <i class="bi bi-file-pdf"></i>PDF
                </a>
                <a href="#" class="export-btn" onclick="reportsModule.exportData('excel')">
                    <i class="bi bi-file-excel"></i>Excel
                </a>
                <a href="#" class="export-btn" onclick="reportsModule.exportData('csv')">
                    <i class="bi bi-file-csv"></i>CSV
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
        const fileName = `datos_${new Date().toISOString().split('T')[0]}.${format}`;
        this.showAlert('success', `Exportando datos en formato ${format.toUpperCase()}...`);
        
        // Remove export menu
        const exportMenu = document.querySelector('.position-fixed.bg-white.border.rounded.shadow-lg');
        if (exportMenu) {
            exportMenu.remove();
        }
    },

    showLoadingState: function() {
        const charts = document.querySelectorAll('.chart-body');
        charts.forEach(chart => {
            const loading = document.createElement('div');
            loading.className = 'chart-loading';
            loading.innerHTML = '<div class="spinner-custom"></div>';
            chart.appendChild(loading);
        });
    },

    hideLoadingState: function() {
        const loadingElements = document.querySelectorAll('.chart-loading');
        loadingElements.forEach(el => el.remove());
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
    getInventoryStatusClass: function(status) {
        const statusMap = {
            'Disponible': 'normal',
            'Bajo inventario': 'medium',
            'Agotado': 'critical'
        };
        return statusMap[status] || 'normal';
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

// Initialize module when loaded (only if not in micro frontend environment)
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.reportsModule.init();
        });
    } else {
        window.reportsModule.init();
    }
}

// Global emergency function for reports modals
window.emergencyCloseReportsModals = function() {
    if (window.reportsModule) {
        console.log(' Cerrando modales de reportes de emergencia...');
        
        try {
            window.reportsModule.forceCloseModal('generateReportModal');
        } catch (error) {
            console.log('Error con funcion del modulo, usando fallback...');
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
        
        console.log(' Modales de reportes cerrados');
    }
};
