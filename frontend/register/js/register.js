/**
 * Register Module
 */
window.registerModule = {
    init: function() {
        console.log('Register module initialized');
        this.setupEventListeners();
        this.setupFormValidation();
        this.initGoogleSignIn();
    },

    setupEventListeners: function() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
    },

    setupFormValidation: function() {
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

    handleRegistration: function() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');

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

        this.setButtonLoading(submitBtn, true);

        setTimeout(() => {
            const newUser = {
                id: Date.now(),
                name: name,
                email: email,
                role: 'cliente',
                status: 'Activo',
                lastLogin: new Date().toISOString().split('T')[0]
            };

            const users = window.MobiliAriState.getState('users') || [];
            users.push(newUser);
            window.MobiliAriState.updateState('users', users);

            this.setButtonLoading(submitBtn, false);
            this.showAlert('success', 'Cuenta creada exitosamente. Ahora puede iniciar sesión.');
            
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);
        }, 1000);
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
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        input.parentNode.appendChild(feedback);
    },

    showFieldSuccess: function(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
    },

    setButtonLoading: function(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Creando...`;
        } else {
            button.disabled = false;
            button.innerHTML = 'Crear Cuenta';
        }
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px';
        alert.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i> ${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alert);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    },

    initGoogleSignIn: function() {
        try {
            const clientId = document.querySelector('meta[name="google-client-id"]').content;
            const containerId = 'google-signin-btn-register';
            const container = document.getElementById(containerId);
            if (!container) return; // Nothing to render into

            if (!clientId || clientId.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
                console.warn('Google Client ID is not configured. Disabling Google Sign-In on register.');
                container.title = 'Google Sign-In no está configurado';
                return;
            }

            const tryInit = (attempt = 0) => {
                const maxAttempts = 20;
                if (window.google && google.accounts && google.accounts.id) {
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: this.handleGoogleCredentialResponse.bind(this)
                    });
                    google.accounts.id.renderButton(
                        container,
                        { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '300' }
                    );
                    return;
                }
                if (attempt < maxAttempts) {
                    setTimeout(() => tryInit(attempt + 1), 200);
                } else {
                    console.error('Google Identity Services script not loaded on register after waiting.');
                }
            };

            tryInit();
        } catch (error) {
            console.error('Error initializing Google Sign-In on register:', error);
        }
    },

    handleGoogleCredentialResponse: function(response) {
        try {
            const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));
            const user = {
                id: decodedToken.sub,
                email: decodedToken.email,
                role: 'cliente',
                name: decodedToken.given_name || decodedToken.name,
                picture: decodedToken.picture
            };

            window.dispatchEvent(new CustomEvent('user-authenticated', {
                detail: { user }
            }));

            this.showAlert('success', `¡Bienvenido, ${user.name}!`);
        } catch (e) {
            console.error('Failed to process Google credential on register:', e);
            this.showAlert('error', 'No se pudo iniciar sesión con Google.');
        }
    }
};