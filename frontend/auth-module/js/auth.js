/**
 * Authentication Module
 * Handles login, registration, and authentication logic
 */

window.authModule = {
    init: function(data) {
        console.log('Authentication module initialized');
        this.setupEventListeners();
        this.setupFormValidation();
    },

    setupEventListeners: function() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Registration form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Show register form
        const showRegisterBtn = document.getElementById('showRegisterForm');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegistrationModal();
            });
        }

        // Show login form
        const showLoginBtn = document.getElementById('showLoginForm');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
    },

    setupFormValidation: function() {
        // Real-time validation for login form
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => {
                this.validatePassword(passwordInput);
            });
        }

        // Real-time validation for registration form
        const registerEmailInput = document.getElementById('registerEmail');
        const registerPasswordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('registerConfirmPassword');

        if (registerEmailInput) {
            registerEmailInput.addEventListener('blur', () => {
                this.validateEmail(registerEmailInput);
            });
        }

        if (registerPasswordInput) {
            registerPasswordInput.addEventListener('blur', () => {
                this.validatePassword(registerPasswordInput);
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', () => {
                this.validatePasswordConfirmation(registerPasswordInput, confirmPasswordInput);
            });
        }
    },

    validateEmail: function(emailInput) {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showFieldError(emailInput, 'El email es requerido');
            return false;
        } else if (!emailRegex.test(email)) {
            this.showFieldError(emailInput, 'Ingrese un email válido');
            return false;
        } else {
            this.showFieldSuccess(emailInput);
            return true;
        }
    },

    validatePassword: function(passwordInput) {
        const password = passwordInput.value;
        
        if (!password) {
            this.showFieldError(passwordInput, 'La contraseña es requerida');
            return false;
        } else if (password.length < 6) {
            this.showFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        } else {
            this.showFieldSuccess(passwordInput);
            return true;
        }
    },

    validatePasswordConfirmation: function(passwordInput, confirmInput) {
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        
        if (!confirmPassword) {
            this.showFieldError(confirmInput, 'Confirme su contraseña');
            return false;
        } else if (password !== confirmPassword) {
            this.showFieldError(confirmInput, 'Las contraseñas no coinciden');
            return false;
        } else {
            this.showFieldSuccess(confirmInput);
            return true;
        }
    },

    showFieldError: function(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        // Remove existing feedback
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Add error message
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        input.parentNode.appendChild(feedback);
    },

    showFieldSuccess: function(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        
        // Remove existing feedback
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
    },

    handleLogin: function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');

        // Validate form
        const emailValid = this.validateEmail(document.getElementById('email'));
        const passwordValid = this.validatePassword(document.getElementById('password'));

        if (!emailValid || !passwordValid) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        // Simulate API call delay
        setTimeout(() => {
            const user = this.authenticateUser(email, password);
            
            if (user) {
                // Successful login
                this.setButtonLoading(submitBtn, false);
                
                // Dispatch authentication event
                window.dispatchEvent(new CustomEvent('user-authenticated', {
                    detail: { user }
                }));
                
                // Show success message
                this.showAlert('success', `¡Bienvenido, ${user.name}!`);
                
            } else {
                // Failed login
                this.setButtonLoading(submitBtn, false);
                this.showAlert('error', 'Credenciales incorrectas. Verifique su email y contraseña.');
            }
        }, 1000);
    },

    handleRegistration: function() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');

        // Validate form
        const nameValid = name.length > 0;
        const emailValid = this.validateEmail(document.getElementById('registerEmail'));
        const passwordValid = this.validatePassword(document.getElementById('registerPassword'));
        const confirmValid = this.validatePasswordConfirmation(
            document.getElementById('registerPassword'),
            document.getElementById('registerConfirmPassword')
        );

        if (!nameValid) {
            this.showFieldError(document.getElementById('registerName'), 'El nombre es requerido');
            return;
        }

        if (!emailValid || !passwordValid || !confirmValid) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        // Simulate API call delay
        setTimeout(() => {
            // Create new user
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                role: 'cliente',
                status: 'Activo',
                lastLogin: new Date().toISOString().split('T')[0]
            };

            // Save to global state
            const users = window.MobiliAriState.getState('users') || [];
            users.push(newUser);
            window.MobiliAriState.updateState('users', users);

            this.setButtonLoading(submitBtn, false);
            
            // Show success message and switch to login
            this.showAlert('success', 'Cuenta creada exitosamente. Ahora puede iniciar sesión.');
            
            // Switch to login modal
            setTimeout(() => {
                this.showLoginModal();
                // Pre-fill email
                document.getElementById('email').value = email;
            }, 2000);
            
        }, 1000);
    },

    authenticateUser: function(email, password) {
        // Fixed credentials authentication
        if (email === 'admin@mobiliari.mx' && password === 'admin123') {
            return {
                id: 1,
                email: email,
                role: 'administrador',
                name: 'Administrador Principal'
            };
        } else if (email === 'cliente@mobiliari.mx' && password === 'cliente123') {
            return {
                id: 2,
                email: email,
                role: 'cliente',
                name: 'Cliente Usuario'
            };
        }

        // Check registered users
        const users = window.MobiliAriState.getState('users') || [];
        const user = users.find(u => u.email === email);
        
        if (user) {
            // In a real app, you'd verify the password hash
            // For demo purposes, we'll accept any password for registered users
            return {
                id: user.id,
                email: user.email,
                role: user.role || 'cliente',
                name: user.name
            };
        }

        return null;
    },

    showRegistrationModal: function() {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        
        if (loginModal && registerModal) {
            loginModal.style.display = 'none';
            registerModal.classList.add('show', 'd-block');
            registerModal.style.display = 'block';
            
            // Focus on first input
            setTimeout(() => {
                document.getElementById('registerName').focus();
            }, 300);
        }
    },

    showLoginModal: function() {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        
        if (loginModal && registerModal) {
            registerModal.classList.remove('show', 'd-block');
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
            
            // Focus on first input
            setTimeout(() => {
                document.getElementById('email').focus();
            }, 300);
        }
    },

    setButtonLoading: function(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Cargando...
            `;
        } else {
            button.disabled = false;
            const isRegister = button.closest('#registerForm');
            button.innerHTML = isRegister ? 'Crear Cuenta' : 'Ingresar';
        }
    },

    showAlert: function(type, message) {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
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
        window.authModule.init();
    });
} else {
    window.authModule.init();
}
