/**
 * Customization Module
 * Handles product customization, quotation generation, and custom orders
 */

window.customizationModule = {
    products: [],
    currentCustomization: null,
    materialPrices: {
        roble: 850,
        pino: 450,
        cedro: 1200,
        mdf: 320,
        melamina: 280
    },
    
    init: function(data) {
        console.log('Customization module initialized', data);
        this.loadProducts();
        this.setupEventListeners();
        this.updateCartCount();
        
        // If data contains productId, pre-fill form with product info
        if (data && data.productId) {
            this.customizeFromProduct(data.productId);
        }
    },

    loadProducts: function() {
        this.products = window.MobiliAriState.getState('products') || [];
    },

    setupEventListeners: function() {
        // Navigation
        const brandLink = document.getElementById('brandLink');
        const catalogNavLink = document.getElementById('catalogNavLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const cartBtn = document.getElementById('cartBtn');

        if (brandLink) {
            brandLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-module', {
                    detail: { module: 'catalog' }
                }));
            });
        }

        if (catalogNavLink) {
            catalogNavLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate-to-module', {
                    detail: { module: 'catalog' }
                }));
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('user-logout'));
            });
        }

        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate-to-module', {
                    detail: { module: 'cart' }
                }));
            });
        }

        // Customization options
        const createFromScratchBtn = document.getElementById('createFromScratchBtn');
        const selectProductBtn = document.getElementById('selectProductBtn');
        const resetFormBtn = document.getElementById('resetFormBtn');

        if (createFromScratchBtn) {
            createFromScratchBtn.addEventListener('click', () => {
                this.startFromScratch();
            });
        }

        if (selectProductBtn) {
            selectProductBtn.addEventListener('click', () => {
                this.showProductSelection();
            });
        }

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Form handling
        const customizeForm = document.getElementById('customizeForm');
        if (customizeForm) {
            customizeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateQuotation();
            });

            // Real-time quotation updates
            const formInputs = customizeForm.querySelectorAll('input, select, textarea');
            formInputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.updatePreview();
                    this.calculateQuotation();
                });
            });
        }

        // Add to cart button
        const addCustomToCartBtn = document.getElementById('addCustomToCartBtn');
        if (addCustomToCartBtn) {
            addCustomToCartBtn.addEventListener('click', () => {
                this.addCustomizationToCart();
            });
        }

        // File upload handling
        const fileInput = document.querySelector('input[name="referenceImage"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'cart') {
                this.updateCartCount();
            }
        });
    },

    startFromScratch: function() {
        document.getElementById('selectionSection').style.display = 'none';
        document.getElementById('customizeContent').style.display = 'block';
        this.currentCustomization = { type: 'scratch' };
        this.resetForm();
    },

    showProductSelection: function() {
        const modal = document.getElementById('productSelectionModal');
        const grid = document.getElementById('productSelectionGrid');
        
        if (this.products.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-box text-muted display-1"></i>
                    <p class="text-muted mt-3">No hay productos disponibles</p>
                </div>
            `;
        } else {
            grid.innerHTML = this.products.map(product => `
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card product-selection-card h-100" onclick="customizationModule.selectProductForCustomization(${product.id})">
                        <img src="${product.image}" alt="${product.name}" class="product-selection-image">
                        <div class="card-body">
                            <h6 class="card-title">${product.name}</h6>
                            <p class="card-text small text-muted">${product.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-wood fw-bold">$${product.price.toLocaleString()}</span>
                                <small class="text-muted">${product.category}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    selectProductForCustomization: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productSelectionModal'));
        modal.hide();

        // Show customization form
        document.getElementById('selectionSection').style.display = 'none';
        document.getElementById('customizeContent').style.display = 'block';
        
        this.customizeFromProduct(productId);
    },

    customizeFromProduct: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentCustomization = { 
            type: 'product', 
            baseProduct: product 
        };

        // Pre-fill form with product data
        const form = document.getElementById('customizeForm');
        
        // Set furniture type based on category
        const typeMapping = {
            'comedores': 'mesa',
            'salas': 'sofa',
            'dormitorios': 'cama',
            'oficina': 'escritorio'
        };
        
        const typeSelect = form.querySelector('[name="tipo"]');
        if (typeSelect && typeMapping[product.category]) {
            typeSelect.value = typeMapping[product.category];
        }

        // Set material if it matches our options
        const materialSelect = form.querySelector('[name="material"]');
        const productMaterial = product.material.toLowerCase().split(' ')[0]; // Take first word
        if (materialSelect && this.materialPrices[productMaterial]) {
            materialSelect.value = productMaterial;
        }

        // Set default dimensions based on product
        const dimensions = product.dimensions.split('x');
        if (dimensions.length >= 3) {
            const widthInput = form.querySelector('[name="ancho"]');
            const heightInput = form.querySelector('[name="alto"]');
            const depthInput = form.querySelector('[name="profundidad"]');
            
            if (widthInput) widthInput.value = parseInt(dimensions[0]);
            if (heightInput) heightInput.value = parseInt(dimensions[2]);
            if (depthInput) depthInput.value = parseInt(dimensions[1]);
        }

        // Update preview and calculate initial quotation
        this.updatePreview();
        this.calculateQuotation();
    },

    resetForm: function() {
        const form = document.getElementById('customizeForm');
        if (form) {
            form.reset();
            this.clearValidation();
            this.resetPreview();
            this.resetQuotation();
        }
    },

    updatePreview: function() {
        const previewArea = document.getElementById('previewArea');
        const form = document.getElementById('customizeForm');
        
        if (!form || !previewArea) return;

        const formData = new FormData(form);
        const tipo = formData.get('tipo');
        const material = formData.get('material');
        const ancho = formData.get('ancho');
        const alto = formData.get('alto');
        const profundidad = formData.get('profundidad');

        if (tipo && material && ancho && alto && profundidad) {
            // Create a simple preview representation
            previewArea.innerHTML = `
                <div class="preview-item">
                    <div class="preview-furniture ${tipo}" style="
                        background: linear-gradient(135deg, var(--wood-light), var(--wood-primary));
                        width: ${Math.min(200, parseInt(ancho) / 2)}px;
                        height: ${Math.min(150, parseInt(alto) / 2)}px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        margin-bottom: 1rem;
                    ">
                        <i class="bi bi-${this.getFurnitureIcon(tipo)} display-4"></i>
                    </div>
                    <div class="preview-details">
                        <h6 class="text-wood">${this.getFurnitureName(tipo)} Personalizado</h6>
                        <small class="text-muted">
                            ${ancho}cm × ${alto}cm × ${profundidad}cm<br>
                            Material: ${this.getMaterialName(material)}
                        </small>
                    </div>
                </div>
            `;
            previewArea.classList.add('has-preview');
        } else {
            this.resetPreview();
        }
    },

    resetPreview: function() {
        const previewArea = document.getElementById('previewArea');
        if (previewArea) {
            previewArea.innerHTML = `
                <i class="bi bi-image text-muted display-1"></i>
                <p class="text-muted mt-3">La vista previa aparecerá aquí</p>
            `;
            previewArea.classList.remove('has-preview');
        }
    },

    calculateQuotation: function() {
        const form = document.getElementById('customizeForm');
        if (!form) return;

        const formData = new FormData(form);
        const material = formData.get('material');
        const ancho = parseFloat(formData.get('ancho')) || 0;
        const alto = parseFloat(formData.get('alto')) || 0;
        const profundidad = parseFloat(formData.get('profundidad')) || 0;
        const acabado = formData.get('acabado');

        if (!material || !ancho || !alto || !profundidad) {
            this.resetQuotation();
            return;
        }

        // Calculate area in square meters
        const area = (ancho * alto * profundidad) / 1000000;
        
        // Material cost
        const materialPricePerUnit = this.materialPrices[material] || 500;
        const materialCost = area * materialPricePerUnit;

        // Labor cost (based on complexity and size)
        const laborCost = materialCost * 0.6; // 60% of material cost

        // Finish cost
        const finishMultiplier = this.getFinishMultiplier(acabado);
        const finishCost = materialCost * finishMultiplier;

        const total = materialCost + laborCost + finishCost;

        // Update UI
        document.getElementById('materialCost').textContent = `$${materialCost.toLocaleString('es-MX', {maximumFractionDigits: 0})}`;
        document.getElementById('laborCost').textContent = `$${laborCost.toLocaleString('es-MX', {maximumFractionDigits: 0})}`;
        document.getElementById('finishCost').textContent = `$${finishCost.toLocaleString('es-MX', {maximumFractionDigits: 0})}`;
        document.getElementById('totalCost').textContent = `$${total.toLocaleString('es-MX', {maximumFractionDigits: 0})}`;

        // Enable add to cart button if total > 0
        const addToCartBtn = document.getElementById('addCustomToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.disabled = total <= 0;
        }

        return {
            materialCost,
            laborCost,
            finishCost,
            total
        };
    },

    resetQuotation: function() {
        document.getElementById('materialCost').textContent = '$0.00';
        document.getElementById('laborCost').textContent = '$0.00';
        document.getElementById('finishCost').textContent = '$0.00';
        document.getElementById('totalCost').textContent = '$0.00';
        
        const addToCartBtn = document.getElementById('addCustomToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
        }
    },

    generateQuotation: function() {
        const form = document.getElementById('customizeForm');
        if (!this.validateForm(form)) {
            return;
        }

        const quotation = this.calculateQuotation();
        
        // Show success message
        this.showAlert('success', 'Cotización generada exitosamente. Puede agregar este producto personalizado al carrito.');
        
        // Scroll to quotation section
        document.getElementById('totalCost').scrollIntoView({ behavior: 'smooth' });
    },

    validateForm: function(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            } else {
                this.showFieldSuccess(field);
            }
        });

        // Validate dimensions
        const dimensionFields = ['ancho', 'alto', 'profundidad'];
        dimensionFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && field.value) {
                const value = parseFloat(field.value);
                if (value < 10 || value > 500) {
                    this.showFieldError(field, 'Debe estar entre 10 y 500 cm');
                    isValid = false;
                }
            }
        });

        return isValid;
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

    clearValidation: function() {
        const form = document.getElementById('customizeForm');
        if (form) {
            const inputs = form.querySelectorAll('.is-invalid, .is-valid');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
            
            const feedbacks = form.querySelectorAll('.invalid-feedback');
            feedbacks.forEach(feedback => feedback.remove());
        }
    },

    addCustomizationToCart: function() {
        const form = document.getElementById('customizeForm');
        if (!this.validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        const quotation = this.calculateQuotation();
        
        const customProduct = {
            id: Date.now(), // Unique ID for custom product
            name: `${this.getFurnitureName(formData.get('tipo'))} Personalizado`,
            price: Math.round(quotation.total),
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
            quantity: 1,
            customizations: {
                tipo: formData.get('tipo'),
                material: formData.get('material'),
                dimensions: `${formData.get('ancho')}x${formData.get('profundidad')}x${formData.get('alto')} cm`,
                acabado: formData.get('acabado'),
                notas: formData.get('notas'),
                baseProduct: this.currentCustomization?.baseProduct?.id || null
            }
        };

        // Add to cart
        const cart = window.MobiliAriState.getState('cart') || [];
        cart.push(customProduct);
        window.MobiliAriState.updateState('cart', cart);

        // Show success message
        this.showAlert('success', 'Producto personalizado agregado al carrito exitosamente.');
        
        // Reset form
        setTimeout(() => {
            this.resetForm();
            document.getElementById('selectionSection').style.display = 'block';
            document.getElementById('customizeContent').style.display = 'none';
        }, 2000);
    },

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showAlert('error', 'Por favor seleccione un archivo de imagen válido.');
            event.target.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('error', 'El archivo es demasiado grande. Máximo 5MB.');
            event.target.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewArea = document.getElementById('previewArea');
            const existingPreview = previewArea.querySelector('.file-preview');
            
            if (existingPreview) {
                existingPreview.remove();
            }
            
            const preview = document.createElement('div');
            preview.className = 'file-preview mt-2';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Vista previa" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 0.5rem;">
                <small class="d-block text-muted mt-1">Imagen de referencia</small>
            `;
            
            previewArea.appendChild(preview);
        };
        reader.readAsDataURL(file);
    },

    updateCartCount: function() {
        const cart = window.MobiliAriState.getState('cart') || [];
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = itemCount;
        }
    },

    // Helper functions
    getFurnitureIcon: function(tipo) {
        const icons = {
            mesa: 'table',
            silla: 'chair',
            armario: 'cabinet',
            cama: 'bed',
            escritorio: 'desk',
            sofa: 'couch'
        };
        return icons[tipo] || 'furniture';
    },

    getFurnitureName: function(tipo) {
        const names = {
            mesa: 'Mesa',
            silla: 'Silla',
            armario: 'Armario',
            cama: 'Cama',
            escritorio: 'Escritorio',
            sofa: 'Sofá'
        };
        return names[tipo] || 'Mueble';
    },

    getMaterialName: function(material) {
        const names = {
            roble: 'Roble',
            pino: 'Pino',
            cedro: 'Cedro',
            mdf: 'MDF',
            melamina: 'Melamina'
        };
        return names[material] || material;
    },

    getFinishMultiplier: function(acabado) {
        const multipliers = {
            natural: 0.1,
            'barniz-mate': 0.15,
            'barniz-brillante': 0.2,
            'pintura-blanca': 0.25,
            'pintura-negra': 0.25
        };
        return multipliers[acabado] || 0.15;
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
        window.customizationModule.init();
    });
} else {
    window.customizationModule.init();
}
