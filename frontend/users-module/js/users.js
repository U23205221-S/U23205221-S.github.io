/**
 * Users Module
 * Handles user management, roles, and permissions
 */

window.usersModule = {
    users: [],
    filteredUsers: [],
    
    init: function(data) {
        console.log('Users module initialized');
        this.loadUsers();
        this.setupEventListeners();
        this.renderUsers();
        this.updateStats();
        this.updateUserInfo();
        
        // Restore admin state
        if (window.restoreAdminState) {
            window.restoreAdminState();
        }
    },

    loadUsers: function() {
        this.users = window.MobiliAriState.getState('users') || this.getDefaultUsers();
        this.filteredUsers = [...this.users];
        
        if (window.MobiliAriState.getState('users').length === 0) {
            window.MobiliAriState.updateState('users', this.users);
        }
    },

    getDefaultUsers: function() {
        return [
            {
                id: 1,
                name: 'Administrador Principal',
                email: 'admin@mobiliari.mx',
                phone: '+52 55 1234-5678',
                role: 'administrador',
                status: 'Activo',
                lastLogin: '2025-01-15',
                address: 'Oficina Central, CDMX',
                orders: 0,
                notes: 'Usuario administrador principal del sistema',
                permissions: ['dashboard', 'orders', 'inventory', 'suppliers', 'reports', 'users', 'payments'],
                createdAt: '2024-01-01',
                avatar: null
            },
            {
                id: 2,
                name: 'Cliente Usuario',
                email: 'cliente@mobiliari.mx',
                phone: '+52 55 2345-6789',
                role: 'cliente',
                status: 'Activo',
                lastLogin: '2025-01-14',
                address: 'Col. Roma Norte, CDMX',
                orders: 3,
                notes: 'Cliente frecuente con múltiples pedidos',
                permissions: ['dashboard'],
                createdAt: '2024-06-15',
                avatar: null
            },
            {
                id: 3,
                name: 'Juan Pérez García',
                email: 'juan.perez@email.com',
                phone: '+52 55 3456-7890',
                role: 'cliente',
                status: 'Activo',
                lastLogin: '2025-01-13',
                address: 'Col. Condesa, CDMX',
                orders: 8,
                notes: 'Cliente VIP con pedidos de alto valor',
                permissions: ['dashboard'],
                createdAt: '2024-03-20',
                avatar: null
            },
            {
                id: 4,
                name: 'María González López',
                email: 'maria.gonzalez@email.com',
                phone: '+52 55 4567-8901',
                role: 'cliente',
                status: 'Activo',
                lastLogin: '2025-01-12',
                address: 'Col. Polanco, CDMX',
                orders: 6,
                notes: 'Especialista en muebles de oficina',
                permissions: ['dashboard'],
                createdAt: '2024-05-10',
                avatar: null
            },
            {
                id: 5,
                name: 'Carlos Empleado',
                email: 'carlos.empleado@mobiliari.mx',
                phone: '+52 55 5678-9012',
                role: 'empleado',
                status: 'Activo',
                lastLogin: '2025-01-15',
                address: 'Col. Centro, CDMX',
                orders: 0,
                notes: 'Empleado de producción',
                permissions: ['dashboard', 'orders', 'inventory'],
                createdAt: '2024-02-01',
                avatar: null
            },
            {
                id: 6,
                name: 'Ana Martínez',
                email: 'ana.martinez@email.com',
                phone: '+52 55 6789-0123',
                role: 'cliente',
                status: 'Inactivo',
                lastLogin: '2024-12-20',
                address: 'Col. Del Valle, CDMX',
                orders: 2,
                notes: 'Cliente inactivo desde diciembre',
                permissions: ['dashboard'],
                createdAt: '2024-08-15',
                avatar: null
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

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'users') {
                this.users = event.detail.value;
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

        this.filteredUsers = this.users.filter(user => {
            const matchesStatus = !statusFilter || user.status === statusFilter;
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesSearch = !userSearch || 
                user.name.toLowerCase().includes(userSearch) ||
                user.email.toLowerCase().includes(userSearch);

            return matchesStatus && matchesRole && matchesSearch;
        });

        // Sort users
        this.filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'lastLogin':
                    return new Date(b.lastLogin) - new Date(a.lastLogin);
                case 'role':
                    return a.role.localeCompare(b.role);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        this.renderUsers();
    },

    renderUsers: function() {
        const tableBody = document.getElementById('usersTableBody');
        if (!tableBody) return;

        if (this.filteredUsers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="empty-state">
                            <i class="bi bi-people text-muted"></i>
                            <p>No se encontraron usuarios</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredUsers.map(user => `
            <tr class="fade-in">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">
                        ${user.role}
                    </span>
                </td>
                <td>
                    <span class="status-badge status-${this.getStatusClass(user.status)}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <div class="activity-indicator">
                        <div class="activity-dot ${this.getActivityClass(user.lastLogin)}"></div>
                        ${this.formatDate(user.lastLogin)}
                    </div>
                </td>
                <td><strong>${user.orders}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-action btn-edit" onclick="usersModule.showUserDetail(${user.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-action btn-permissions" onclick="usersModule.showPermissions(${user.id})" title="Permisos">
                            <i class="bi bi-shield-check"></i>
                        </button>
                        <button class="btn btn-action btn-suspend" onclick="usersModule.toggleUserStatus(${user.id})" title="Suspender/Activar">
                            <i class="bi bi-${user.status === 'Activo' ? 'person-x' : 'person-check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    updateStats: function() {
        // Total users
        document.getElementById('totalUsers').textContent = this.users.length;

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

        if (!this.validateUserForm(form)) {
            return;
        }

        const newUser = {
            id: Math.max(...this.users.map(u => u.id), 0) + 1,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            status: 'Activo',
            lastLogin: null,
            address: formData.get('address'),
            orders: 0,
            notes: formData.get('notes'),
            permissions: this.getDefaultPermissions(formData.get('role')),
            createdAt: new Date().toISOString().split('T')[0],
            avatar: null
        };

        this.users.push(newUser);
        window.MobiliAriState.updateState('users', this.users);

        const modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
        modal.hide();

        // Simulate sending welcome email
        if (formData.get('sendWelcomeEmail')) {
            this.showAlert('info', `Email de bienvenida enviado a ${newUser.email}`);
        }

        this.showAlert('success', `Usuario ${newUser.name} creado exitosamente`);
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
