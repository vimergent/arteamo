// Studio Arteamo Admin - Minimalist CMS
// Enhanced security and functionality
console.log('[admin.js] FILE LOADED - v2');

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

    // State
    state: {
        isAuthenticated: false,
        currentUser: null,
        currentProject: null,
        projects: [],
        hasUnsavedChanges: false,
    },

    // Initialize
    init() {
        // Set up Google OAuth auth change listener
        this.setupAuthListener();
        // Then check authentication
        this.checkAuth();
        this.setupEventListeners();
        this.loadProjects();
    },

    // Authentication - Google OAuth
    async checkAuth() {
        console.log('[AdminApp] checkAuth called');
        
        // Use AuthManager for Google OAuth
        if (window.AuthManager) {
            console.log('[AdminApp] AuthManager found, setting up callback');
            
            // Set up callback for auth state changes
            window.AuthManager.setOnAuthChange((authenticated, user) => {
                console.log('[AdminApp] Auth callback fired:', authenticated, user?.email);
                if (authenticated && user) {
                    this.state.isAuthenticated = true;
                    this.state.currentUser = user;
                    console.log('[AdminApp] Showing admin interface');
                    this.showAdminInterface();
                    this.showToast(`Welcome, ${user.name || user.email}`, 'success');
                } else {
                    this.state.isAuthenticated = false;
                    this.state.currentUser = null;
                    console.log('[AdminApp] Showing auth screen');
                    this.showAuthScreen();
                }
            });
            
            // Check if already authenticated (fallback)
            const user = window.AuthManager.getCurrentUser();
            console.log('[AdminApp] getCurrentUser:', user?.email || 'null');
            if (user) {
                this.state.isAuthenticated = true;
                this.state.currentUser = user;
                console.log('[AdminApp] Already authenticated, showing admin interface');
                this.showAdminInterface();
                this.showToast(`Welcome back, ${user.name || user.email}`, 'success');
            }
            return;
        }
        
        console.log('[AdminApp] AuthManager not ready, waiting...');
        // Fallback: Wait for AuthManager to initialize
        setTimeout(() => this.checkAuth(), 200);
    },

    showAuthScreen() {
        console.log('[AdminApp] showAuthScreen called');
        const authScreen = document.getElementById('authScreen');
        const adminInterface = document.getElementById('adminInterface');
        if (authScreen) authScreen.style.display = 'flex';
        if (adminInterface) adminInterface.style.display = 'none';
    },

    showAdminInterface() {
        console.log('[AdminApp] showAdminInterface called');
        const authScreen = document.getElementById('authScreen');
        const adminInterface = document.getElementById('adminInterface');
        if (authScreen) authScreen.style.display = 'none';
        if (adminInterface) {
            adminInterface.style.display = 'block';
            console.log('[AdminApp] Admin interface displayed');
        } else {
            console.error('[AdminApp] adminInterface element not found!');
        }
        this.renderProjects();
    },

    openLogin() {
        console.log('[Auth] openLogin called - initiating Google OAuth');
        
        // Use AuthManager for Google OAuth
        if (window.AuthManager) {
            window.AuthManager.login();
            return;
        }
        
        // Fallback: Direct redirect to OAuth function
        window.location.href = '/.netlify/functions/auth-login';
    },

    setupAuthListener() {
        // Set up AuthManager callback for auth state changes
        if (window.AuthManager) {
            console.log('[Auth] Setting up AuthManager listener');
            window.AuthManager.setOnAuthChange((authenticated, user) => {
                if (authenticated && user) {
                    this.state.isAuthenticated = true;
                    this.state.currentUser = user;
                    this.showAdminInterface();
                } else {
                    this.state.isAuthenticated = false;
                    this.state.currentUser = null;
                    this.showAuthScreen();
                }
            });
        } else {
            // Wait for AuthManager to load
            setTimeout(() => this.setupAuthListener(), 200);
        }
    },

    logout() {
        console.log('[Auth] Logging out via Google OAuth');
        
        // Use AuthManager for Google OAuth logout
        if (window.AuthManager) {
            window.AuthManager.logout();
            return;
        }
        
        // Fallback: Direct redirect to logout function
        window.location.href = '/.netlify/functions/auth-logout';
    },

    // Project Management
    loadProjects() {
        try {
            // FIXED: Always load from project-config.js first (source of truth from GitHub)
            // localStorage is only for tracking unsaved in-session changes
            if (typeof projectConfig !== 'undefined' && Object.keys(projectConfig).length > 0) {
                this.importFromProjectConfig();
                this.state.hasUnsavedChanges = false;
                this.updateSaveStatus('Loaded from server');
            } else {
                // Fallback to localStorage only if no project-config.js
                const savedProjects = localStorage.getItem('adminProjects');
                if (savedProjects) {
                    const parsed = JSON.parse(savedProjects);
                    if (parsed.projects && Array.isArray(parsed.projects)) {
                        this.state.projects = parsed.projects;
                    } else if (Array.isArray(parsed)) {
                        this.state.projects = parsed;
                    }
                    this.updateSaveStatus('Loaded from local storage (no server data)');
                }
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showToast('Error loading projects', 'error');
        }
    },

    // Refresh data from server (discards local changes)
    refreshFromServer() {
        if (this.state.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Refreshing will discard them. Continue?')) {
                return;
            }
        }

        // Clear localStorage and reload page to get fresh project-config.js
        localStorage.removeItem('adminProjects');
        localStorage.removeItem('adminProjectsRaw');
        window.location.reload();
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
            // FIXED: Include subtitle field
            subtitle: {
                en: this.security.sanitizeInput(formData.get('subtitle_en') || ''),
                bg: this.security.sanitizeInput(formData.get('subtitle_bg') || formData.get('subtitle_en') || ''),
                ru: this.security.sanitizeInput(formData.get('subtitle_ru') || formData.get('subtitle_en') || ''),
                es: this.security.sanitizeInput(formData.get('subtitle_es') || formData.get('subtitle_en') || ''),
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
            // Update existing - FIXED: Check index is valid
            const index = this.state.projects.findIndex(p => p.id === this.state.currentProject.id);
            if (index !== -1) {
                this.state.projects[index] = project;
            } else {
                // Project ID not found, add as new
                this.state.projects.push(project);
            }
        } else {
            // Add new
            this.state.projects.push(project);
        }

        this.saveProjects();
        this.closeModal();
        this.renderProjects();
        this.showToast('Project saved locally. Click "Export & Deploy" to publish.', 'success');
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
                src: `../${this.security.escapeHtml(project.folder)}/${this.security.escapeHtml(project.coverImage)}`,
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

        // Populate language fields - FIXED: Include subtitle
        ['en', 'bg', 'ru', 'es'].forEach(lang => {
            document.getElementById(`name_${lang}`).value = project.name?.[lang] || '';
            document.getElementById(`subtitle_${lang}`).value = project.subtitle?.[lang] || '';
            document.getElementById(`description_${lang}`).value = project.description?.[lang] || '';
        });

        // Display images
        this.displayProjectImages(project.images || []);
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

    // Export/Deploy - Commits changes to GitHub
    async exportData() {
        try {
            this.showToast('Deploying changes to GitHub...', 'info');
            this.updateSaveStatus('Deploying...');

            const projectConfigContent = this.generateProjectConfig();

            const response = await fetch('/.netlify/functions/commit-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // IMPORTANT: Include session cookie for auth
                body: JSON.stringify({
                    content: projectConfigContent,
                    message: `CMS: Update project configuration - ${new Date().toLocaleString()}`,
                    filePath: 'project-config.js'
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showToast('Changes deployed successfully! Site will rebuild automatically.', 'success');
                this.state.hasUnsavedChanges = false;
                this.updateSaveStatus('Deployed successfully');

                // Show commit info
                if (result.commit?.sha) {
                    console.log('Commit SHA:', result.commit.sha);
                    console.log('Commit URL:', result.commit.url);
                }
            } else {
                throw new Error(result.error || result.details || 'Deployment failed');
            }
        } catch (error) {
            console.error('Deploy error:', error);
            this.showToast(`Deployment failed: ${error.message}`, 'error');
            this.updateSaveStatus('Deploy failed');

            // Offer to download as fallback
            if (confirm('Deployment failed. Would you like to download the configuration file instead?')) {
                this.downloadConfigFile();
            }
        }
    },

    // Fallback: Download config file locally
    downloadConfigFile() {
        try {
            const projectConfigContent = this.generateProjectConfig();
            const blob = new Blob([projectConfigContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project-config.js';
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Configuration downloaded', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Error downloading configuration', 'error');
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

    // Event Listeners
    setupEventListeners() {
        try {
            // Login button
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
                    const sectionEl = document.getElementById(`${section}Section`);
                    if (sectionEl) sectionEl.classList.add('active');
                });
            });

            // Language tabs
            document.querySelectorAll('.lang-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const lang = e.target.dataset.lang;
                    const container = e.target.closest('.lang-tabs')?.parentElement;
                    if (!container) return;
                    
                    // Update tabs
                    container.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    // Update content
                    container.querySelectorAll('.lang-content').forEach(c => c.classList.remove('active'));
                    const contentEl = container.querySelector(`.lang-content[data-lang="${lang}"]`);
                    if (contentEl) contentEl.classList.add('active');
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
            
            if (uploadArea && imageInput) {
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
            }

            // Modal close on escape
            document.addEventListener('keydown', (e) => {
                const projectModal = document.getElementById('projectModal');
                if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
                    this.closeModal();
                }
            });

            // Click outside modal to close
            const projectModal = document.getElementById('projectModal');
            if (projectModal) {
                projectModal.addEventListener('click', (e) => {
                    if (e.target.id === 'projectModal') {
                        this.closeModal();
                    }
                });
            }
        } catch (error) {
            console.error('[Admin] Error setting up event listeners:', error);
        }
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
    // Content editor save (placeholder - not persisted to server)
    saveContent() {
        this.showToast('Content changes saved locally', 'success');
    }
};

// Initialize when DOM is ready
// Wait for both DOM and Identity widget to be available
function initializeAdmin() {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAdmin);
        return;
    }
    
    // Wait for AuthManager to be available (Google OAuth)
    if (typeof window.AuthManager === 'undefined') {
        setTimeout(initializeAdmin, 100);
        return;
    }
    
    console.log('[AdminApp] Starting initialization...');
    
    // Initialize admin app
    if (typeof adminApp !== 'undefined') {
        adminApp.init();
    } else {
        console.error('[AdminApp] adminApp not defined');
    }
}

// Start initialization
initializeAdmin();