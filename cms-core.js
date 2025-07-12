// Studio Arteamo CMS Core Functionality
// This file contains the advanced features for the CMS

// Image compression and optimization
class ImageProcessor {
    static async compressImage(file, maxWidth = 1920, quality = 0.85) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve({
                            blob,
                            dataUrl: canvas.toDataURL('image/jpeg', quality),
                            width,
                            height,
                            originalName: file.name,
                            size: blob.size
                        });
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    static generateThumbnail(dataUrl, size = 300) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                
                const ctx = canvas.getContext('2d');
                
                // Calculate crop dimensions
                const sourceSize = Math.min(img.width, img.height);
                const sourceX = (img.width - sourceSize) / 2;
                const sourceY = (img.height - sourceSize) / 2;
                
                ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
                
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = dataUrl;
        });
    }
}

// Enhanced CMS functionality
const cmsEnhanced = {
    // Import existing projects from project-config.js
    async importFromProjectConfig() {
        try {
            // Check if projectConfig exists (from the loaded project-config.js)
            if (typeof projectConfig !== 'undefined') {
                const importedProjects = [];
                
                Object.entries(projectConfig).forEach(([folder, data]) => {
                    const project = {
                        id: this.generateId(),
                        folder: folder,
                        name: data.name || { en: folder, bg: folder, ru: folder, es: folder },
                        subtitle: data.subtitle || { en: '', bg: '', ru: '', es: '' },
                        description: data.description || { en: '', bg: '', ru: '', es: '' },
                        category: data.category || 'residential',
                        year: data.year || new Date().getFullYear(),
                        area: data.area || '',
                        coverImage: data.coverImage || (data.images && data.images[0]) || '',
                        images: data.images || [],
                        visible: true,
                        featured: false,
                        order: importedProjects.length,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    importedProjects.push(project);
                });
                
                return importedProjects;
            }
            return [];
        } catch (error) {
            console.error('Error importing from project-config.js:', error);
            return [];
        }
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Handle image uploads with optimization
    async handleImageUpload(files, projectFolder) {
        const processedImages = [];
        
        for (const file of files) {
            try {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image file`);
                }
                
                // Compress image
                const compressed = await ImageProcessor.compressImage(file);
                
                // Generate thumbnail
                const thumbnail = await ImageProcessor.generateThumbnail(compressed.dataUrl);
                
                // Store image data
                const imageData = {
                    id: this.generateId(),
                    name: file.name,
                    originalName: file.name,
                    size: compressed.size,
                    width: compressed.width,
                    height: compressed.height,
                    dataUrl: compressed.dataUrl,
                    thumbnail: thumbnail,
                    projectFolder: projectFolder,
                    uploadedAt: new Date().toISOString()
                };
                
                processedImages.push(imageData);
                
                // Store in localStorage (temporary storage)
                this.storeImageData(imageData);
                
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                cmsApp.showToast(`Failed to process ${file.name}`, 'error');
            }
        }
        
        return processedImages;
    },

    // Store image data in localStorage
    storeImageData(imageData) {
        const storedImages = JSON.parse(localStorage.getItem('cmsImages') || '[]');
        storedImages.push(imageData);
        localStorage.setItem('cmsImages', JSON.stringify(storedImages));
    },

    // Get stored images for a project
    getProjectImages(projectFolder) {
        const allImages = JSON.parse(localStorage.getItem('cmsImages') || '[]');
        return allImages.filter(img => img.projectFolder === projectFolder);
    },

    // Export complete data package
    exportDataPackage() {
        const exportData = {
            projects: cmsApp.projects,
            images: JSON.parse(localStorage.getItem('cmsImages') || '[]'),
            translations: this.getTranslations(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        // Create a zip-like structure (in practice, you'd use a library like JSZip)
        const files = {
            'project-config.js': this.generateProjectConfigFile(),
            'translations.js': this.generateTranslationsFile(),
            'cms-backup.json': JSON.stringify(exportData, null, 2)
        };

        return files;
    },

    // Generate project-config.js file content
    generateProjectConfigFile() {
        const config = {};
        
        cmsApp.projects.forEach(project => {
            config[project.folder] = {
                name: project.name,
                subtitle: project.subtitle,
                description: project.description,
                category: project.category,
                year: project.year,
                area: project.area,
                coverImage: project.coverImage,
                images: project.images
            };
        });

        return `// Project Configuration for Studio Arteamo
// Generated by CMS on ${new Date().toISOString()}
// This file is auto-generated. Do not edit manually.

const projectConfig = ${JSON.stringify(config, null, 2)};

// Make available globally
if (typeof window !== 'undefined') {
    window.projectConfig = projectConfig;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectConfig;
}
`;
    },

    // Generate translations.js file content
    generateTranslationsFile() {
        const translations = this.getTranslations();
        
        return `// Translations for Studio Arteamo
// Generated by CMS on ${new Date().toISOString()}
// This file is auto-generated. Do not edit manually.

const translations = ${JSON.stringify(translations, null, 2)};

// Make available globally
if (typeof window !== 'undefined') {
    window.translations = translations;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
}
`;
    },

    // Get current translations (would be loaded from existing translations.js)
    getTranslations() {
        // This would load from the current translations.js file
        // For now, return a basic structure
        return {
            en: {
                nav: {
                    home: "Home",
                    projects: "Projects",
                    about: "About",
                    services: "Services",
                    contact: "Contact"
                },
                company: {
                    name: "Studio Arteamo",
                    tagline: "Transforming Spaces Since 2008"
                }
                // ... more translations
            },
            bg: {
                // Bulgarian translations
            },
            ru: {
                // Russian translations
            },
            es: {
                // Spanish translations
            }
        };
    },

    // Backup and restore functionality
    createBackup() {
        const backup = {
            projects: cmsApp.projects,
            images: JSON.parse(localStorage.getItem('cmsImages') || '[]'),
            settings: JSON.parse(localStorage.getItem('cmsSettings') || '{}'),
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
    },

    async restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Validate backup structure
                    if (!backup.projects || !backup.timestamp || !backup.version) {
                        throw new Error('Invalid backup file format');
                    }

                    // Restore data
                    cmsApp.projects = backup.projects;
                    localStorage.setItem('cmsProjects', JSON.stringify(backup.projects));
                    
                    if (backup.images) {
                        localStorage.setItem('cmsImages', JSON.stringify(backup.images));
                    }
                    
                    if (backup.settings) {
                        localStorage.setItem('cmsSettings', JSON.stringify(backup.settings));
                    }

                    resolve(backup);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    },

    // Validation functions
    validateProject(project) {
        const errors = [];

        if (!project.folder || project.folder.trim() === '') {
            errors.push('Project folder name is required');
        }

        if (!project.name.en || project.name.en.trim() === '') {
            errors.push('English project name is required');
        }

        if (!project.category) {
            errors.push('Category is required');
        }

        if (!project.year || project.year < 2000 || project.year > new Date().getFullYear() + 1) {
            errors.push('Valid year is required');
        }

        if (project.images.length === 0) {
            errors.push('At least one image is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Search functionality
    searchProjects(query, projects) {
        const searchTerm = query.toLowerCase();
        
        return projects.filter(project => {
            // Search in all language versions
            const searchableText = [
                project.folder,
                project.name.en,
                project.name.bg,
                project.name.ru,
                project.name.es,
                project.description.en,
                project.description.bg,
                project.description.ru,
                project.description.es,
                project.category,
                project.year.toString(),
                project.area
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    },

    // Sorting functionality
    sortProjects(projects, sortBy = 'date', order = 'desc') {
        const sorted = [...projects];
        
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.en.localeCompare(b.name.en));
                break;
            case 'year':
                sorted.sort((a, b) => a.year - b.year);
                break;
            case 'category':
                sorted.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case 'date':
            default:
                sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        }
        
        if (order === 'desc') {
            sorted.reverse();
        }
        
        return sorted;
    },

    // Duplicate project
    duplicateProject(project) {
        const duplicate = JSON.parse(JSON.stringify(project));
        duplicate.id = this.generateId();
        duplicate.folder = `${project.folder} - Copy`;
        duplicate.name.en = `${project.name.en} - Copy`;
        duplicate.createdAt = new Date().toISOString();
        duplicate.updatedAt = new Date().toISOString();
        
        return duplicate;
    },

    // Batch operations
    batchUpdateProjects(projectIds, updates) {
        const updatedProjects = cmsApp.projects.map(project => {
            if (projectIds.includes(project.id)) {
                return {
                    ...project,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
            }
            return project;
        });
        
        cmsApp.projects = updatedProjects;
        cmsApp.saveProjects();
    },

    // Auto-save functionality
    enableAutoSave() {
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                cmsApp.saveProjects();
                cmsApp.showToast('Auto-saved', 'success');
            }
        }, 30000); // Auto-save every 30 seconds
    },

    hasUnsavedChanges() {
        const saved = localStorage.getItem('cmsProjects');
        const current = JSON.stringify(cmsApp.projects);
        return saved !== current;
    }
};

// Make enhanced functionality available globally
window.cmsEnhanced = cmsEnhanced;

// Initialize enhanced features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load project-config.js if it exists
    const script = document.createElement('script');
    script.src = 'project-config.js';
    script.onload = async () => {
        const imported = await cmsEnhanced.importFromProjectConfig();
        if (imported.length > 0 && cmsApp.projects.length === 0) {
            cmsApp.projects = imported;
            cmsApp.saveProjects();
            cmsApp.renderProjects();
            cmsApp.showToast(`Imported ${imported.length} projects`, 'success');
        }
    };
    script.onerror = () => {
        console.log('No existing project-config.js found');
    };
    document.head.appendChild(script);

    // Enable auto-save
    cmsEnhanced.enableAutoSave();
});