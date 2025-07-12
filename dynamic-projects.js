// Dynamic Project Loading for Website1-Minimalist
// This script replaces hardcoded projects with dynamic content from project-config.js

// Custom encoding function that properly encodes parentheses
function encodeImagePath(path) {
    return encodeURIComponent(path).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

const projectManager = {
    // Initialize dynamic projects
    init() {
        // Wait for DOM and project config to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadProjects());
        } else {
            this.loadProjects();
        }
    },

    // Load projects from project-config.js
    loadProjects() {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) {
            console.error('Projects grid not found');
            return;
        }
        
        if (typeof projectConfig === 'undefined') {
            console.error('Project config not found, retrying in 500ms...');
            setTimeout(() => this.loadProjects(), 500);
            return;
        }

        // Clear existing hardcoded projects
        projectsGrid.innerHTML = '';

        // Get current language
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';

        console.log('Loading projects:', Object.keys(projectConfig).length);

        // Convert projectConfig to array and render
        Object.entries(projectConfig).forEach(([folderName, projectData]) => {
            const projectCard = this.createProjectCard(folderName, projectData, currentLang);
            projectsGrid.appendChild(projectCard);
        });

        // Re-initialize any project-related scripts
        this.initializeProjectScripts();
    },

    // Create a project card element
    createProjectCard(folderName, projectData, lang) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', projectData.category || 'residential');
        card.setAttribute('data-year', projectData.year || '2024');
        card.style.cursor = 'pointer';
        card.onclick = () => this.openProjectGallery(folderName, projectData.name[lang] || projectData.name.en);

        // Get translated category name
        const categoryKey = this.getCategoryTranslationKey(projectData.category);
        const categoryName = window.translations?.[lang]?.projects?.[categoryKey] || projectData.category;

        // Build the HTML with proper structure
        const projectName = projectData.name?.[lang] || projectData.name?.en || folderName;
        const projectDesc = projectData.description?.[lang] || projectData.description?.en || '';
        const coverImage = projectData.coverImage || (projectData.images && projectData.images[0]) || 'placeholder.jpg';
        
        card.innerHTML = `
            <div class="project-image">
                <img src="${encodeImagePath(folderName)}/${encodeImagePath(coverImage)}" 
                     alt="${projectName}"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23f8f8f8%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-family=%22Inter%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="project-overlay">
                    <h3>${window.translations?.[lang]?.projects?.viewProject || 'View Project'}</h3>
                </div>
            </div>
            <div class="project-info">
                <h3>${projectName}</h3>
                <p class="project-meta">
                    <span>${categoryName}</span> • ${projectData.year || '2024'} • ${projectData.area || ''}
                </p>
                <p class="project-desc">${projectDesc}</p>
            </div>
        `;

        return card;
    },

    // Get translation key for category
    getCategoryTranslationKey(category) {
        const categoryMap = {
            'residential': 'residential',
            'commercial': 'commercial',
            'office': 'office',
            'medical': 'medical',
            'hospitality': 'hospitality',
            'corporate': 'corporate'
        };
        return categoryMap[category] || category;
    },

    // Open project gallery
    openProjectGallery(projectFolder, projectName) {
        const currentPath = window.location.pathname;
        const fromPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        window.location.href = `../gallery-premium.html?project=${encodeURIComponent(projectFolder)}&name=${encodeURIComponent(projectName)}&from=${encodeURIComponent(fromPath)}`;
    },

    // Initialize project-related scripts
    initializeProjectScripts() {
        // Re-initialize filter functionality if it exists
        if (typeof initializeFilters === 'function') {
            initializeFilters();
        }

        // Update project count
        const projectCount = document.querySelectorAll('.project-card').length;
        console.log(`Loaded ${projectCount} projects dynamically`);
    },

    // Refresh projects (called when language changes)
    refreshProjects() {
        this.loadProjects();
    },

    // Check if admin is logged in and add edit capabilities
    checkAdminMode() {
        const adminToken = sessionStorage.getItem('adminToken');
        if (adminToken) {
            this.enableInlineEditing();
        }
    },

    // Enable inline editing for logged-in admins
    enableInlineEditing() {
        // Add edit buttons to project cards
        document.querySelectorAll('.project-card').forEach((card, index) => {
            const editBtn = document.createElement('button');
            editBtn.className = 'inline-edit-btn';
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Quick Edit';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = './admin/#edit-project-' + index;
            };
            card.appendChild(editBtn);
        });

        // Add admin toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'admin-toolbar';
        toolbar.innerHTML = `
            <div class="admin-toolbar-content">
                <span>Admin Mode</span>
                <a href="./admin/" class="admin-link">Go to Admin Panel</a>
            </div>
        `;
        document.body.appendChild(toolbar);
    }
};

// Initialize project manager
projectManager.init();

// Listen for language changes
document.addEventListener('languageChanged', () => {
    projectManager.refreshProjects();
});

// Check for admin mode
document.addEventListener('DOMContentLoaded', () => {
    projectManager.checkAdminMode();
});

// Add CSS for admin features
const adminStyles = `
<style>
.inline-edit-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 10;
}

.project-card:hover .inline-edit-btn {
    opacity: 1;
}

.inline-edit-btn:hover {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.admin-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #000;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 1000;
}

.admin-toolbar-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.admin-link {
    color: #d4af37;
    text-decoration: none;
    font-weight: 500;
}

.admin-link:hover {
    text-decoration: underline;
}
</style>
`;

// Inject admin styles
if (!document.getElementById('admin-inline-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'admin-inline-styles';
    styleEl.innerHTML = adminStyles;
    document.head.appendChild(styleEl);
}