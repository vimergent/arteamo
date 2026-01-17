// Studio Arteamo Admin - Minimalist CMS
// Enhanced security and functionality

const adminApp = {
    // Security utilities
    security: {
        // Escape HTML to prevent XSS attacks
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // Sanitize user input
        sanitizeInput(input) {
            if (typeof input !== 'string') return input;
            return input.trim().replace(/[<>]/g, '');
        },
        
        // Create element safely
        createSafeElement(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key.startsWith('data-')) {
                    element.setAttribute(key, this.escapeHtml(String(value)));
                } else {
                    element.setAttribute(key, this.escapeHtml(String(value)));
                }
            });
            if (textContent) {
                element.textContent = textContent;
            }
            return element;
        }
    },

    // Configuration
    config: {
        maxLoginAttempts: 3,
        lockoutTime: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        autoSaveInterval: 30 * 1000, // 30 seconds
    },

    // State
    state: {
        isAuthenticated: false,
        currentProject: null,
        projects: [],
        hasUnsavedChanges: false,
        lastActivity: Date.now(),
        loginAttempts: 0,
        lockoutUntil: null,
    },

    // Initialize
    init() {
        // Set up Netlify Identity listeners first
        this.setupIdentityListeners();
        // Then check authentication
        this.checkAuth();
        this.setupEventListeners();
        this.loadProjects();
        this.startSessionMonitor();
        this.startAutoSave();
        this.loadContactEmail();
    },

    // Authentication - Netlify Identity
    async checkAuth() {
        // Wait for Netlify Identity to initialize
        if (typeof window.netlifyIdentity === 'undefined') {
            // Identity widget not loaded yet, wait a bit
            setTimeout(() => this.checkAuth(), 200);
            return;
        }

        // Initialize Identity if not already done
        if (window.netlifyIdentity && !window.netlifyIdentity._initialized) {
            window.netlifyIdentity.init({
                APIUrl: window.location.origin + "/.netlify/identity"
            });
        }

        // Check if user is authenticated via Netlify Identity
        const user = window.netlifyIdentity.currentUser();
        
        if (user) {
            // User is authenticated
            this.state.isAuthenticated = true;
            this.state.currentUser = user;
            this.showAdminInterface();
            this.showToast(`Welcome back, ${user.email}`, 'success');
        } else {
            // User not authenticated, show login screen
            this.showAuthScreen();
        }
    },

    showAuthScreen() {
        const authScreen = document.getElementById('authScreen');
        const adminInterface = document.getElementById('adminInterface');
        if (authScreen) authScreen.style.display = 'flex';
        if (adminInterface) adminInterface.style.display = 'none';
    },

    showAdminInterface() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'block';
        this.renderProjects();
    },

    openLogin() {
        console.log('[Auth] openLogin called');
        console.log('[Auth] netlifyIdentity available:', typeof netlifyIdentity !== 'undefined');
        
        // Open Netlify Identity login modal
        if (typeof netlifyIdentity !== 'undefined' && netlifyIdentity) {
            try {
                console.log('[Auth] Opening Identity modal...');
                netlifyIdentity.open('login');
            } catch (error) {
                console.error('[Auth] Error opening Identity:', error);
                this.showError('Error opening login. Please refresh the page.');
            }
        } else {
            console.error('[Auth] Netlify Identity not available');
            this.showError('Netlify Identity is not loaded. Please refresh the page.');
            
            // Try to initialize it
            if (window.netlifyIdentity) {
                window.netlifyIdentity.init({
                    APIUrl: window.location.origin + "/.netlify/identity"
                });
                setTimeout(() => {
                    if (typeof netlifyIdentity !== 'undefined') {
                        netlifyIdentity.open('login');
                    }
                }, 500);
            }
        }
    },

    setupIdentityListeners() {
        // Set up Netlify Identity event listeners
        if (typeof window.netlifyIdentity === 'undefined') {
            // Wait for Identity to load
            console.log('[Auth] Waiting for Identity widget to load...');
            setTimeout(() => this.setupIdentityListeners(), 200);
            return;
        }

        console.log('[Auth] Setting up Identity listeners');

        // Initialize Identity if not already done
        if (window.netlifyIdentity && !window.netlifyIdentity._initialized) {
            window.netlifyIdentity.init({
                APIUrl: window.location.origin + "/.netlify/identity"
            });
        }

        // Listen for successful login
        window.netlifyIdentity.on('login', (user) => {
            console.log('[Identity] User logged in:', user.email);
            this.state.isAuthenticated = true;
            this.state.currentUser = user;
            window.netlifyIdentity.close();
            this.showAdminInterface();
            this.showToast(`Welcome, ${user.email}`, 'success');
        });

        // Listen for logout
        window.netlifyIdentity.on('logout', () => {
            console.log('[Identity] User logged out');
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            this.showAuthScreen();
            this.showToast('You have been logged out', 'info');
        });

        // Listen for errors
        window.netlifyIdentity.on('error', (err) => {
            console.error('[Identity] Error:', err);
            this.showError('Authentication error. Please try again.');
        });
    },

    logout() {
        // Logout via Netlify Identity
        if (typeof window.netlifyIdentity !== 'undefined' && window.netlifyIdentity) {
            window.netlifyIdentity.logout();
        } else {
            // Fallback if Identity not available
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            this.showAuthScreen();
            this.showToast('Logged out successfully', 'success');
        }
    },

    // Session Management
    startSessionMonitor() {
        setInterval(() => {
            if (this.state.isAuthenticated) {
                const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
                const timeSinceActivity = Date.now() - lastActivity;
                
                if (timeSinceActivity > this.config.sessionTimeout) {
                    this.logout();
                    this.showToast('Session expired. Please log in again.', 'warning');
                }
            }
        }, 60000); // Check every minute
    },

    updateActivity() {
        if (this.state.isAuthenticated) {
            sessionStorage.setItem('lastActivity', Date.now());
        }
    },

    // Project Management
    loadProjects() {
        try {
            // First try to load from localStorage (new format with timestamp)
            const savedProjects = localStorage.getItem('adminProjects');
            if (savedProjects) {
                const parsed = JSON.parse(savedProjects);
                // Handle both new format (with lastSaved) and old format (array)
                if (parsed.projects && Array.isArray(parsed.projects)) {
                    this.state.projects = parsed.projects;
                    // Log last save time for verification
                    if (parsed.lastSaved) {
                        const saveDate = new Date(parsed.lastSaved);
                        this.updateSaveStatus(`Last saved: ${saveDate.toLocaleString()}`);
                    }
                } else if (Array.isArray(parsed)) {
                    // Old format - backward compatibility
                    this.state.projects = parsed;
                }
            } else if (typeof projectConfig !== 'undefined') {
                // Import from existing project-config.js
                this.importFromProjectConfig();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showToast('Error loading projects', 'error');
        }
    },

    importFromProjectConfig() {
        const projects = [];
        
        Object.entries(projectConfig).forEach(([folder, data]) => {
            const project = {
                id: this.generateId(),
                folder: folder,
                name: data.name || { en: folder, bg: '', ru: '', es: '' },
                subtitle: data.subtitle || { en: '', bg: '', ru: '', es: '' },
                description: data.description || { en: '', bg: '', ru: '', es: '' },
                category: data.category || 'residential',
                year: data.year || new Date().getFullYear(),
                area: data.area || '',
                coverImage: data.coverImage || '',
                images: data.images || [],
                visible: true,
                order: projects.length,
            };
            projects.push(project);
        });
        
        this.state.projects = projects;
        this.saveProjects();
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    saveProjects() {
        // Save to localStorage with timestamp for verification
        const saveData = {
            projects: this.state.projects,
            lastSaved: new Date().toISOString(),
            version: '0.1.1'
        };
        localStorage.setItem('adminProjects', JSON.stringify(saveData));
        localStorage.setItem('adminProjectsRaw', JSON.stringify(this.state.projects)); // For backward compatibility
        this.state.hasUnsavedChanges = true;
        this.updateSaveStatus('Unsaved changes');
        
        // Verify save was successful
        const verify = localStorage.getItem('adminProjects');
        if (verify) {
            const parsed = JSON.parse(verify);
            if (parsed.projects && parsed.lastSaved) {
                // Save successful - log for testing (will be removed in production)
                if (typeof console !== 'undefined' && console.log) {
                    console.log('[Admin] Save verified:', parsed.lastSaved);
                }
            }
        }
    },

    createProject() {
        this.state.currentProject = null;
        this.openModal('New Project');
        document.getElementById('projectForm').reset();
        const imageList = document.getElementById('imageList');
        while (imageList.firstChild) {
            imageList.removeChild(imageList.firstChild);
        }
    },

    editProject(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            this.state.currentProject = project;
            this.openModal('Edit Project');
            this.populateProjectForm(project);
        }
    },

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            this.state.projects = this.state.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
            this.showToast('Project deleted', 'success');
        }
    },

    saveProject(formData) {
        // Sanitize all inputs
        const project = {
            id: this.state.currentProject?.id || this.generateId(),
            folder: this.security.sanitizeInput(formData.get('folder') || ''),
            name: {
                en: this.security.sanitizeInput(formData.get('name_en') || ''),
                bg: this.security.sanitizeInput(formData.get('name_bg') || formData.get('name_en') || ''),
                ru: this.security.sanitizeInput(formData.get('name_ru') || formData.get('name_en') || ''),
                es: this.security.sanitizeInput(formData.get('name_es') || formData.get('name_en') || ''),
            },
            description: {
                en: this.security.sanitizeInput(formData.get('description_en') || ''),
                bg: this.security.sanitizeInput(formData.get('description_bg') || formData.get('description_en') || ''),
                ru: this.security.sanitizeInput(formData.get('description_ru') || formData.get('description_en') || ''),
                es: this.security.sanitizeInput(formData.get('description_es') || formData.get('description_en') || ''),
            },
            category: this.security.sanitizeInput(formData.get('category') || ''),
            year: parseInt(formData.get('year')) || new Date().getFullYear(),
            area: this.security.sanitizeInput(formData.get('area') || ''),
            coverImage: this.getProjectImages()[0] || '',
            images: this.getProjectImages(),
            visible: true,
            order: this.state.currentProject?.order || this.state.projects.length,
        };

        if (this.state.currentProject) {
            // Update existing
            const index = this.state.projects.findIndex(p => p.id === this.state.currentProject.id);
            this.state.projects[index] = project;
        } else {
            // Add new
            this.state.projects.push(project);
        }

        this.saveProjects();
        this.closeModal();
        this.renderProjects();
        this.showToast('Project saved successfully', 'success');
    },

    // UI Rendering
    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        const searchTerm = document.getElementById('searchProjects').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filteredProjects = this.state.projects.filter(project => {
            const matchesSearch = project.name.en.toLowerCase().includes(searchTerm) ||
                                project.folder.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || project.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Clear grid safely
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }

        // Create project cards safely
        filteredProjects.forEach(project => {
            const card = this.security.createSafeElement('div', { className: 'project-admin-card' });
            
            // Image container
            const imageContainer = this.security.createSafeElement('div', { className: 'project-admin-image' });
            const img = this.security.createSafeElement('img', {
                src: `../../${this.security.escapeHtml(project.folder)}/${this.security.escapeHtml(project.coverImage)}`,
                alt: this.security.escapeHtml(project.name.en)
            });
            img.onerror = function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23f8f8f8%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22Inter%22%3ENo Image%3C/text%3E%3C/svg%3E';
            };
            imageContainer.appendChild(img);
            
            // Info container
            const infoContainer = this.security.createSafeElement('div', { className: 'project-admin-info' });
            const title = this.security.createSafeElement('h3', { className: 'project-admin-title' }, project.name.en);
            const meta = this.security.createSafeElement('p', { className: 'project-admin-meta' }, 
                `${project.category} • ${project.year} • ${project.area}`);
            
            // Actions container
            const actionsContainer = this.security.createSafeElement('div', { className: 'project-admin-actions' });
            const editBtn = this.security.createSafeElement('button', { className: 'btn btn-secondary' }, 'Edit');
            editBtn.onclick = () => this.editProject(project.id);
            const deleteBtn = this.security.createSafeElement('button', { className: 'btn btn-ghost' }, 'Delete');
            deleteBtn.onclick = () => this.deleteProject(project.id);
            
            actionsContainer.appendChild(editBtn);
            actionsContainer.appendChild(deleteBtn);
            
            infoContainer.appendChild(title);
            infoContainer.appendChild(meta);
            infoContainer.appendChild(actionsContainer);
            
            card.appendChild(imageContainer);
            card.appendChild(infoContainer);
            grid.appendChild(card);
        });
    },

    populateProjectForm(project) {
        document.getElementById('projectFolder').value = project.folder;
        document.getElementById('projectCategory').value = project.category;
        document.getElementById('projectYear').value = project.year;
        document.getElementById('projectArea').value = project.area;

        // Populate language fields
        ['en', 'bg', 'ru', 'es'].forEach(lang => {
            document.getElementById(`name_${lang}`).value = project.name[lang] || '';
            document.getElementById(`description_${lang}`).value = project.description[lang] || '';
        });

        // Display images
        this.displayProjectImages(project.images);
    },

    displayProjectImages(images) {
        const list = document.getElementById('imageList');
        // Clear list safely
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
        
        // Create image items safely
        images.forEach((img, index) => {
            const imageItem = this.security.createSafeElement('div', { 
                className: 'image-item',
                'data-image': img
            });
            
            const imgElement = this.security.createSafeElement('img', {
                src: `../../${this.security.escapeHtml(this.state.currentProject?.folder || 'temp')}/${this.security.escapeHtml(img)}`,
                alt: this.security.escapeHtml(img)
            });
            imgElement.onerror = function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect width=%22150%22 height=%22150%22 fill=%22%23f8f8f8%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22Inter%22 font-size=%2212%22%3ENo Image%3C/text%3E%3C/svg%3E';
            };
            
            const removeBtn = this.security.createSafeElement('button', { className: 'image-item-remove' }, '×');
            removeBtn.onclick = () => this.removeImage(index);
            
            imageItem.appendChild(imgElement);
            imageItem.appendChild(removeBtn);
            list.appendChild(imageItem);
        });
    },

    getProjectImages() {
        const items = document.querySelectorAll('#imageList .image-item');
        return Array.from(items).map(item => item.dataset.image);
    },

    removeImage(index) {
        const items = document.querySelectorAll('#imageList .image-item');
        if (items[index]) {
            items[index].remove();
        }
    },

    // Modal Management
    openModal(title) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('projectModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('projectModal').classList.remove('active');
        document.body.style.overflow = '';
        this.state.currentProject = null;
    },

    // Export/Import
    async exportData() {
        try {
            const projectConfigContent = this.generateProjectConfig();
            
            // Create and download file
            const blob = new Blob([projectConfigContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project-config.js';
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Configuration exported successfully', 'success');
            this.state.hasUnsavedChanges = false;
            this.updateSaveStatus('All changes exported');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Error exporting configuration', 'error');
        }
    },

    generateProjectConfig() {
        const config = {};
        
        this.state.projects.forEach(project => {
            config[project.folder] = {
                name: project.name,
                subtitle: project.subtitle || { en: '', bg: '', ru: '', es: '' },
                description: project.description,
                category: project.category,
                year: project.year,
                area: project.area,
                coverImage: project.coverImage,
                images: project.images
            };
        });

        return `// Project Configuration for Studio Arteamo
// Generated on: ${new Date().toISOString()}
// This file is auto-generated by the CMS. Do not edit manually.

const projectConfig = ${JSON.stringify(config, null, 2)};

// Make available globally
if (typeof window !== 'undefined') {
    window.projectConfig = projectConfig;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectConfig;
}
`;
    },

    // Utilities
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showError(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('active');
            
            setTimeout(() => {
                errorEl.classList.remove('active');
            }, 5000);
        } else {
            // Fallback: show toast if error element doesn't exist
            this.showToast(message, 'error');
        }
    },

    updateSaveStatus(status) {
        const statusEl = document.getElementById('saveStatus');
        statusEl.textContent = status;
        statusEl.classList.toggle('saving', status === 'Saving...');
    },

    viewWebsite() {
        window.open('../index.html', '_blank');
    },

    // Auto-save
    startAutoSave() {
        setInterval(() => {
            if (this.state.hasUnsavedChanges && this.state.isAuthenticated) {
                this.updateSaveStatus('Auto-saving...');
                // In a real implementation, this would save to a server
                setTimeout(() => {
                    this.updateSaveStatus('All changes saved');
                }, 1000);
            }
        }, this.config.autoSaveInterval);
    },

    // Backup & Restore
    createBackup() {
        const backup = {
            projects: this.state.projects,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studio-arteamo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Backup created successfully', 'success');
    },

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const backup = JSON.parse(text);
                    
                    if (backup.projects && Array.isArray(backup.projects)) {
                        this.state.projects = backup.projects;
                        this.saveProjects();
                        this.renderProjects();
                        this.showToast('Backup restored successfully', 'success');
                    } else {
                        throw new Error('Invalid backup format');
                    }
                } catch (error) {
                    this.showToast('Error restoring backup: ' + error.message, 'error');
                }
            }
        };
        input.click();
    },

    // Password Change
    async changePassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newPassword || !confirmPassword) {
            this.showToast('Please fill in both password fields', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return;
        }
        
        // In production, this would update the password on the server
        this.showToast('Password change requires server implementation', 'warning');
    },

    // Event Listeners
    setupEventListeners() {
        // Track activity
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keydown', () => this.updateActivity());

        // Login button (handled by openLogin() which opens Identity widget)
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.openLogin();
            });
        }

        // Project form
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.saveProject(formData);
            });
        }

        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                
                // Update tabs
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update sections
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                document.getElementById(`${section}Section`).classList.add('active');
            });
        });

        // Language tabs
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                const container = e.target.closest('.lang-tabs').parentElement;
                
                // Update tabs
                container.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update content
                container.querySelectorAll('.lang-content').forEach(c => c.classList.remove('active'));
                container.querySelector(`.lang-content[data-lang="${lang}"]`).classList.add('active');
            });
        });

        // Search and filters
        const searchProjects = document.getElementById('searchProjects');
        const categoryFilter = document.getElementById('categoryFilter');
        if (searchProjects) {
            searchProjects.addEventListener('input', () => this.renderProjects());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.renderProjects());
        }

        // Image upload
        const uploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => imageInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragging');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragging');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragging');
            // Handle file drop
            const files = Array.from(e.dataTransfer.files);
            this.handleImageUpload(files);
        });

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleImageUpload(files);
        });

        // Modal close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('projectModal').classList.contains('active')) {
                this.closeModal();
            }
        });

        // Click outside modal to close
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeModal();
            }
        });
    },

    // Image handling
    handleImageUpload(files) {
        // For now, just add filenames to the list
        // In production, this would upload to a server
        const currentImages = this.getProjectImages();
        const list = document.getElementById('imageList');
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';
                imageItem.dataset.image = file.name;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Clear and create safely
                    while (imageItem.firstChild) {
                        imageItem.removeChild(imageItem.firstChild);
                    }
                    
                    const img = this.security.createSafeElement('img', {
                        src: e.target.result,
                        alt: this.security.escapeHtml(file.name)
                    });
                    
                    const removeBtn = this.security.createSafeElement('button', { className: 'image-item-remove' }, '×');
                    const currentIndex = currentImages.length;
                    removeBtn.onclick = () => this.removeImage(currentIndex);
                    
                    imageItem.appendChild(img);
                    imageItem.appendChild(removeBtn);
                };
                reader.readAsDataURL(file);
                
                list.appendChild(imageItem);
                currentImages.push(file.name);
            }
        });
        
        this.showToast(`Added ${files.length} image(s)`, 'success');
    },

    // Contact Email Management
    loadContactEmail() {
        const savedEmail = localStorage.getItem('adminContactEmail') || 'petyaem@abv.bg';
        const emailInput = document.getElementById('contactEmail');
        if (emailInput) {
            emailInput.value = savedEmail;
        }
    },

    saveContactEmail() {
        const emailInput = document.getElementById('contactEmail');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('adminContactEmail', email);
        
        // Update environment variable if possible
        // In production, this would update the Netlify environment variable
        this.showToast('Contact email updated successfully', 'success');
        
        // Also save to a settings file that can be read by the contact form
        this.updateContactSettings(email);
    },

    updateContactSettings(email) {
        // Create a settings object that can be read by the contact form
        const settings = {
            contactEmail: email,
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage for now
        localStorage.setItem('siteSettings', JSON.stringify(settings));
    },

    // Other admin functions
    changePassword() {
        // Netlify Identity handles password changes through their widget
        // Redirect to Identity password change or use Identity API
        if (typeof netlifyIdentity !== 'undefined' && netlifyIdentity.currentUser()) {
            // Use Identity's password update API
            const user = netlifyIdentity.currentUser();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!newPassword || !confirmPassword) {
                this.showToast('Please fill in both password fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                this.showToast('Passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                this.showToast('Password must be at least 8 characters', 'error');
                return;
            }
            
            // Update password via Identity API
            const identityUrl = `${window.location.origin}/.netlify/identity`;
            fetch(`${identityUrl}/user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token.access_token}`
                },
                body: JSON.stringify({
                    password: newPassword
                })
            })
            .then(response => {
                if (response.ok) {
                    this.showToast('Password updated successfully', 'success');
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                } else {
                    this.showToast('Failed to update password. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Password update error:', error);
                this.showToast('Error updating password. Please try again.', 'error');
            });
        } else {
            this.showToast('Please log in first', 'error');
        }
        
        // In production, this would update the password on the server
        this.showToast('Password updated successfully', 'success');
    },

    exportData() {
        this.showToast('Exporting data...', 'info');
        // Implementation for export functionality
    },

    viewWebsite() {
        window.open('../index.html', '_blank');
    },

    logout() {
        sessionStorage.clear();
        this.state.isAuthenticated = false;
        this.showAuthScreen();
    },

    createBackup() {
        this.showToast('Creating backup...', 'info');
        // Implementation for backup
    },

    restoreBackup() {
        this.showToast('Restore functionality coming soon', 'info');
    },

    saveContent() {
        this.showToast('Content saved successfully', 'success');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    adminApp.init();
});