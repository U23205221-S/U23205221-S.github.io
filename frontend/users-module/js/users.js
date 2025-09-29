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
    
    init: async function(data) {
        console.log('Users module initialized');
        await this.loadData();
        this.setupEventListeners();
        this.renderTables();
        this.renderWorkers();
        this.updateStats();
        this.updateUserInfo();
        
        // Restore admin state
        if (window.restoreAdminState) {
            window.restoreAdminState();
        }
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
        // Navigation
        const navLinks = document.querySelectorAll('[data-module]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = e.target.getAttribute('data-module') || 
                            e.target.closest('[data-module]').getAttribute('data-module');
                
                if (module && module !== 'users') {
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

        // Tab switching
        const userTabs = document.querySelectorAll('#userTabs .nav-link');
        userTabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                this.applyFilters();
            });
        });

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'users') {
                this.loadData(); // Reload and re-split data
                this.applyFilters();
                this.updateStats();
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

        // Filter System Users
        this.filteredUsers = this.users.filter(user => {
            const matchesStatus = !statusFilter || user.status === statusFilter;
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesSearch = !userSearch || user.name.toLowerCase().includes(userSearch) || user.email.toLowerCase().includes(userSearch);
            return matchesStatus && matchesRole && matchesSearch;
        });

        // Filter Workers
        this.filteredWorkers = this.workers.filter(worker => {
            const matchesStatus = !statusFilter || worker.status === statusFilter;
            const matchesSearch = !userSearch || worker.name.toLowerCase().includes(userSearch) || worker.email.toLowerCase().includes(userSearch);
            return matchesStatus && matchesSearch;
        });

        // Filter Clients
        this.filteredClients = this.clients.filter(client => {
            const matchesStatus = !statusFilter || client.status === statusFilter;
            const matchesSearch = !userSearch || client.name.toLowerCase().includes(userSearch) || client.email.toLowerCase().includes(userSearch);
            return matchesStatus && matchesSearch;
        });

        // Note: Sorting is simplified for now and only applies to system users as before.
        // More complex sorting can be added if needed.
        this.filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'email': return a.email.localeCompare(b.email);
                case 'lastLogin': return new Date(b.lastLogin) - new Date(a.lastLogin);
                case 'role': return a.role.localeCompare(b.role);
                default: return a.name.localeCompare(b.name);
            }
        });

        this.renderTables();
    },

    renderTables: function() {
        this.renderSystemUsers();
        this.renderWorkers();
        this.renderClients();
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
            <tr>
                <td>${worker.name}</td>
                <td>${worker.identification_type}</td>
                <td>${worker.identification}</td>
                <td>${worker.position}</td>
                <td>${worker.email}</td>
                <td>${worker.phone}</td>
                <td><span class="status-badge status-${worker.status.toLowerCase()}">${worker.status}</span></td>
                <td><button class="btn btn-sm btn-outline-primary">Ver</button></td>
            </tr>
        `).join('') || `<tr><td colspan="8" class="text-center">No se encontraron trabajadores.</td></tr>`;
    },

    renderClients: function() {
        const tableBody = document.getElementById('clientsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredClients.map(client => `
            <tr>
                <td>${client.name}</td>
                <td>${client.identification_type}</td>
                <td>${client.identification}</td>
                <td>${client.client_type}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td><span class="status-badge status-${client.status.toLowerCase()}">${client.status}</span></td>
                <td><button class="btn btn-sm btn-outline-primary">Ver</button></td>
            </tr>
        `).join('') || `<tr><td colspan="8" class="text-center">No se encontraron clientes.</td></tr>`;
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
