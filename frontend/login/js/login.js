/**
 * Login Module
 */
window.loginModule = {
    init: function() {
        console.log('Login module initialized');
        this.setupEventListeners();
        this.setupFormValidation();
        this.initGoogleSignIn();
    },

    setupEventListeners: function() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },

    initGoogleSignIn: function() {
        try {
            const clientId = document.querySelector('meta[name="google-client-id"]').content;
            if (!clientId || clientId.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
                console.warn('Google Client ID is not configured. Disabling Google Sign-In.');
                const googleBtn = document.getElementById('google-signin-btn');
                if (googleBtn) {
                    googleBtn.disabled = true;
                    googleBtn.title = 'Google Sign-In no está configurado';
                }
                return;
            }

            if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
                console.error('Google Identity Services script not loaded.');
                return;
            }

            google.accounts.id.initialize({
                client_id: clientId,
                callback: this.handleGoogleCredentialResponse.bind(this)
            });

            const googleBtn = document.getElementById('google-signin-btn');
            if (googleBtn) {
                google.accounts.id.renderButton(
                    googleBtn, 
                    { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '300' }
                );
            }
            // google.accounts.id.prompt(); // Optional: Show One Tap prompt

            const tryInit = (attempt = 0) => {
                const maxAttempts = 20; // ~4s total
                if (window.google && google.accounts && google.accounts.id) {
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: this.handleGoogleCredentialResponse.bind(this)
                    });
                    const googleBtn = document.getElementById('google-signin-btn');
                    if (googleBtn) {
                        google.accounts.id.renderButton(
                            googleBtn,
                            { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '300' }
                        );
                    }
                    return;
                }
                if (attempt < maxAttempts) {
                    setTimeout(() => tryInit(attempt + 1), 200);
                } else {
                    console.error('Google Identity Services script not loaded after waiting.');
                }
            };

            tryInit();
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    },

    handleGoogleCredentialResponse: function(response) {
        console.log("Google Sign-In response received.");
        // For demo purposes, we decode the token on the client side.
        // In a real application, send `response.credential` to your backend for verification.
        const decodedToken = JSON.parse(atob(response.credential.split('.')[1]));

        const user = {
            id: decodedToken.sub, // Google's unique user ID
            email: decodedToken.email,
            role: 'cliente', // Default role for Google users
            name: decodedToken.given_name || decodedToken.name,
            picture: decodedToken.picture
        };

        // Dispatch event to notify the container app of successful authentication
        window.dispatchEvent(new CustomEvent('user-authenticated', {
            detail: { user }
        }));

        this.showAlert('success', `¡Bienvenido, ${user.name}!`);
    },

    setupFormValidation: function() {
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
    },

    handleLogin: function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');

        const emailValid = this.validateEmail(document.getElementById('email'));
        const passwordValid = this.validatePassword(document.getElementById('password'));

        if (!emailValid || !passwordValid) {
            return;
        }

        this.setButtonLoading(submitBtn, true);

        setTimeout(() => {
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.setButtonLoading(submitBtn, false);
                window.dispatchEvent(new CustomEvent('user-authenticated', {
                    detail: { user }
                }));
                this.showAlert('success', `¡Bienvenido, ${user.name}!`);
            } else {
                this.setButtonLoading(submitBtn, false);
                this.showAlert('error', 'Credenciales incorrectas. Verifique su email y contraseña.');
            }
        }, 1000);
    },

    authenticateUser: function(email, password) {
        // Check registered users from global state first
        const users = window.MobiliAriState.getState('users') || [];
        const user = users.find(u => u.email === email);
        
        if (user && user.password === password) {
            return { id: user.id, email: user.email, role: user.role || 'cliente', name: user.name };
        }
        
        // Fixed credentials for demo (fallback)
        if (email === 'admin@mobiliaria.mx' && password === 'admin123') {
            return { id: 1, email: email, role: 'administrador', name: 'Administrador Principal' };
        }
        if (email === 'cliente@mobiliaria.mx' && password === 'cliente123') {
            return { id: 2, email: email, role: 'cliente', name: 'Cliente Principal' };
        }
        
        return null;
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
            button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Cargando...`;
        } else {
            button.disabled = false;
            button.innerHTML = 'Ingresar';
        }
    },

    showAlert: function(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i> ${message} <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(alert);
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
};
