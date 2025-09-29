/**
 * Inventory Module
 * Handles inventory management, stock control, and material tracking
 */

window.inventoryModule = {
    prefabricatedMaterials: [],
    customMaterials: [],
    baseMaterials: [],
    filteredPrefabricatedMaterials: [],
    filteredCustomMaterials: [],
    filteredBaseMaterials: [],
    suppliers: [],
    stockHistory: [],
    
    init: async function(data) {
        console.log('Inventory module initialized');
        await this.loadInventory();
        this.setupEventListeners();
        this.renderInventory();
        this.updateStats();
        this.updateUserInfo();
        this.loadSupplierOptions();
    },

    loadInventory: async function() {
        let prefabricated = window.MobiliAriState.getState('prefabricatedMaterials');
        let custom = window.MobiliAriState.getState('customMaterials');
        let base = window.MobiliAriState.getState('baseMaterials');

        if (!prefabricated || prefabricated.length === 0) {
            try {
                const response = await fetch('../data/prefabricated-materials.json');
                prefabricated = await response.json();
                window.MobiliAriState.updateState('prefabricatedMaterials', prefabricated);
            } catch (error) {
                console.error('Error loading prefabricated materials:', error);
                prefabricated = [];
            }
        }

        if (!custom || custom.length === 0) {
            try {
                const response = await fetch('../data/custom-materials.json');
                custom = await response.json();
                window.MobiliAriState.updateState('customMaterials', custom);
            } catch (error) {
                console.error('Error loading custom materials:', error);
                custom = [];
            }
        }

        if (!base || base.length === 0) {
            try {
                const response = await fetch('../data/base-materials.json');
                base = await response.json();
                window.MobiliAriState.updateState('baseMaterials', base);
            } catch (error) {
                console.error('Error loading base materials:', error);
                base = [];
            }
        }

        this.prefabricatedMaterials = prefabricated;
        this.customMaterials = custom;
        this.baseMaterials = base;
        this.filteredPrefabricatedMaterials = [...this.prefabricatedMaterials];
        this.filteredCustomMaterials = [...this.customMaterials];
        this.filteredBaseMaterials = [...this.baseMaterials];
        this.suppliers = window.MobiliAriState.getState('suppliers') || [];
        this.stockHistory = window.MobiliAriState.getState('stockHistory') || [];
    },


    getDefaultSuppliers: function() {
        return [
            'Maderas Premium SA',
            'Maderera del Norte',
            'Tableros Industriales',
            'Maderas Finas',
            'Ferretería Industrial',
            'Químicos y Pinturas'
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
                
                if (module && module !== 'inventory') {
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
        const newMaterialBtn = document.getElementById('newMaterialBtn');
        const addStockBtn = document.getElementById('addStockBtn');
        const createMaterialBtn = document.getElementById('createMaterialBtn');
        const confirmAddStockBtn = document.getElementById('confirmAddStockBtn');
        const saveMaterialBtn = document.getElementById('saveMaterialBtn');

        if (newMaterialBtn) {
            newMaterialBtn.addEventListener('click', () => {
                this.showNewMaterialModal();
            });
        }

        if (addStockBtn) {
            addStockBtn.addEventListener('click', () => {
                this.showAddStockModal();
            });
        }

        if (createMaterialBtn) {
            createMaterialBtn.addEventListener('click', () => {
                this.createNewMaterial();
            });
        }

        if (confirmAddStockBtn) {
            confirmAddStockBtn.addEventListener('click', () => {
                this.addStock();
            });
        }

        if (saveMaterialBtn) {
            saveMaterialBtn.addEventListener('click', () => {
                this.saveMaterialChanges();
            });
        }

        // Delete confirmation modal
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDeleteMaterial();
            });
        }
        
        // Modal close buttons
        const closeAddStockModalBtn = document.getElementById('closeAddStockModalBtn');
        const cancelAddStockBtn = document.getElementById('cancelAddStockBtn');
        const closeNewMaterialModalBtn = document.getElementById('closeNewMaterialModalBtn');
        const cancelNewMaterialBtn = document.getElementById('cancelNewMaterialBtn');
        
        if (closeAddStockModalBtn) {
            closeAddStockModalBtn.addEventListener('click', () => {
                this.closeAddStockModal();
            });
        }
        
        if (cancelAddStockBtn) {
            cancelAddStockBtn.addEventListener('click', () => {
                this.closeAddStockModal();
            });
        }
        
        if (closeNewMaterialModalBtn) {
            closeNewMaterialModalBtn.addEventListener('click', () => {
                this.closeNewMaterialModal();
            });
        }
        
        if (cancelNewMaterialBtn) {
            cancelNewMaterialBtn.addEventListener('click', () => {
                this.closeNewMaterialModal();
            });
        }
        
        // Modal backdrop clicks
        const addStockModal = document.getElementById('addStockModal');
        const newMaterialModal = document.getElementById('newMaterialModal');
        
        if (addStockModal) {
            addStockModal.addEventListener('click', (e) => {
                if (e.target === addStockModal) {
                    this.closeAddStockModal();
                }
            });
            
            addStockModal.addEventListener('hidden.bs.modal', () => {
                setTimeout(() => {
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }, 100);
            });
        }
        
        if (newMaterialModal) {
            newMaterialModal.addEventListener('click', (e) => {
                if (e.target === newMaterialModal) {
                    this.closeNewMaterialModal();
                }
            });
            
            newMaterialModal.addEventListener('hidden.bs.modal', () => {
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
        const materialSearch = document.getElementById('materialSearch');
        const supplierFilter = document.getElementById('supplierFilter');
        const sortBy = document.getElementById('sortBy');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (materialSearch) {
            materialSearch.addEventListener('input', () => this.applyFilters());
        }
        if (supplierFilter) {
            supplierFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }

        const materialTypeSelector = document.getElementById('materialTypeSelector');
        if (materialTypeSelector) {
            materialTypeSelector.addEventListener('change', (e) => {
                const prefabricatedFields = document.getElementById('prefabricated-material-fields');
                const customFields = document.getElementById('custom-material-fields');
                const baseFields = document.getElementById('base-material-fields');
                
                // Hide all fields first
                prefabricatedFields.style.display = 'none';
                customFields.style.display = 'none';
                baseFields.style.display = 'none';
                
                // Show the selected field
                if (e.target.value === 'prefabricated') {
                    prefabricatedFields.style.display = 'block';
                } else if (e.target.value === 'custom') {
                    customFields.style.display = 'block';
                } else if (e.target.value === 'base') {
                    baseFields.style.display = 'block';
                }
            });
        }

        // Listen for state updates
        window.addEventListener('state-updated', (event) => {
            if (event.detail.key === 'inventory') {
                this.inventory = event.detail.value;
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
        // For now, just copy the full lists to the filtered lists.
        // Filtering logic can be added later.
        this.filteredPrefabricatedMaterials = [...this.prefabricatedMaterials];
        this.filteredCustomMaterials = [...this.customMaterials];
        this.filteredBaseMaterials = [...this.baseMaterials];

        this.renderInventory();
    },

    renderInventory: function() {
        this.renderPrefabricatedMaterials();
        this.renderCustomMaterials();
        this.renderBaseMaterials();
    },

    renderPrefabricatedMaterials: function() {
        const tableBody = document.getElementById('prefabricatedMaterialsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredPrefabricatedMaterials.map(m => `
            <tr>
                <td>${m.materialName}</td>
                <td>${m.currentStock}</td>
                <td>${m.minStock}</td>
                <td>${m.materialType}</td>
                <td>${m.materialState}</td>
                <td>${m.description}</td>
                <td>${m.imagePath}</td>
                <td>$${m.cost.toLocaleString()}</td>
                <td>${m.unit}</td>
                <td>${m.generalStock}</td>
                <td>${this.formatDate(m.registrationDate)}</td>
                <td>${this.formatDate(m.updateDate)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="inventoryModule.editMaterial('prefabricated', ${m.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="inventoryModule.showDeleteConfirmation('prefabricated', ${m.id}, '${m.materialName}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="13" class="text-center">No hay materiales prefabricados.</td></tr>`;
    },

    renderCustomMaterials: function() {
        const tableBody = document.getElementById('customMaterialsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredCustomMaterials.map(m => `
            <tr>
                <td>${m.materialName}</td>
                <td>${m.currentStock}</td>
                <td>${m.minStock}</td>
                <td>${m.materialType}</td>
                <td>${m.materialState}</td>
                <td>${m.description}</td>
                <td>${m.imagePath}</td>
                <td>$${m.cost.toLocaleString()}</td>
                <td>${m.unit}</td>
                <td>${m.generalStock}</td>
                <td>${this.formatDate(m.registrationDate)}</td>
                <td>${this.formatDate(m.updateDate)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="inventoryModule.editMaterial('custom', ${m.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="inventoryModule.showDeleteConfirmation('custom', ${m.id}, '${m.materialName}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="13" class="text-center">No hay materiales personalizados.</td></tr>`;
    },

    renderBaseMaterials: function() {
        const tableBody = document.getElementById('baseMaterialsTableBody');
        if (!tableBody) return;
        tableBody.innerHTML = this.filteredBaseMaterials.map(m => `
            <tr>
                <td>${m.materialName}</td>
                <td>${m.currentStock}</td>
                <td>${m.minStock}</td>
                <td>${m.materialType}</td>
                <td>${m.materialState}</td>
                <td>${m.description}</td>
                <td>${m.imagePath}</td>
                <td>$${m.cost.toLocaleString()}</td>
                <td>${m.unit}</td>
                <td>${m.generalStock}</td>
                <td>${this.formatDate(m.registrationDate)}</td>
                <td>${this.formatDate(m.updateDate)}</td>
            </tr>
        `).join('') || `<tr><td colspan="12" class="text-center">No hay materiales base.</td></tr>`;
    },

    updateStats: function() {
        const allMaterials = [...this.prefabricatedMaterials, ...this.customMaterials, ...this.baseMaterials];
        document.getElementById('totalMaterials').textContent = allMaterials.length;

        const lowStockCount = allMaterials.filter(item => 
            item.currentStock <= item.minStock && item.currentStock > 0
        ).length;
        document.getElementById('lowStockCount').textContent = lowStockCount;

        const outOfStockCount = allMaterials.filter(item => 
            item.currentStock === 0
        ).length;
        document.getElementById('outOfStockCount').textContent = outOfStockCount;

        const totalValue = allMaterials.reduce((total, item) => 
            total + (item.currentStock * item.cost), 0
        );
        document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
    },

    showMaterialDetail: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        const modal = document.getElementById('materialModal');
        const modalTitle = document.getElementById('materialModalTitle');
        const modalContent = document.getElementById('materialModalContent');

        modalTitle.textContent = `Material: ${material.material}`;
        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="material-detail-section">
                        <h6><i class="bi bi-info-circle me-2"></i>Información General</h6>
                        <div class="detail-item">
                            <span class="detail-label">Material:</span>
                            <input type="text" class="form-control form-control-sm" value="${material.material}" id="editMaterial">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cantidad Actual:</span>
                            <span class="detail-value">${material.currentQuantity} ${material.unit}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cantidad Mínima:</span>
                            <input type="number" class="form-control form-control-sm" value="${material.minThreshold}" id="editMinThreshold">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Precio por Unidad:</span>
                            <input type="number" class="form-control form-control-sm" value="${material.pricePerUnit}" id="editPricePerUnit">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <span class="status-badge status-${this.getStatusClass(material.status)}">${material.status}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="material-detail-section">
                        <h6><i class="bi bi-truck me-2"></i>Información de Proveedor</h6>
                        <div class="detail-item">
                            <span class="detail-label">Proveedor:</span>
                            <select class="form-select form-select-sm" id="editSupplier">
                                ${this.suppliers.map(supplier => 
                                    `<option value="${supplier}" ${supplier === material.supplier ? 'selected' : ''}>${supplier}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Última Compra:</span>
                            <span class="detail-value">${this.formatDate(material.lastPurchase)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ubicación:</span>
                            <input type="text" class="form-control form-control-sm" value="${material.location || ''}" id="editLocation">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Valor Total:</span>
                            <span class="detail-value fw-bold">$${(material.currentQuantity * material.pricePerUnit).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="material-detail-section">
                <h6><i class="bi bi-chat-dots me-2"></i>Notas</h6>
                <textarea class="form-control" rows="3" id="editNotes">${material.notes || ''}</textarea>
            </div>
            
            <div class="material-detail-section">
                <h6><i class="bi bi-clock-history me-2"></i>Historial de Stock</h6>
                <div class="stock-history" id="stockHistoryContainer">
                    ${this.renderStockHistory(materialId)}
                </div>
            </div>
        `;

        // Store current material for saving
        this.currentEditingMaterial = material;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    renderStockHistory: function(materialId) {
        const history = this.stockHistory.filter(h => h.materialId === materialId)
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .slice(0, 10); // Show last 10 entries

        if (history.length === 0) {
            return `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-clock-history display-4 d-block mb-2"></i>
                    <p>No hay historial de movimientos</p>
                </div>
            `;
        }

        return history.map(entry => `
            <div class="history-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <div class="history-action">${entry.action}</div>
                        <div class="history-date">${this.formatDate(entry.date)}</div>
                    </div>
                    <div class="history-quantity">${entry.quantity > 0 ? '+' : ''}${entry.quantity} ${entry.unit}</div>
                </div>
                ${entry.notes ? `<small class="text-muted">${entry.notes}</small>` : ''}
            </div>
        `).join('');
    },

    showNewMaterialModal: function() {
        const modal = document.getElementById('newMaterialModal');
        const form = document.getElementById('newMaterialForm');
        
        // Reset form
        form.reset();

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    showAddStockModal: function() {
        const modal = document.getElementById('addStockModal');
        const form = document.getElementById('addStockForm');
        const materialSelect = form.querySelector('[name="materialId"]');
        const materialStateInput = form.querySelector('[name="materialState"]');
        
        form.reset();
        
        const allMaterials = [...this.prefabricatedMaterials, ...this.customMaterials, ...this.baseMaterials];
        materialSelect.innerHTML = '<option value="">Seleccionar material...</option>' +
            allMaterials.map(item => 
                `<option value="${item.id}" data-state="${item.materialState}">${item.materialName} (${item.currentStock} ${item.unit})</option>`
            ).join('');

        materialSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            materialStateInput.value = selectedOption.dataset.state || '';
        });

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    closeNewMaterialModal: function() {
        const modal = document.getElementById('newMaterialModal');
        
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
            console.error('Error closing new material modal:', error);
            this.forceCloseModal('newMaterialModal');
        }
        
        // Reset form
        const form = document.getElementById('newMaterialForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de nuevo material cerrado');
    },
    
    closeAddStockModal: function() {
        const modal = document.getElementById('addStockModal');
        
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
            console.error('Error closing add stock modal:', error);
            this.forceCloseModal('addStockModal');
        }
        
        // Reset form
        const form = document.getElementById('addStockForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
        }
        
        console.log('Modal de agregar stock cerrado');
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

    createNewMaterial: function() {
        const form = document.getElementById('newMaterialForm');
        const formData = new FormData(form);
        const materialType = document.getElementById('materialTypeSelector').value;

        if (materialType === 'prefabricated') {
            const newMaterial = {
                id: Math.max(0, ...this.prefabricatedMaterials.map(m => m.id)) + 1,
                materialName: formData.get('prefabricated_materialName'),
                currentStock: parseFloat(formData.get('prefabricated_currentStock')),
                minStock: parseFloat(formData.get('prefabricated_minStock')),
                materialType: formData.get('prefabricated_materialType'),
                materialState: formData.get('prefabricated_materialState'),
                description: formData.get('prefabricated_description'),
                imagePath: formData.get('prefabricated_imagePath'),
                cost: parseFloat(formData.get('prefabricated_cost')),
                unit: formData.get('prefabricated_unit'),
                generalStock: parseFloat(formData.get('prefabricated_generalStock')),
                registrationDate: new Date().toISOString().split('T')[0],
                updateDate: new Date().toISOString().split('T')[0],
            };
            this.prefabricatedMaterials.push(newMaterial);
            window.MobiliAriState.updateState('prefabricatedMaterials', this.prefabricatedMaterials);
        } else if (materialType === 'custom') {
            const newMaterial = {
                id: Math.max(100, ...this.customMaterials.map(m => m.id)) + 1,
                materialName: formData.get('custom_materialName'),
                currentStock: parseFloat(formData.get('custom_currentStock')),
                minStock: parseFloat(formData.get('custom_minStock')),
                materialType: formData.get('custom_materialType'),
                materialState: formData.get('custom_materialState'),
                description: formData.get('custom_description'),
                imagePath: formData.get('custom_imagePath'),
                cost: parseFloat(formData.get('custom_cost')),
                unit: formData.get('custom_unit'),
                generalStock: parseFloat(formData.get('custom_generalStock')),
                registrationDate: new Date().toISOString().split('T')[0],
                updateDate: new Date().toISOString().split('T')[0],
            };
            this.customMaterials.push(newMaterial);
            window.MobiliAriState.updateState('customMaterials', this.customMaterials);
        } else if (materialType === 'base') {
            const newMaterial = {
                id: Math.max(200, ...this.baseMaterials.map(m => m.id)) + 1,
                materialName: formData.get('base_materialName'),
                currentStock: parseFloat(formData.get('base_currentStock')),
                minStock: parseFloat(formData.get('base_minStock')),
                materialType: formData.get('base_materialType'),
                materialState: formData.get('base_materialState'),
                description: formData.get('base_description'),
                imagePath: formData.get('base_imagePath'),
                cost: parseFloat(formData.get('base_cost')),
                unit: formData.get('base_unit'),
                generalStock: parseFloat(formData.get('base_generalStock')),
                registrationDate: new Date().toISOString().split('T')[0],
                updateDate: new Date().toISOString().split('T')[0],
            };
            this.baseMaterials.push(newMaterial);
            window.MobiliAriState.updateState('baseMaterials', this.baseMaterials);
        }

        this.applyFilters();
        this.updateStats();
        this.closeNewMaterialModal();
        this.showAlert('success', 'Material creado exitosamente');
    },

    addStock: function() {
        const form = document.getElementById('addStockForm');
        const formData = new FormData(form);

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const materialId = parseInt(formData.get('materialId'));
        const quantity = parseFloat(formData.get('quantity'));
        const pricePerUnit = parseFloat(formData.get('pricePerUnit'));
        const notes = formData.get('notes');

        const materialIndex = this.inventory.findIndex(m => m.id === materialId);
        if (materialIndex !== -1) {
            const material = this.inventory[materialIndex];
            
            // Update quantity
            material.currentQuantity += quantity;
            
            // Update price if provided
            if (pricePerUnit > 0) {
                material.pricePerUnit = pricePerUnit;
            }
            
            // Update status
            material.status = this.calculateStatus(material.currentQuantity, material.minThreshold);
            material.lastPurchase = new Date().toISOString().split('T')[0];

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Add to stock history
            this.addToStockHistory(materialId, 'Stock agregado', quantity, material.unit, notes);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStockModal'));
            modal.hide();

            this.showAlert('success', `Stock agregado exitosamente a ${material.material}`);
        }
    },

    quickAddStock: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        const quantity = prompt(`¿Cuánto stock desea agregar a ${material.material}?`, '10');
        if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
            const materialIndex = this.inventory.findIndex(m => m.id === materialId);
            this.inventory[materialIndex].currentQuantity += parseFloat(quantity);
            this.inventory[materialIndex].status = this.calculateStatus(
                this.inventory[materialIndex].currentQuantity, 
                this.inventory[materialIndex].minThreshold
            );
            this.inventory[materialIndex].lastPurchase = new Date().toISOString().split('T')[0];

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Add to stock history
            this.addToStockHistory(materialId, 'Stock agregado (rápido)', parseFloat(quantity), material.unit, 'Agregado desde tabla');

            this.showAlert('success', `${quantity} ${material.unit} agregados a ${material.material}`);
        }
    },

    saveMaterialChanges: function() {
        if (!this.currentEditingMaterial) return;

        const materialId = this.currentEditingMaterial.id;
        const materialIndex = this.inventory.findIndex(m => m.id === materialId);

        if (materialIndex !== -1) {
            // Get updated values
            this.inventory[materialIndex].material = document.getElementById('editMaterial').value;
            this.inventory[materialIndex].minThreshold = parseFloat(document.getElementById('editMinThreshold').value);
            this.inventory[materialIndex].pricePerUnit = parseFloat(document.getElementById('editPricePerUnit').value);
            this.inventory[materialIndex].supplier = document.getElementById('editSupplier').value;
            this.inventory[materialIndex].location = document.getElementById('editLocation').value;
            this.inventory[materialIndex].notes = document.getElementById('editNotes').value;

            // Recalculate status
            this.inventory[materialIndex].status = this.calculateStatus(
                this.inventory[materialIndex].currentQuantity,
                this.inventory[materialIndex].minThreshold
            );

            window.MobiliAriState.updateState('inventory', this.inventory);

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('materialModal'));
            modal.hide();

            this.showAlert('success', 'Material actualizado exitosamente');
        }
    },

    deleteMaterial: function(materialId) {
        const material = this.inventory.find(m => m.id === materialId);
        if (!material) return;

        if (confirm(`¿Está seguro de eliminar el material "${material.material}"?`)) {
            this.inventory = this.inventory.filter(m => m.id !== materialId);
            window.MobiliAriState.updateState('inventory', this.inventory);
            this.showAlert('success', `Material ${material.material} eliminado exitosamente`);
        }
    },

    addToStockHistory: function(materialId, action, quantity, unit, notes) {
        if (!this.stockHistory) {
            this.stockHistory = [];
        }

        this.stockHistory.push({
            id: Date.now(),
            materialId: materialId,
            action: action,
            quantity: quantity,
            unit: unit,
            date: new Date().toISOString().split('T')[0],
            notes: notes || ''
        });

        window.MobiliAriState.updateState('stockHistory', this.stockHistory);
    },

    loadSupplierOptions: function() {
        const supplierFilter = document.getElementById('supplierFilter');
        if (supplierFilter) {
            const uniqueSuppliers = [...new Set(this.inventory.map(item => item.supplier))];
            supplierFilter.innerHTML = '<option value="">Todos los proveedores</option>' +
                uniqueSuppliers.map(supplier => 
                    `<option value="${supplier}">${supplier}</option>`
                ).join('');
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
    calculateStatus: function(currentQuantity, minThreshold) {
        if (currentQuantity === 0) return 'Agotado';
        if (currentQuantity <= minThreshold) return 'Bajo inventario';
        return 'Disponible';
    },

    getStatusClass: function(status) {
        const statusMap = {
            'Disponible': 'disponible',
            'Bajo inventario': 'bajo',
            'Agotado': 'agotado'
        };
        return statusMap[status] || 'disponible';
    },

    getQuantityLevel: function(item) {
        const percentage = (item.currentQuantity / (item.minThreshold * 3)) * 100;
        if (percentage > 66) return 'high';
        if (percentage > 33) return 'medium';
        return 'low';
    },

    getQuantityPercentage: function(item) {
        const maxQuantity = Math.max(item.minThreshold * 3, item.currentQuantity);
        return Math.min((item.currentQuantity / maxQuantity) * 100, 100);
    },

    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    showDeleteConfirmation: function(type, id, materialName) {
        this.materialToDelete = { type, id };
        document.getElementById('materialToDeleteName').textContent = materialName;
        const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        modal.show();
    },

    confirmDeleteMaterial: function() {
        if (!this.materialToDelete) return;

        const { type, id } = this.materialToDelete;
        
        if (type === 'prefabricated') {
            this.prefabricatedMaterials = this.prefabricatedMaterials.filter(m => m.id !== id);
            window.MobiliAriState.updateState('prefabricatedMaterials', this.prefabricatedMaterials);
        } else if (type === 'custom') {
            this.customMaterials = this.customMaterials.filter(m => m.id !== id);
            window.MobiliAriState.updateState('customMaterials', this.customMaterials);
        }

        this.applyFilters();
        this.updateStats();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        
        this.showAlert('success', 'Material eliminado exitosamente');
        this.materialToDelete = null;
    },

    editMaterial: function(type, id) {
        let material;
        
        if (type === 'prefabricated') {
            material = this.prefabricatedMaterials.find(m => m.id === id);
        } else if (type === 'custom') {
            material = this.customMaterials.find(m => m.id === id);
        }
        
        if (!material) return;

        // Store current editing material
        this.currentEditingMaterial = { ...material, type };
        
        // Show new material modal in edit mode
        this.showEditMaterialModal(material, type);
    },

    showEditMaterialModal: function(material, type) {
        const modal = document.getElementById('newMaterialModal');
        const form = document.getElementById('newMaterialForm');
        const modalTitle = modal.querySelector('.modal-title');
        const createBtn = document.getElementById('createMaterialBtn');
        const typeSelector = document.getElementById('materialTypeSelector');
        
        // Change modal title and button text
        modalTitle.textContent = 'Editar Material';
        createBtn.textContent = 'Actualizar Material';
        createBtn.onclick = () => this.updateMaterial();
        
        // Set the type selector
        typeSelector.value = type;
        typeSelector.dispatchEvent(new Event('change'));
        
        // Fill form with material data
        const prefix = type;
        setTimeout(() => {
            form.querySelector(`[name="${prefix}_materialName"]`).value = material.materialName || '';
            form.querySelector(`[name="${prefix}_currentStock"]`).value = material.currentStock || '';
            form.querySelector(`[name="${prefix}_minStock"]`).value = material.minStock || '';
            form.querySelector(`[name="${prefix}_materialType"]`).value = material.materialType || '';
            form.querySelector(`[name="${prefix}_materialState"]`).value = material.materialState || '';
            form.querySelector(`[name="${prefix}_description"]`).value = material.description || '';
            form.querySelector(`[name="${prefix}_imagePath"]`).value = material.imagePath || '';
            form.querySelector(`[name="${prefix}_cost"]`).value = material.cost || '';
            form.querySelector(`[name="${prefix}_unit"]`).value = material.unit || '';
            form.querySelector(`[name="${prefix}_generalStock"]`).value = material.generalStock || '';
        }, 100);

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    updateMaterial: function() {
        if (!this.currentEditingMaterial) return;

        const form = document.getElementById('newMaterialForm');
        const formData = new FormData(form);
        const { type, id } = this.currentEditingMaterial;

        const updatedMaterial = {
            id: id,
            materialName: formData.get(`${type}_materialName`),
            currentStock: parseFloat(formData.get(`${type}_currentStock`)),
            minStock: parseFloat(formData.get(`${type}_minStock`)),
            materialType: formData.get(`${type}_materialType`),
            materialState: formData.get(`${type}_materialState`),
            description: formData.get(`${type}_description`),
            imagePath: formData.get(`${type}_imagePath`),
            cost: parseFloat(formData.get(`${type}_cost`)),
            unit: formData.get(`${type}_unit`),
            generalStock: parseFloat(formData.get(`${type}_generalStock`)),
            registrationDate: this.currentEditingMaterial.registrationDate,
            updateDate: new Date().toISOString().split('T')[0],
        };

        if (type === 'prefabricated') {
            const index = this.prefabricatedMaterials.findIndex(m => m.id === id);
            if (index !== -1) {
                this.prefabricatedMaterials[index] = updatedMaterial;
                window.MobiliAriState.updateState('prefabricatedMaterials', this.prefabricatedMaterials);
            }
        } else if (type === 'custom') {
            const index = this.customMaterials.findIndex(m => m.id === id);
            if (index !== -1) {
                this.customMaterials[index] = updatedMaterial;
                window.MobiliAriState.updateState('customMaterials', this.customMaterials);
            }
        }

        this.applyFilters();
        this.updateStats();
        this.closeNewMaterialModal();
        this.showAlert('success', 'Material actualizado exitosamente');
        
        // Reset modal to create mode
        this.resetModalToCreateMode();
        this.currentEditingMaterial = null;
    },

    resetModalToCreateMode: function() {
        const modal = document.getElementById('newMaterialModal');
        const modalTitle = modal.querySelector('.modal-title');
        const createBtn = document.getElementById('createMaterialBtn');
        
        modalTitle.textContent = 'Nuevo Material';
        createBtn.textContent = 'Crear Material';
        createBtn.onclick = () => this.createNewMaterial();
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
        window.inventoryModule.init();
    });
} else {
    window.inventoryModule.init();
}

// Global emergency function for inventory modals
window.emergencyCloseInventoryModals = function() {
    if (window.inventoryModule) {
        console.log('🚨 Cerrando modales de inventario de emergencia...');
        
        // Try to close using module functions
        try {
            window.inventoryModule.forceCloseModal('newMaterialModal');
            window.inventoryModule.forceCloseModal('addStockModal');
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
        
        console.log('✅ Modales de inventario cerrados');
    }
};
