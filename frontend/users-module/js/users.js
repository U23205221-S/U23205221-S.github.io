/**
 * Users Module
 * Handles user management, roles, and permissions
 */

window.usersModule = {
    users: [],
    workers: [],
    clients: [],
    filteredUsers: [],
    filteredWorkers: [],
    filteredClients: [],
    currentSection: 'system-users',
    roles: [],
    permissions: [],
    currentConfigView: 'roles',
    // Worker configuration data
    positions: [],
    idTypes: [],
    personTypes: [],
    contracts: [],
    contractTypes: [],
    currentWorkerConfigView: 'positions',
    
    init: async function(data) {
        console.log('Users module initialized');
        
        // Clean up any residual modals
        this.cleanupModals();
        
        await this.loadData();
        this.setupEventListeners();
        this.switchSection('system-users'); // Initialize with system users
        this.updateStats();
        this.updateUserInfo();
        
        // Restore admin state
        if (window.restoreAdminState) {
            window.restoreAdminState();
        }
    },

    cleanupModals: function() {
        // Remove any existing modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Clean up body classes
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Reset modal states
        const modals = ['roleModal', 'permissionModal', 'positionModal', 'idTypeModal', 'personTypeModal', 'contractModal', 'contractTypeModal'];
        modals.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const existingModal = bootstrap.Modal.getInstance(modalElement);
                if (existingModal) {
                    existingModal.dispose();
                }
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
            }
        });
    },

    loadData: async function() {
        let allUsers = window.MobiliAriState.getState('users');
        if (!allUsers || allUsers.length === 0) {
            try {
                const response = await fetch('../data/users.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                allUsers = await response.json();
                window.MobiliAriState.updateState('users', allUsers);
            } catch (error) {
                console.error('Error loading users.json:', error);
                allUsers = [];
            }
        }

        this.users = allUsers.filter(u => u.profileType === 'system_user');
        this.workers = allUsers.filter(u => u.profileType === 'worker');
        this.clients = allUsers.filter(u => u.profileType === 'client');
        
        // Initialize filtered arrays
        this.filteredUsers = [...this.users];
        this.filteredWorkers = [...this.workers];
        this.filteredClients = [...this.clients];
    },

    setupEventListeners: function() {
        // Navigation - Handle all module navigation
        const navLinks = document.querySelectorAll('[data-module]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const clickedElement = e.target.closest('[data-module]');
                const module = clickedElement ? clickedElement.getAttribute('data-module') : null;
                const section = clickedElement ? clickedElement.getAttribute('data-section') : null;
                
                // Always prevent default for anchor tags
                e.preventDefault();
                
                // Handle users submenu navigation
                if (module === 'users' && section) {
                    this.switchSection(section);
                    return;
                }
                
                // Handle navigation to other modules
                if (module && module !== 'users') {
                    this.navigateToModule(module);
                    return;
                }
                
                // Handle main users link toggle (only if no section specified)
                if (module === 'users' && !section && clickedElement.id === 'usersMainLink') {
                    this.toggleUsersSubmenu();
                    return;
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

        // Action buttons
        const newUserBtn = document.getElementById('newUserBtn');
        const createUserBtn = document.getElementById('createUserBtn');
        const saveUserBtn = document.getElementById('saveUserBtn');
        const suspendUserBtn = document.getElementById('suspendUserBtn');
        const savePermissionsBtn = document.getElementById('savePermissionsBtn');

        if (newUserBtn) {
            newUserBtn.addEventListener('click', () => {
                this.showNewUserModal();
            });
        }

        // Profile type selector change
        const profileTypeSelector = document.getElementById('profileTypeSelector');
        if (profileTypeSelector) {
            profileTypeSelector.addEventListener('change', (e) => {
                this.renderDynamicFormFields(e.target.value);
            });
        }

        if (createUserBtn) {
            createUserBtn.addEventListener('click', () => {
                this.createNewUser();
            });
        }

        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', () => {
                this.saveUserChanges();
            });
        }

        if (suspendUserBtn) {
            suspendUserBtn.addEventListener('click', () => {
                this.suspendUser();
            });
        }

        if (savePermissionsBtn) {
            savePermissionsBtn.addEventListener('click', () => {
                this.savePermissions();
            });
        }

        // Configuration module buttons
        const newRoleBtn = document.getElementById('newRoleBtn');
        const newPermissionBtn = document.getElementById('newPermissionBtn');
        const saveRoleBtn = document.getElementById('saveRoleBtn');
        const savePermissionBtn = document.getElementById('savePermissionBtn');

        if (newRoleBtn) {
            newRoleBtn.addEventListener('click', () => {
                this.showNewRoleModal();
            });
        }

        if (newPermissionBtn) {
            newPermissionBtn.addEventListener('click', () => {
                this.showNewPermissionModal();
            });
        }

        if (saveRoleBtn) {
            saveRoleBtn.addEventListener('click', () => {
                this.saveRole();
            });
        }

        if (savePermissionBtn) {
            savePermissionBtn.addEventListener('click', () => {
                this.savePermission();
            });
        }

        // Modal close event listeners
        const roleModal = document.getElementById('roleModal');
        const permissionModal = document.getElementById('permissionModal');

        if (roleModal) {
            roleModal.addEventListener('hidden.bs.modal', () => {
                const form = document.getElementById('roleForm');
                if (form) {
                    form.reset();
                    form.classList.remove('was-validated');
                }
                this.currentEditingRole = null;
            });
        }

        if (permissionModal) {
            permissionModal.addEventListener('hidden.bs.modal', () => {
                const form = document.getElementById('permissionForm');
                if (form) {
                    form.reset();
                    form.classList.remove('was-validated');
                }
                this.currentEditingPermission = null;
            });
        }

        // Handle Escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Check if any configuration modal is open
                const openRoleModal = document.querySelector('#roleModal.show');
                const openPermissionModal = document.querySelector('#permissionModal.show');
                
                if (openRoleModal) {
                    this.closeModal('roleModal');
                } else if (openPermissionModal) {
                    this.closeModal('permissionModal');
                }
            }
        });

        // Add specific event listeners for close buttons
        document.addEventListener('click', (e) => {
            // Handle role modal close buttons
            if (e.target.matches('#roleModal .btn-close') || 
                e.target.matches('#roleModal [data-bs-dismiss="modal"]')) {
                e.preventDefault();
                this.closeModal('roleModal');
            }
            
            // Handle permission modal close buttons
            if (e.target.matches('#permissionModal .btn-close') || 
                e.target.matches('#permissionModal [data-bs-dismiss="modal"]')) {
                e.preventDefault();
                this.closeModal('permissionModal');
            }

            // Handle worker config modal close buttons
            const workerModals = ['positionModal', 'idTypeModal', 'personTypeModal', 'contractModal', 'contractTypeModal'];
            workerModals.forEach(modalId => {
                if (e.target.matches(`#${modalId} .btn-close`) || 
                    e.target.matches(`#${modalId} [data-bs-dismiss="modal"]`)) {
                    e.preventDefault();
                    this.closeModal(modalId);
                }
            });
        });

        // Worker configuration module buttons
        const workerConfigButtons = [
            { id: 'newPositionBtn', action: () => this.showNewPositionModal() },
            { id: 'newIdTypeBtn', action: () => this.showNewIdTypeModal() },
            { id: 'newPersonTypeBtn', action: () => this.showNewPersonTypeModal() },
            { id: 'newContractBtn', action: () => this.showNewContractModal() },
            { id: 'newContractTypeBtn', action: () => this.showNewContractTypeModal() },
            { id: 'savePositionBtn', action: () => this.savePosition() },
            { id: 'saveIdTypeBtn', action: () => this.saveIdType() },
            { id: 'savePersonTypeBtn', action: () => this.savePersonType() },
            { id: 'saveContractBtn', action: () => this.saveContract() },
            { id: 'saveContractTypeBtn', action: () => this.saveContractType() }
        ];

        workerConfigButtons.forEach(({ id, action }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', action);
            }
        });
        
        // Modal close buttons
        const closeNewUserModalBtn = document.getElementById('closeNewUserModalBtn');
        const cancelNewUserBtn = document.getElementById('cancelNewUserBtn');
        const closePermissionsModalBtn = document.getElementById('closePermissionsModalBtn');
        const cancelPermissionsBtn = document.getElementById('cancelPermissionsBtn');
        
        if (closeNewUserModalBtn) {
            closeNewUserModalBtn.addEventListener('click', () => {
                this.closeNewUserModal();
            });
        }
        
        if (cancelNewUserBtn) {
            cancelNewUserBtn.addEventListener('click', () => {
                this.closeNewUserModal();
            });
        }
        
        if (closePermissionsModalBtn) {
            closePermissionsModalBtn.addEventListener('click', () => {
                this.closePermissionsModal();
            });
        }
        
        if (cancelPermissionsBtn) {
            cancelPermissionsBtn.addEventListener('click', () => {
                this.closePermissionsModal();
            });
        }
        
        // Modal backdrop clicks
        const newUserModal = document.getElementById('newUserModal');
        const permissionsModal = document.getElementById('permissionsModal');
        
        if (newUserModal) {
            newUserModal.addEventListener('click', (e) => {
                if (e.target === newUserModal) {
                    this.closeNewUserModal();
                }
            });
            
            newUserModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });
        }
        
        if (permissionsModal) {
            permissionsModal.addEventListener('click', (e) => {
                if (e.target === permissionsModal) {
                    this.closePermissionsModal();
                }
            });
            
            permissionsModal.addEventListener('hidden.bs.modal', () => {
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
        const roleFilter = document.getElementById('roleFilter');
        const userSearch = document.getElementById('userSearch');
        const sortBy = document.getElementById('sortBy');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.applyFilters());
        }
        if (userSearch) {
            userSearch.addEventListener('input', () => this.applyFilters());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }

        // Remove old tab switching logic as we now use sections

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'users') {
                this.loadData(); // Reload and re-split data
                this.applyFilters();
                this.updateStats();
            }
        });
        
        // Handle navigation with section parameter
        window.addEventListener('navigate-to-users-section', (event) => {
            if (event.detail && event.detail.section) {
                this.switchSection(event.detail.section);
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
        const roleFilter = document.getElementById('roleFilter')?.value || '';
        const userSearch = document.getElementById('userSearch')?.value.toLowerCase() || '';
        const sortBy = document.getElementById('sortBy')?.value || 'name';

        // Filter based on current section
        switch(this.currentSection) {
            case 'system-users':
                this.filteredUsers = this.users.filter(user => {
                    const matchesStatus = !statusFilter || user.status === statusFilter;
                    const matchesRole = !roleFilter || user.role === roleFilter;
                    const matchesSearch = !userSearch || user.name.toLowerCase().includes(userSearch) || user.email.toLowerCase().includes(userSearch);
                    return matchesStatus && matchesRole && matchesSearch;
                });
                
                this.filteredUsers.sort((a, b) => {
                    switch (sortBy) {
                        case 'email': return a.email.localeCompare(b.email);
                        case 'lastLogin': return new Date(b.lastLogin) - new Date(a.lastLogin);
                        case 'role': return a.role.localeCompare(b.role);
                        default: return a.name.localeCompare(b.name);
                    }
                });
                break;
                
            case 'workers':
                this.filteredWorkers = this.workers.filter(worker => {
                    const matchesStatus = !statusFilter || worker.status === statusFilter;
                    const matchesSearch = !userSearch || worker.name.toLowerCase().includes(userSearch) || worker.email.toLowerCase().includes(userSearch);
                    return matchesStatus && matchesSearch;
                });
                break;
                
            case 'clients':
                this.filteredClients = this.clients.filter(client => {
                    const matchesStatus = !statusFilter || client.status === statusFilter;
                    const matchesSearch = !userSearch || client.name.toLowerCase().includes(userSearch) || client.email.toLowerCase().includes(userSearch);
                    return matchesStatus && matchesSearch;
                });
                break;
                
            case 'user-config':
            case 'worker-config':
                // Configuration sections don't use standard filters
                return;
        }

        this.renderTables();
    },

    switchSection: function(section) {
        // Update current section
        this.currentSection = section;
        
        // Hide all sections
        document.querySelectorAll('.section-content').forEach(sec => {
            sec.style.display = 'none';
        });
        
        // Show selected section
        const targetSection = document.getElementById(this.getSectionId(section));
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Update section title
        const sectionTitle = document.getElementById('sectionTitle');
        if (sectionTitle) {
            sectionTitle.textContent = this.getSectionTitle(section);
        }
        
        // Update active state in sidebar
        document.querySelectorAll('.submenu-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Apply filters and render appropriate table
        if (section === 'user-config') {
            this.loadConfigurationData();
            this.renderConfigurationSection();
        } else if (section === 'worker-config') {
            this.loadWorkerConfigurationData();
            this.renderWorkerConfigurationSection();
        } else {
            this.applyFilters();
        }
    },
    
    getSectionId: function(section) {
        const sectionMap = {
            'system-users': 'systemUsersSection',
            'workers': 'workersSection',
            'clients': 'clientsSection',
            'user-config': 'userConfigSection',
            'worker-config': 'workerConfigSection'
        };
        return sectionMap[section] || 'systemUsersSection';
    },
    
    getSectionTitle: function(section) {
        const titleMap = {
            'system-users': 'Usuarios del Sistema',
            'workers': 'Trabajadores',
            'clients': 'Clientes',
            'user-config': 'Configuración de Usuarios',
            'worker-config': 'Configuración de Trabajadores'
        };
        return titleMap[section] || 'Usuarios del Sistema';
    },
    
    toggleUsersSubmenu: function() {
        const submenu = document.getElementById('usersSubmenu');
        const chevron = document.getElementById('usersChevron');
        
        if (submenu && chevron) {
            submenu.classList.toggle('show');
            
            if (submenu.classList.contains('show')) {
                chevron.classList.remove('bi-chevron-right');
                chevron.classList.add('bi-chevron-down');
            } else {
                chevron.classList.remove('bi-chevron-down');
                chevron.classList.add('bi-chevron-right');
            }
        }
    },
    
    renderTables: function() {
        // Only render the table for the current section
        switch(this.currentSection) {
            case 'system-users':
                this.renderSystemUsers();
                break;
            case 'workers':
                this.renderWorkers();
                break;
            case 'clients':
                this.renderClients();
                break;
            case 'user-config':
                this.renderConfigurationSection();
                break;
            case 'worker-config':
                this.renderWorkerConfigurationSection();
                break;
            default:
                this.renderSystemUsers();
        }
    },

    renderSystemUsers: function() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredUsers.map(user => `
            <tr class="fade-in">
                <td>${user.name}</td>
                <td>${this.formatDate(user.birth_date)}</td>
                <td>${this.calculateAge(user.birth_date)}</td>
                <td>${user.area || 'N/A'}</td>
                <td>${user.position || 'N/A'}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>********</td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td>${this.formatDate(user.loginDate)}</td>
                <td>${user.successfulLoginAttempts || 0}</td>
                <td>${user.failedLoginAttempts || 0}</td>
                <td>${user.ipAddress || 'N/A'}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>${this.formatDate(user.password_change_date)}</td>
                <td><span class="status-badge status-${this.getStatusClass(user.status)}">${user.status}</span></td>
                <td>${user.role === 'administrador' ? 'Admin' : 'Empleado'}</td>
                <td>${user.permissions.length}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.showUserDetail(${user.id})" title="Ver detalles"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-action btn-permissions" onclick="usersModule.showPermissions(${user.id})" title="Permisos"><i class="bi bi-shield-check"></i></button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="20" class="text-center">No se encontraron usuarios del sistema</td></tr>`;
    },

    renderWorkers: function() {
        const tableBody = document.getElementById('workersTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredWorkers.map(worker => `
            <tr class="fade-in">
                <td>${worker.name}</td>
                <td>${worker.person_type || 'Natural'}</td>
                <td>${worker.identification_type}</td>
                <td>${worker.identification}</td>
                <td>${worker.position}</td>
                <td>${worker.email}</td>
                <td>${worker.phone}</td>
                <td>${this.formatDate(worker.birth_date)}</td>
                <td>${worker.district || 'N/A'}</td>
                <td>${worker.address || 'N/A'}</td>
                <td>${this.formatDate(worker.contract_start_date)} - ${this.formatDate(worker.contract_end_date)}</td>
                <td>${worker.contract_type || 'N/A'}</td>
                <td>$${worker.salary ? worker.salary.toLocaleString() : 'N/A'}</td>
                <td>${this.formatDate(worker.createdAt)}</td>
                <td><span class="status-badge status-${this.getStatusClass(worker.status)}">${worker.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.showWorkerDetail(${worker.id})" title="Ver detalles"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-action btn-edit" onclick="usersModule.editWorker(${worker.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="16" class="text-center">No se encontraron trabajadores</td></tr>`;
    },

    renderClients: function() {
        const tableBody = document.getElementById('clientsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredClients.map(client => `
            <tr class="fade-in">
                <td>${client.name}</td>
                <td>${client.person_type || 'Natural'}</td>
                <td>${client.identification_type}</td>
                <td>${client.identification}</td>
                <td>${client.client_type || 'Regular'}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${client.department || 'N/A'}</td>
                <td>${client.province || 'N/A'}</td>
                <td>${client.district || 'N/A'}</td>
                <td>${client.address || 'N/A'}</td>
                <td>${client.reference || 'N/A'}</td>
                <td>${client.total_orders || 0}</td>
                <td>${this.formatDate(client.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.showClientDetail(${client.id})" title="Ver detalles"><i class="bi bi-eye"></i></button>
                        <button class="btn btn-action btn-edit" onclick="usersModule.editClient(${client.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="15" class="text-center">No se encontraron clientes</td></tr>`;
    },

    calculateAge: function(birthDate) {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },
    
    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    },
    
    getStatusClass: function(status) {
        const statusMap = {
            'Activo': 'active',
            'Inactivo': 'inactive',
            'Suspendido': 'suspended'
        };
        return statusMap[status] || 'inactive';
    },
    
    showWorkerDetail: function(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        // Implement worker detail modal
        console.log('Show worker detail:', worker);
    },
    
    showClientDetail: function(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;
        
        // Implement client detail modal
        console.log('Show client detail:', client);
    },
    
    editWorker: function(workerId) {
        const worker = this.workers.find(w => w.id === workerId);
        if (!worker) return;
        
        // Implement worker edit functionality
        console.log('Edit worker:', worker);
    },
    
    editClient: function(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;
        
        // Implement client edit functionality
        console.log('Edit client:', client);
    },

    // Configuration Section Functions
    loadConfigurationData: function() {
        // Load roles from state or initialize with defaults
        this.roles = window.MobiliAriState.getState('roles') || this.getDefaultRoles();
        this.permissions = window.MobiliAriState.getState('permissions') || this.getDefaultPermissions();
        
        // Update state if empty
        if (window.MobiliAriState.getState('roles').length === 0) {
            window.MobiliAriState.updateState('roles', this.roles);
        }
        if (window.MobiliAriState.getState('permissions').length === 0) {
            window.MobiliAriState.updateState('permissions', this.permissions);
        }
        
        this.updateConfigStats();
    },

    getDefaultRoles: function() {
        return [
            {
                id: 1,
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Empleado',
                description: 'Acceso limitado a módulos operativos',
                status: 'Activo',
                createdAt: '2024-01-16',
                updatedAt: '2024-01-16'
            },
            {
                id: 3,
                name: 'Cliente',
                description: 'Acceso al catálogo y pedidos',
                status: 'Activo',
                createdAt: '2024-01-17',
                updatedAt: '2024-01-17'
            }
        ];
    },

    getDefaultPermissions: function() {
        return [
            {
                id: 1,
                name: 'dashboard_access',
                description: 'Acceso al dashboard principal',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'orders_management',
                description: 'Gestión de pedidos y tareas',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 3,
                name: 'inventory_management',
                description: 'Gestión de inventario y materia prima',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 4,
                name: 'users_management',
                description: 'Gestión de usuarios del sistema',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            },
            {
                id: 5,
                name: 'reports_access',
                description: 'Acceso a reportes y estadísticas',
                status: 'Activo',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15'
            }
        ];
    },

    updateConfigStats: function() {
        const totalRoles = this.roles.filter(r => r.status === 'Activo').length;
        const totalPermissions = this.permissions.filter(p => p.status === 'Activo').length;
        
        const totalRolesEl = document.getElementById('totalRoles');
        const totalPermissionsEl = document.getElementById('totalPermissions');
        
        if (totalRolesEl) totalRolesEl.textContent = totalRoles;
        if (totalPermissionsEl) totalPermissionsEl.textContent = totalPermissions;
    },

    renderConfigurationSection: function() {
        this.updateConfigStats();
        
        // Show roles table by default
        if (this.currentConfigView === 'roles') {
            this.showRolesTable();
        } else {
            this.showPermissionsTable();
        }
    },

    showRolesTable: function() {
        this.currentConfigView = 'roles';
        
        // Hide permissions table, show roles table
        const rolesContainer = document.getElementById('rolesTableContainer');
        const permissionsContainer = document.getElementById('permissionsTableContainer');
        
        if (rolesContainer) rolesContainer.style.display = 'block';
        if (permissionsContainer) permissionsContainer.style.display = 'none';
        
        this.renderRolesTable();
    },

    showPermissionsTable: function() {
        this.currentConfigView = 'permissions';
        
        // Hide roles table, show permissions table
        const rolesContainer = document.getElementById('rolesTableContainer');
        const permissionsContainer = document.getElementById('permissionsTableContainer');
        
        if (rolesContainer) rolesContainer.style.display = 'none';
        if (permissionsContainer) permissionsContainer.style.display = 'block';
        
        this.renderPermissionsTable();
    },

    renderRolesTable: function() {
        const tableBody = document.getElementById('rolesTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.roles.map(role => `
            <tr class="fade-in">
                <td>${role.name}</td>
                <td>${role.description}</td>
                <td><span class="status-badge status-${this.getStatusClass(role.status)}">${role.status}</span></td>
                <td>${this.formatDate(role.createdAt)}</td>
                <td>${this.formatDate(role.updatedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editRole(${role.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deleteRole(${role.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="6" class="text-center">No se encontraron roles</td></tr>`;
    },

    renderPermissionsTable: function() {
        const tableBody = document.getElementById('permissionsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.permissions.map(permission => `
            <tr class="fade-in">
                <td>${permission.name}</td>
                <td>${permission.description}</td>
                <td><span class="status-badge status-${this.getStatusClass(permission.status)}">${permission.status}</span></td>
                <td>${this.formatDate(permission.createdAt)}</td>
                <td>${this.formatDate(permission.updatedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editPermission(${permission.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deletePermission(${permission.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="6" class="text-center">No se encontraron permisos</td></tr>`;
    },

    // CRUD Functions for Roles
    showNewRoleModal: function() {
        const modalElement = document.getElementById('roleModal');
        const form = document.getElementById('roleForm');
        const title = document.getElementById('roleModalTitle');
        
        title.textContent = 'Nuevo Rol';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingRole = null;
        
        // Clean up any existing modal instance
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Create new modal instance
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        bsModal.show();
    },

    editRole: function(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;
        
        const modal = document.getElementById('roleModal');
        const form = document.getElementById('roleForm');
        const title = document.getElementById('roleModalTitle');
        
        title.textContent = 'Editar Rol';
        
        // Fill form with role data
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleDescription').value = role.description;
        document.getElementById('roleStatus').value = role.status;
        
        this.currentEditingRole = role;
        
        // Clean up any existing modal instance
        const existingModal = bootstrap.Modal.getInstance(modal);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Create new modal instance
        const bsModal = new bootstrap.Modal(modal, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        bsModal.show();
    },

    saveRole: function() {
        const form = document.getElementById('roleForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const roleData = {
            name: formData.get('name'),
            description: formData.get('description'),
            status: formData.get('status'),
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        if (this.currentEditingRole) {
            // Update existing role
            const index = this.roles.findIndex(r => r.id === this.currentEditingRole.id);
            if (index !== -1) {
                this.roles[index] = { ...this.currentEditingRole, ...roleData };
            }
        } else {
            // Create new role
            const newRole = {
                id: Math.max(...this.roles.map(r => r.id), 0) + 1,
                ...roleData,
                createdAt: new Date().toISOString().split('T')[0]
            };
            this.roles.push(newRole);
        }
        
        // Update state and UI
        window.MobiliAriState.updateState('roles', this.roles);
        this.renderRolesTable();
        this.updateConfigStats();
        
        // Close modal
        this.closeModal('roleModal');
        
        this.showSuccessMessage(this.currentEditingRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
    },

    deleteRole: function(roleId) {
        if (!confirm('¿Está seguro de eliminar este rol?')) return;
        
        this.roles = this.roles.filter(r => r.id !== roleId);
        window.MobiliAriState.updateState('roles', this.roles);
        this.renderRolesTable();
        this.updateConfigStats();
        
        this.showSuccessMessage('Rol eliminado exitosamente');
    },

    // CRUD Functions for Permissions
    showNewPermissionModal: function() {
        const modalElement = document.getElementById('permissionModal');
        const form = document.getElementById('permissionForm');
        const title = document.getElementById('permissionModalTitle');
        
        title.textContent = 'Nuevo Permiso';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingPermission = null;
        
        // Clean up any existing modal instance
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Create new modal instance
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        bsModal.show();
    },

    editPermission: function(permissionId) {
        const permission = this.permissions.find(p => p.id === permissionId);
        if (!permission) return;
        
        const modal = document.getElementById('permissionModal');
        const form = document.getElementById('permissionForm');
        const title = document.getElementById('permissionModalTitle');
        
        title.textContent = 'Editar Permiso';
        
        // Fill form with permission data
        document.getElementById('permissionName').value = permission.name;
        document.getElementById('permissionDescription').value = permission.description;
        document.getElementById('permissionStatus').value = permission.status;
        
        this.currentEditingPermission = permission;
        
        // Clean up any existing modal instance
        const existingModal = bootstrap.Modal.getInstance(modal);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Create new modal instance
        const bsModal = new bootstrap.Modal(modal, {
            backdrop: true,
            keyboard: true,
            focus: true
        });
        bsModal.show();
    },

    savePermission: function() {
        const form = document.getElementById('permissionForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const permissionData = {
            name: formData.get('name'),
            description: formData.get('description'),
            status: formData.get('status'),
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        if (this.currentEditingPermission) {
            // Update existing permission
            const index = this.permissions.findIndex(p => p.id === this.currentEditingPermission.id);
            if (index !== -1) {
                this.permissions[index] = { ...this.currentEditingPermission, ...permissionData };
            }
        } else {
            // Create new permission
            const newPermission = {
                id: Math.max(...this.permissions.map(p => p.id), 0) + 1,
                ...permissionData,
                createdAt: new Date().toISOString().split('T')[0]
            };
            this.permissions.push(newPermission);
        }
        
        // Update state and UI
        window.MobiliAriState.updateState('permissions', this.permissions);
        this.renderPermissionsTable();
        this.updateConfigStats();
        
        // Close modal
        this.closeModal('permissionModal');
        
        this.showSuccessMessage(this.currentEditingPermission ? 'Permiso actualizado exitosamente' : 'Permiso creado exitosamente');
    },

    deletePermission: function(permissionId) {
        if (!confirm('¿Está seguro de eliminar este permiso?')) return;
        
        this.permissions = this.permissions.filter(p => p.id !== permissionId);
        window.MobiliAriState.updateState('permissions', this.permissions);
        this.renderPermissionsTable();
        this.updateConfigStats();
        
        this.showSuccessMessage('Permiso eliminado exitosamente');
    },

    // Worker Configuration Section Functions
    loadWorkerConfigurationData: function() {
        // Load worker configuration data from state or initialize with defaults
        this.positions = window.MobiliAriState.getState('positions') || this.getDefaultPositions();
        this.idTypes = window.MobiliAriState.getState('idTypes') || this.getDefaultIdTypes();
        this.personTypes = window.MobiliAriState.getState('personTypes') || this.getDefaultPersonTypes();
        this.contracts = window.MobiliAriState.getState('contracts') || this.getDefaultContracts();
        this.contractTypes = window.MobiliAriState.getState('contractTypes') || this.getDefaultContractTypes();
        
        // Update state if empty
        if (window.MobiliAriState.getState('positions').length === 0) {
            window.MobiliAriState.updateState('positions', this.positions);
        }
        if (window.MobiliAriState.getState('idTypes').length === 0) {
            window.MobiliAriState.updateState('idTypes', this.idTypes);
        }
        if (window.MobiliAriState.getState('personTypes').length === 0) {
            window.MobiliAriState.updateState('personTypes', this.personTypes);
        }
        if (window.MobiliAriState.getState('contracts').length === 0) {
            window.MobiliAriState.updateState('contracts', this.contracts);
        }
        if (window.MobiliAriState.getState('contractTypes').length === 0) {
            window.MobiliAriState.updateState('contractTypes', this.contractTypes);
        }
        
        this.updateWorkerConfigStats();
    },

    getDefaultPositions: function() {
        return [
            {
                id: 1,
                name: 'Carpintero Senior',
                description: 'Carpintero con experiencia en muebles finos',
                status: 'Activo'
            },
            {
                id: 2,
                name: 'Diseñador',
                description: 'Diseñador de muebles y espacios',
                status: 'Activo'
            },
            {
                id: 3,
                name: 'Vendedor',
                description: 'Atención al cliente y ventas',
                status: 'Activo'
            }
        ];
    },

    getDefaultIdTypes: function() {
        return [
            { id: 1, name: 'DNI', status: 'Activo' },
            { id: 2, name: 'RUC', status: 'Activo' },
            { id: 3, name: 'Pasaporte', status: 'Activo' },
            { id: 4, name: 'Carnet de Extranjería', status: 'Activo' }
        ];
    },

    getDefaultPersonTypes: function() {
        return [
            { id: 1, name: 'Natural', status: 'Activo' },
            { id: 2, name: 'Jurídica', status: 'Activo' }
        ];
    },

    getDefaultContracts: function() {
        return [
            {
                id: 1,
                name: 'Contrato Juan Pérez',
                startDate: '2024-01-15',
                endDate: '2024-12-31',
                contractType: 'Indefinido',
                salary: 1500.00,
                status: 'Activo'
            },
            {
                id: 2,
                name: 'Contrato María García',
                startDate: '2024-02-01',
                endDate: '2024-08-31',
                contractType: 'Temporal',
                salary: 1200.00,
                status: 'Activo'
            }
        ];
    },

    getDefaultContractTypes: function() {
        return [
            { id: 1, name: 'Indefinido', status: 'Activo' },
            { id: 2, name: 'Temporal', status: 'Activo' },
            { id: 3, name: 'Por Obra', status: 'Activo' },
            { id: 4, name: 'Prácticas', status: 'Activo' }
        ];
    },

    updateWorkerConfigStats: function() {
        const totalPositions = this.positions.filter(p => p.status === 'Activo').length;
        const totalIdTypes = this.idTypes.filter(t => t.status === 'Activo').length;
        const totalPersonTypes = this.personTypes.filter(t => t.status === 'Activo').length;
        const totalContracts = this.contracts.filter(c => c.status === 'Activo').length;
        const totalContractTypes = this.contractTypes.filter(t => t.status === 'Activo').length;
        
        const elements = {
            'totalPositions': totalPositions,
            'totalIdTypes': totalIdTypes,
            'totalPersonTypes': totalPersonTypes,
            'totalContracts': totalContracts,
            'totalContractTypes': totalContractTypes
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },

    renderWorkerConfigurationSection: function() {
        this.updateWorkerConfigStats();
        
        // Show positions table by default
        if (this.currentWorkerConfigView === 'positions') {
            this.showPositionsTable();
        } else {
            this[`show${this.currentWorkerConfigView.charAt(0).toUpperCase() + this.currentWorkerConfigView.slice(1)}Table`]();
        }
    },

    showPositionsTable: function() {
        this.currentWorkerConfigView = 'positions';
        this.hideAllWorkerConfigTables();
        
        const container = document.getElementById('positionsTableContainer');
        if (container) container.style.display = 'block';
        
        this.renderPositionsTable();
    },

    showIdTypesTable: function() {
        this.currentWorkerConfigView = 'idTypes';
        this.hideAllWorkerConfigTables();
        
        const container = document.getElementById('idTypesTableContainer');
        if (container) container.style.display = 'block';
        
        this.renderIdTypesTable();
    },

    showPersonTypesTable: function() {
        this.currentWorkerConfigView = 'personTypes';
        this.hideAllWorkerConfigTables();
        
        const container = document.getElementById('personTypesTableContainer');
        if (container) container.style.display = 'block';
        
        this.renderPersonTypesTable();
    },

    showContractsTable: function() {
        this.currentWorkerConfigView = 'contracts';
        this.hideAllWorkerConfigTables();
        
        const container = document.getElementById('contractsTableContainer');
        if (container) container.style.display = 'block';
        
        this.renderContractsTable();
    },

    showContractTypesTable: function() {
        this.currentWorkerConfigView = 'contractTypes';
        this.hideAllWorkerConfigTables();
        
        const container = document.getElementById('contractTypesTableContainer');
        if (container) container.style.display = 'block';
        
        this.renderContractTypesTable();
    },

    hideAllWorkerConfigTables: function() {
        const containers = [
            'positionsTableContainer',
            'idTypesTableContainer', 
            'personTypesTableContainer',
            'contractsTableContainer',
            'contractTypesTableContainer'
        ];
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.style.display = 'none';
        });
    },

    renderPositionsTable: function() {
        const tableBody = document.getElementById('positionsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.positions.map(position => `
            <tr class="fade-in">
                <td>${position.name}</td>
                <td>${position.description}</td>
                <td><span class="status-badge status-${this.getStatusClass(position.status)}">${position.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editPosition(${position.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deletePosition(${position.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="text-center">No se encontraron puestos</td></tr>`;
    },

    renderIdTypesTable: function() {
        const tableBody = document.getElementById('idTypesTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.idTypes.map(idType => `
            <tr class="fade-in">
                <td>${idType.name}</td>
                <td><span class="status-badge status-${this.getStatusClass(idType.status)}">${idType.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editIdType(${idType.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deleteIdType(${idType.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="3" class="text-center">No se encontraron tipos de identificación</td></tr>`;
    },

    renderPersonTypesTable: function() {
        const tableBody = document.getElementById('personTypesTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.personTypes.map(personType => `
            <tr class="fade-in">
                <td>${personType.name}</td>
                <td><span class="status-badge status-${this.getStatusClass(personType.status)}">${personType.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editPersonType(${personType.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deletePersonType(${personType.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="3" class="text-center">No se encontraron tipos de persona</td></tr>`;
    },

    renderContractsTable: function() {
        const tableBody = document.getElementById('contractsTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.contracts.map(contract => `
            <tr class="fade-in">
                <td>${contract.name}</td>
                <td>${this.formatDate(contract.startDate)}</td>
                <td>${contract.endDate ? this.formatDate(contract.endDate) : 'Indefinido'}</td>
                <td>${contract.contractType}</td>
                <td>$${contract.salary ? contract.salary.toLocaleString() : 'N/A'}</td>
                <td><span class="status-badge status-${this.getStatusClass(contract.status)}">${contract.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editContract(${contract.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deleteContract(${contract.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="7" class="text-center">No se encontraron contratos</td></tr>`;
    },

    renderContractTypesTable: function() {
        const tableBody = document.getElementById('contractTypesTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = this.contractTypes.map(contractType => `
            <tr class="fade-in">
                <td>${contractType.name}</td>
                <td><span class="status-badge status-${this.getStatusClass(contractType.status)}">${contractType.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.editContractType(${contractType.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-action btn-delete" onclick="usersModule.deleteContractType(${contractType.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="3" class="text-center">No se encontraron tipos de contrato</td></tr>`;
    },

    // CRUD Functions for Positions
    showNewPositionModal: function() {
        const modalElement = document.getElementById('positionModal');
        const form = document.getElementById('positionForm');
        const title = document.getElementById('positionModalTitle');
        
        title.textContent = 'Nuevo Puesto';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingPosition = null;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    editPosition: function(positionId) {
        const position = this.positions.find(p => p.id === positionId);
        if (!position) return;
        
        const modalElement = document.getElementById('positionModal');
        const form = document.getElementById('positionForm');
        const title = document.getElementById('positionModalTitle');
        
        title.textContent = 'Editar Puesto';
        
        document.getElementById('positionName').value = position.name;
        document.getElementById('positionDescription').value = position.description;
        document.getElementById('positionStatus').value = position.status;
        
        this.currentEditingPosition = position;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    savePosition: function() {
        const form = document.getElementById('positionForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const positionData = {
            name: formData.get('name'),
            description: formData.get('description'),
            status: formData.get('status')
        };
        
        if (this.currentEditingPosition) {
            const index = this.positions.findIndex(p => p.id === this.currentEditingPosition.id);
            if (index !== -1) {
                this.positions[index] = { ...this.currentEditingPosition, ...positionData };
            }
        } else {
            const newPosition = {
                id: Math.max(...this.positions.map(p => p.id), 0) + 1,
                ...positionData
            };
            this.positions.push(newPosition);
        }
        
        window.MobiliAriState.updateState('positions', this.positions);
        this.renderPositionsTable();
        this.updateWorkerConfigStats();
        
        this.closeModal('positionModal');
        this.showSuccessMessage(this.currentEditingPosition ? 'Puesto actualizado exitosamente' : 'Puesto creado exitosamente');
    },

    deletePosition: function(positionId) {
        if (!confirm('¿Está seguro de eliminar este puesto?')) return;
        
        this.positions = this.positions.filter(p => p.id !== positionId);
        window.MobiliAriState.updateState('positions', this.positions);
        this.renderPositionsTable();
        this.updateWorkerConfigStats();
        
        this.showSuccessMessage('Puesto eliminado exitosamente');
    },

    // CRUD Functions for ID Types
    showNewIdTypeModal: function() {
        const modalElement = document.getElementById('idTypeModal');
        const form = document.getElementById('idTypeForm');
        const title = document.getElementById('idTypeModalTitle');
        
        title.textContent = 'Nuevo Tipo de Identificación';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingIdType = null;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    editIdType: function(idTypeId) {
        const idType = this.idTypes.find(t => t.id === idTypeId);
        if (!idType) return;
        
        const modalElement = document.getElementById('idTypeModal');
        const form = document.getElementById('idTypeForm');
        const title = document.getElementById('idTypeModalTitle');
        
        title.textContent = 'Editar Tipo de Identificación';
        
        document.getElementById('idTypeName').value = idType.name;
        document.getElementById('idTypeStatus').value = idType.status;
        
        this.currentEditingIdType = idType;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    saveIdType: function() {
        const form = document.getElementById('idTypeForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const idTypeData = {
            name: formData.get('name'),
            status: formData.get('status')
        };
        
        if (this.currentEditingIdType) {
            const index = this.idTypes.findIndex(t => t.id === this.currentEditingIdType.id);
            if (index !== -1) {
                this.idTypes[index] = { ...this.currentEditingIdType, ...idTypeData };
            }
        } else {
            const newIdType = {
                id: Math.max(...this.idTypes.map(t => t.id), 0) + 1,
                ...idTypeData
            };
            this.idTypes.push(newIdType);
        }
        
        window.MobiliAriState.updateState('idTypes', this.idTypes);
        this.renderIdTypesTable();
        this.updateWorkerConfigStats();
        
        this.closeModal('idTypeModal');
        this.showSuccessMessage(this.currentEditingIdType ? 'Tipo actualizado exitosamente' : 'Tipo creado exitosamente');
    },

    deleteIdType: function(idTypeId) {
        if (!confirm('¿Está seguro de eliminar este tipo de identificación?')) return;
        
        this.idTypes = this.idTypes.filter(t => t.id !== idTypeId);
        window.MobiliAriState.updateState('idTypes', this.idTypes);
        this.renderIdTypesTable();
        this.updateWorkerConfigStats();
        
        this.showSuccessMessage('Tipo eliminado exitosamente');
    },

    // CRUD Functions for Person Types
    showNewPersonTypeModal: function() {
        const modalElement = document.getElementById('personTypeModal');
        const form = document.getElementById('personTypeForm');
        const title = document.getElementById('personTypeModalTitle');
        
        title.textContent = 'Nuevo Tipo de Persona';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingPersonType = null;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    editPersonType: function(personTypeId) {
        const personType = this.personTypes.find(t => t.id === personTypeId);
        if (!personType) return;
        
        const modalElement = document.getElementById('personTypeModal');
        const form = document.getElementById('personTypeForm');
        const title = document.getElementById('personTypeModalTitle');
        
        title.textContent = 'Editar Tipo de Persona';
        
        document.getElementById('personTypeName').value = personType.name;
        document.getElementById('personTypeStatus').value = personType.status;
        
        this.currentEditingPersonType = personType;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    savePersonType: function() {
        const form = document.getElementById('personTypeForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const personTypeData = {
            name: formData.get('name'),
            status: formData.get('status')
        };
        
        if (this.currentEditingPersonType) {
            const index = this.personTypes.findIndex(t => t.id === this.currentEditingPersonType.id);
            if (index !== -1) {
                this.personTypes[index] = { ...this.currentEditingPersonType, ...personTypeData };
            }
        } else {
            const newPersonType = {
                id: Math.max(...this.personTypes.map(t => t.id), 0) + 1,
                ...personTypeData
            };
            this.personTypes.push(newPersonType);
        }
        
        window.MobiliAriState.updateState('personTypes', this.personTypes);
        this.renderPersonTypesTable();
        this.updateWorkerConfigStats();
        
        this.closeModal('personTypeModal');
        this.showSuccessMessage(this.currentEditingPersonType ? 'Tipo actualizado exitosamente' : 'Tipo creado exitosamente');
    },

    deletePersonType: function(personTypeId) {
        if (!confirm('¿Está seguro de eliminar este tipo de persona?')) return;
        
        this.personTypes = this.personTypes.filter(t => t.id !== personTypeId);
        window.MobiliAriState.updateState('personTypes', this.personTypes);
        this.renderPersonTypesTable();
        this.updateWorkerConfigStats();
        
        this.showSuccessMessage('Tipo eliminado exitosamente');
    },

    // CRUD Functions for Contracts
    showNewContractModal: function() {
        const modalElement = document.getElementById('contractModal');
        const form = document.getElementById('contractForm');
        const title = document.getElementById('contractModalTitle');
        
        title.textContent = 'Nuevo Contrato';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingContract = null;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    editContract: function(contractId) {
        const contract = this.contracts.find(c => c.id === contractId);
        if (!contract) return;
        
        const modalElement = document.getElementById('contractModal');
        const form = document.getElementById('contractForm');
        const title = document.getElementById('contractModalTitle');
        
        title.textContent = 'Editar Contrato';
        
        document.getElementById('contractName').value = contract.name;
        document.getElementById('contractType').value = contract.contractType;
        document.getElementById('contractStartDate').value = contract.startDate;
        document.getElementById('contractEndDate').value = contract.endDate || '';
        document.getElementById('contractSalary').value = contract.salary;
        document.getElementById('contractStatus').value = contract.status;
        
        this.currentEditingContract = contract;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    saveContract: function() {
        const form = document.getElementById('contractForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const contractData = {
            name: formData.get('name'),
            contractType: formData.get('contractType'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate') || null,
            salary: parseFloat(formData.get('salary')),
            status: formData.get('status')
        };
        
        if (this.currentEditingContract) {
            const index = this.contracts.findIndex(c => c.id === this.currentEditingContract.id);
            if (index !== -1) {
                this.contracts[index] = { ...this.currentEditingContract, ...contractData };
            }
        } else {
            const newContract = {
                id: Math.max(...this.contracts.map(c => c.id), 0) + 1,
                ...contractData
            };
            this.contracts.push(newContract);
        }
        
        window.MobiliAriState.updateState('contracts', this.contracts);
        this.renderContractsTable();
        this.updateWorkerConfigStats();
        
        this.closeModal('contractModal');
        this.showSuccessMessage(this.currentEditingContract ? 'Contrato actualizado exitosamente' : 'Contrato creado exitosamente');
    },

    deleteContract: function(contractId) {
        if (!confirm('¿Está seguro de eliminar este contrato?')) return;
        
        this.contracts = this.contracts.filter(c => c.id !== contractId);
        window.MobiliAriState.updateState('contracts', this.contracts);
        this.renderContractsTable();
        this.updateWorkerConfigStats();
        
        this.showSuccessMessage('Contrato eliminado exitosamente');
    },

    // CRUD Functions for Contract Types
    showNewContractTypeModal: function() {
        const modalElement = document.getElementById('contractTypeModal');
        const form = document.getElementById('contractTypeForm');
        const title = document.getElementById('contractTypeModalTitle');
        
        title.textContent = 'Nuevo Tipo de Contrato';
        form.reset();
        form.classList.remove('was-validated');
        
        this.currentEditingContractType = null;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    editContractType: function(contractTypeId) {
        const contractType = this.contractTypes.find(t => t.id === contractTypeId);
        if (!contractType) return;
        
        const modalElement = document.getElementById('contractTypeModal');
        const form = document.getElementById('contractTypeForm');
        const title = document.getElementById('contractTypeModalTitle');
        
        title.textContent = 'Editar Tipo de Contrato';
        
        document.getElementById('contractTypeName').value = contractType.name;
        document.getElementById('contractTypeStatus').value = contractType.status;
        
        this.currentEditingContractType = contractType;
        
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) existingModal.dispose();
        
        const bsModal = new bootstrap.Modal(modalElement, {
            backdrop: true, keyboard: true, focus: true
        });
        bsModal.show();
    },

    saveContractType: function() {
        const form = document.getElementById('contractTypeForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData(form);
        const contractTypeData = {
            name: formData.get('name'),
            status: formData.get('status')
        };
        
        if (this.currentEditingContractType) {
            const index = this.contractTypes.findIndex(t => t.id === this.currentEditingContractType.id);
            if (index !== -1) {
                this.contractTypes[index] = { ...this.currentEditingContractType, ...contractTypeData };
            }
        } else {
            const newContractType = {
                id: Math.max(...this.contractTypes.map(t => t.id), 0) + 1,
                ...contractTypeData
            };
            this.contractTypes.push(newContractType);
        }
        
        window.MobiliAriState.updateState('contractTypes', this.contractTypes);
        this.renderContractTypesTable();
        this.updateWorkerConfigStats();
        
        this.closeModal('contractTypeModal');
        this.showSuccessMessage(this.currentEditingContractType ? 'Tipo actualizado exitosamente' : 'Tipo creado exitosamente');
    },

    deleteContractType: function(contractTypeId) {
        if (!confirm('¿Está seguro de eliminar este tipo de contrato?')) return;
        
        this.contractTypes = this.contractTypes.filter(t => t.id !== contractTypeId);
        window.MobiliAriState.updateState('contractTypes', this.contractTypes);
        this.renderContractTypesTable();
        this.updateWorkerConfigStats();
        
        this.showSuccessMessage('Tipo eliminado exitosamente');
    },

    closeModal: function(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        // Force remove any existing instances
        const existingModal = bootstrap.Modal.getInstance(modalElement);
        if (existingModal) {
            existingModal.dispose();
        }
        
        // Remove modal classes and backdrop
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        
        // Remove backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Trigger hidden event manually
        const hiddenEvent = new Event('hidden.bs.modal');
        modalElement.dispatchEvent(hiddenEvent);
    },

    showSuccessMessage: function(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed';
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    },

    updateStats: function() {
        // Total users
        document.getElementById('totalUsers').textContent = this.users.length + this.clients.length + this.workers.length;

        // Active users
        const activeUsers = this.users.filter(u => u.status === 'Activo').length;
        document.getElementById('activeUsers').textContent = activeUsers;

        // Admin users
        const adminUsers = this.users.filter(u => u.role === 'administrador').length;
        document.getElementById('adminUsers').textContent = adminUsers;

        // Recent logins (today)
        const today = new Date().toISOString().split('T')[0];
        const recentLogins = this.users.filter(u => u.lastLogin === today).length;
        document.getElementById('recentLogins').textContent = recentLogins;
    },

    showUserDetail: function(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('userModalTitle');
        const modalContent = document.getElementById('userModalContent');

        modalTitle.textContent = `Usuario: ${user.name}`;
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="user-detail-section">
                        <h6><i class="bi bi-person me-2"></i>Información Personal</h6>
                        <div class="detail-item">
                            <span class="detail-label">Nombre:</span>
                            <input type="text" class="form-control form-control-sm" value="${user.name}" id="editUserName">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <input type="email" class="form-control form-control-sm" value="${user.email}" id="editUserEmail">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Teléfono:</span>
                            <input type="tel" class="form-control form-control-sm" value="${user.phone || ''}" id="editUserPhone">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rol:</span>
                            <select class="form-select form-select-sm" id="editUserRole">
                                <option value="cliente" ${user.role === 'cliente' ? 'selected' : ''}>Cliente</option>
                                <option value="empleado" ${user.role === 'empleado' ? 'selected' : ''}>Empleado</option>
                                <option value="administrador" ${user.role === 'administrador' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <select class="form-select form-select-sm" id="editUserStatus">
                                <option value="Activo" ${user.status === 'Activo' ? 'selected' : ''}>Activo</option>
                                <option value="Inactivo" ${user.status === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                                <option value="Suspendido" ${user.status === 'Suspendido' ? 'selected' : ''}>Suspendido</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="user-detail-section">
                        <h6><i class="bi bi-graph-up me-2"></i>Estadísticas</h6>
                        <div class="detail-item">
                            <span class="detail-label">Pedidos Realizados:</span>
                            <span class="detail-value"><strong>${user.orders}</strong></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Último Acceso:</span>
                            <span class="detail-value">${this.formatDate(user.lastLogin)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de Registro:</span>
                            <span class="detail-value">${this.formatDate(user.createdAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Permisos:</span>
                            <span class="detail-value">${user.permissions.length} módulos</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="user-detail-section">
                <h6><i class="bi bi-geo-alt me-2"></i>Dirección</h6>
                <textarea class="form-control" rows="2" id="editUserAddress">${user.address || ''}</textarea>
            </div>
            
            <div class="user-detail-section">
                <h6><i class="bi bi-chat-dots me-2"></i>Notas</h6>
                <textarea class="form-control" rows="3" id="editUserNotes">${user.notes || ''}</textarea>
            </div>
        `;

        // Store current user for saving
        this.currentEditingUser = user;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    showNewUserModal: function() {
        const modal = document.getElementById('newUserModal');
        const form = document.getElementById('newUserForm');
        form.reset();

        // Clear dynamic fields and render for the default selection
        document.getElementById('dynamic-fields-container').innerHTML = '';
        this.renderDynamicFormFields(''); // Render empty initially

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    closeNewUserModal: function() {
        const modal = document.getElementById('newUserModal');
        
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
            console.error('Error closing new user modal:', error);
            this.forceCloseModal('newUserModal');
        }
        
        // Reset form
        const form = document.getElementById('newUserForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de nuevo usuario cerrado');
    },
    
    closePermissionsModal: function() {
        const modal = document.getElementById('permissionsModal');
        
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
            console.error('Error closing permissions modal:', error);
            this.forceCloseModal('permissionsModal');
        }
        
        console.log('Modal de permisos cerrado');
    },
    
    renderDynamicFormFields: function(profileType) {
        const container = document.getElementById('dynamic-fields-container');
        container.innerHTML = '';
        let fieldsHtml = '';
        const today = new Date().toISOString().split('T')[0];

        switch (profileType) {
            case 'system_user':
                fieldsHtml = `
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Nombre</label><input type="text" class="form-control" name="name" required></div>
                        <div class="col-md-6"><label class="form-label">Fecha Nacimiento</label><input type="date" class="form-control" name="birth_date"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Área</label><input type="text" class="form-control" name="area"></div>
                        <div class="col-md-6"><label class="form-label">Puesto</label><input type="text" class="form-control" name="position"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Usuario</label><input type="text" class="form-control" name="username" required></div>
                        <div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" name="email" required></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Contraseña</label><input type="password" class="form-control" name="password" required></div>
                        <div class="col-md-6"><label class="form-label">Tipo de Usuario / Rol</label><select class="form-select" name="role"><option value="empleado">Empleado</option><option value="administrador">Administrador</option></select></div>
                    </div>
                    <hr>
                    <div class="mb-3">
                        <label class="form-label">Permisos</label>
                        <div class="permission-group-form">
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="dashboard" checked><label class="form-check-label">Dashboard</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="orders"><label class="form-check-label">Pedidos</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="inventory"><label class="form-check-label">Inventario</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="suppliers"><label class="form-check-label">Proveedores</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="reports"><label class="form-check-label">Reportes</label></div>
                            <div class="form-check form-check-inline"><input class="form-check-input" type="checkbox" name="permissions" value="users"><label class="form-check-label">Usuarios</label></div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Fecha de Registro</label><input type="date" class="form-control" name="createdAt" value="${today}" readonly></div>
                    </div>
                `;
                break;
            case 'trabajador':
                fieldsHtml = `
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Nombre Completo</label><input type="text" class="form-control" name="name" required></div>
                        <div class="col-md-6"><label class="form-label">Tipo Persona</label><input type="text" class="form-control" name="person_type" value="Natural"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Tipo Identificación</label><select class="form-select" name="identification_type"><option>DNI</option><option>Pasaporte</option></select></div>
                        <div class="col-md-6"><label class="form-label">Nro. Identificación</label><input type="text" class="form-control" name="identification" required></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" name="email"></div>
                        <div class="col-md-6"><label class="form-label">Teléfono</label><input type="tel" class="form-control" name="phone"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Puesto</label><input type="text" class="form-control" name="position"></div>
                        <div class="col-md-6"><label class="form-label">Fecha Nacimiento</label><input type="date" class="form-control" name="birth_date"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Distrito</label><input type="text" class="form-control" name="district"></div>
                        <div class="col-md-6"><label class="form-label">Salario</label><input type="number" step="0.01" class="form-control" name="salary"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Inicio Contrato</label><input type="date" class="form-control" name="contract_start_date"></div>
                        <div class="col-md-6"><label class="form-label">Fin Contrato</label><input type="date" class="form-control" name="contract_end_date"></div>
                    </div>
                        <div class="row mb-3">
                            <div class="col-md-6"><label class="form-label">Tipo Contrato</label><input type="text" class="form-control" name="contract_type"></div>
                            <div class="col-md-6"><label class="form-label">Fecha de Registro</label><input type="date" class="form-control" name="createdAt" value="${today}"></div>
                    </div>
                `;
                break;
            case 'cliente':
                fieldsHtml = `
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Nombre</label><input type="text" class="form-control" name="name" required></div>
                        <div class="col-md-6"><label class="form-label">Tipo Persona</label><select class="form-select" name="person_type"><option>Natural</option><option>Jurídica</option></select></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Tipo Identificación</label><select class="form-select" name="identification_type"><option>DNI</option><option>RUC</option></select></div>
                        <div class="col-md-6"><label class="form-label">Nro. Identificación</label><input type="text" class="form-control" name="identification"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" name="email"></div>
                        <div class="col-md-6"><label class="form-label">Teléfono</label><input type="tel" class="form-control" name="phone"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Departamento</label><input type="text" class="form-control" name="department"></div>
                        <div class="col-md-6"><label class="form-label">Provincia</label><input type="text" class="form-control" name="province"></div>
                    </div>
                     <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Distrito</label><input type="text" class="form-control" name="district"></div>
                        <div class="col-md-6"><label class="form-label">Dirección</label><input type="text" class="form-control" name="address"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Referencia</label><input type="text" class="form-control" name="reference"></div>
                        <div class="col-md-6"><label class="form-label">Tipo Cliente</label><input type="text" class="form-control" name="client_type"></div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6"><label class="form-label">Fecha de Registro</label><input type="date" class="form-control" name="createdAt" value="${today}"></div>
                    </div>
                `;
                break;
        }
        container.innerHTML = fieldsHtml;
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

    createNewUser: function() {
        const form = document.getElementById('newUserForm');
        const formData = new FormData(form);
        const profileType = formData.get('profile_type');

        if (!profileType) {
            this.showAlert('danger', 'Por favor, selecciona un tipo de perfil.');
            return;
        }

        const newId = Math.max(...[...this.users, ...this.workers, ...this.clients].map(p => p.id), 0) + 1;
        let newProfile = { id: newId, status: 'Activo' };

        switch (profileType) {
            case 'system_user':
                const role = formData.get('role');
                const permissions = formData.getAll('permissions');
                Object.assign(newProfile, {
                    name: formData.get('name'),
                    birth_date: formData.get('birth_date'),
                    area: formData.get('area'),
                    position: formData.get('position'),
                    username: formData.get('username'),
                    email: formData.get('email'),
                    createdAt: formData.get('createdAt'),
                    role: role,
                    permissions: permissions.length > 0 ? permissions : this.getDefaultPermissions(role),
                    lastLogin: null,
                    password_change_date: null,
                    failed_login_attempts: 0
                });
                this.users.push(newProfile);
                break;
            case 'trabajador':
                Object.assign(newProfile, {
                    name: formData.get('name'),
                    person_type: formData.get('person_type'),
                    identification_type: formData.get('identification_type'),
                    identification: formData.get('identification'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    position: formData.get('position'),
                    birth_date: formData.get('birth_date'),
                    district: formData.get('district'),
                    salary: parseFloat(formData.get('salary') || 0),
                    contract_start_date: formData.get('contract_start_date'),
                    contract_end_date: formData.get('contract_end_date'),
                    contract_type: formData.get('contract_type'),
                    createdAt: formData.get('createdAt')
                });
                this.workers.push(newProfile);
                break;
            case 'cliente':
                Object.assign(newProfile, {
                    name: formData.get('name'),
                    person_type: formData.get('person_type'),
                    identification_type: formData.get('identification_type'),
                    identification: formData.get('identification'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    department: formData.get('department'),
                    province: formData.get('province'),
                    district: formData.get('district'),
                    address: formData.get('address'),
                    reference: formData.get('reference'),
                    client_type: formData.get('client_type'),
                    createdAt: formData.get('createdAt'),
                    role: 'cliente',
                    orders: 0
                });
                this.clients.push(newProfile);
                break;
        }

        this.updateAndSaveState();
        this.closeNewUserModal();
        this.showAlert('success', `Perfil para ${newProfile.name} creado exitosamente`);
        this.applyFilters();
    },

    validateUserForm: function(form) {
        const formData = new FormData(form);
        let isValid = true;

        // Check if email already exists
        const email = formData.get('email');
        const existingUser = this.users.find(u => u.email === email);
        if (existingUser) {
            this.showFieldError(form.querySelector('[name="email"]'), 'Este email ya está registrado');
            isValid = false;
        }

        // Check password confirmation
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        if (password !== confirmPassword) {
            this.showFieldError(form.querySelector('[name="confirmPassword"]'), 'Las contraseñas no coinciden');
            isValid = false;
        }

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            } else {
                this.showFieldSuccess(field);
            }
        });

        return isValid;
    },

    saveUserChanges: function() {
        if (!this.currentEditingUser) return;

        const userId = this.currentEditingUser.id;
        const userIndex = this.users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            this.users[userIndex].name = document.getElementById('editUserName').value;
            this.users[userIndex].email = document.getElementById('editUserEmail').value;
            this.users[userIndex].phone = document.getElementById('editUserPhone').value;
            this.users[userIndex].role = document.getElementById('editUserRole').value;
            this.users[userIndex].status = document.getElementById('editUserStatus').value;
            this.users[userIndex].address = document.getElementById('editUserAddress').value;
            this.users[userIndex].notes = document.getElementById('editUserNotes').value;

            // Update permissions based on new role
            this.users[userIndex].permissions = this.getDefaultPermissions(this.users[userIndex].role);

            window.MobiliAriState.updateState('users', this.users);

            const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            modal.hide();

            this.showAlert('success', 'Usuario actualizado exitosamente');
        }
    },

    suspendUser: function() {
        if (!this.currentEditingUser) return;

        const userId = this.currentEditingUser.id;
        const userIndex = this.users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            const newStatus = this.users[userIndex].status === 'Activo' ? 'Suspendido' : 'Activo';
            this.users[userIndex].status = newStatus;

            window.MobiliAriState.updateState('users', this.users);

            const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
            modal.hide();

            this.showAlert('success', `Usuario ${newStatus.toLowerCase()} exitosamente`);
        }
    },

    toggleUserStatus: function(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const newStatus = this.users[userIndex].status === 'Activo' ? 'Suspendido' : 'Activo';
            this.users[userIndex].status = newStatus;

            window.MobiliAriState.updateState('users', this.users);
            this.showAlert('success', `Usuario ${newStatus.toLowerCase()} exitosamente`);
        }
    },

    showPermissions: function(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('permissionsModal');
        
        // Set current permissions
        const permissions = user.permissions || [];
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const permission = checkbox.id.replace('perm_', '');
            checkbox.checked = permissions.includes(permission);
        });

        this.currentPermissionsUser = user;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    savePermissions: function() {
        if (!this.currentPermissionsUser) return;

        const modal = document.getElementById('permissionsModal');
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        const permissions = Array.from(checkboxes).map(cb => cb.id.replace('perm_', ''));

        const userIndex = this.users.findIndex(u => u.id === this.currentPermissionsUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].permissions = permissions;
            window.MobiliAriState.updateState('users', this.users);

            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();

            this.showAlert('success', 'Permisos actualizados exitosamente');
        }
    },

    getDefaultPermissions: function(role) {
        switch (role) {
            case 'administrador':
                return ['dashboard', 'orders', 'inventory', 'suppliers', 'reports', 'users', 'payments'];
            case 'empleado':
                return ['dashboard', 'orders', 'inventory'];
            case 'cliente':
            default:
                return ['dashboard'];
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
            'Activo': 'activo',
            'Inactivo': 'inactivo',
            'Suspendido': 'suspendido'
        };
        return statusMap[status] || 'inactivo';
    },

    getActivityClass: function(lastLogin) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (lastLogin === today) return 'online';
        if (lastLogin === yesterday) return 'recent';
        return '';
    },

    formatDate: function(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    showFieldError: function(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        let feedback = input.parentNode.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    },

    showFieldSuccess: function(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    },

    formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    getStatusClass: function(status) {
        const statusMap = {
            'Activo': 'activo',
            'Inactivo': 'inactivo',
            'Suspendido': 'suspendido'
        };
        return statusMap[status] || 'inactivo';
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
    }
};

// Initialize module when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.usersModule.init();
    });
} else {
    window.usersModule.init();
}

// Global emergency function for users modals
window.emergencyCloseUsersModals = function() {
    if (window.usersModule) {
        console.log('🚨 Cerrando modales de usuarios de emergencia...');
        
        try {
            window.usersModule.forceCloseModal('newUserModal');
            window.usersModule.forceCloseModal('permissionsModal');
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
        
        console.log('✅ Modales de usuarios cerrados');
    }
};
