// Improved Language Switcher Component
class LanguageSwitcher {
    constructor() {
        this.currentLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('language') || 'bg';
        // Wait for DOM and translations to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Detect current website style
        const currentPath = window.location.pathname;
        let style = 'default';
        
        if (currentPath.includes('website1-minimalist')) style = 'minimalist';
        else if (currentPath.includes('website2-dark-luxury')) style = 'dark';
        else if (currentPath.includes('website3-magazine')) style = 'magazine';
        else if (currentPath.includes('website4-interactive')) style = 'interactive';
        else if (currentPath.includes('website5-fancy')) style = 'fancy';
        
        this.createSwitcher(style);
        this.applyTranslations();
    }

    createSwitcher(style) {
        // Check if language selector already exists in navigation
        const existingSelector = document.getElementById('language-selector');
        if (existingSelector) {
            this.setupExistingSelector(existingSelector);
            return;
        }
        
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        
        // Simple select dropdown instead of buttons
        switcher.innerHTML = `
            <select class="lang-select" id="langSelect">
                <option value="bg" ${this.currentLang === 'bg' ? 'selected' : ''}>BG</option>
                <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>EN</option>
                <option value="ru" ${this.currentLang === 'ru' ? 'selected' : ''}>RU</option>
                <option value="es" ${this.currentLang === 'es' ? 'selected' : ''}>ES</option>
            </select>
        `;

        // Style based on website theme
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.getStyles(style);
        document.head.appendChild(styleSheet);

        // Add to navbar if exists, otherwise to body
        const navbar = document.querySelector('.nav-container, .header-top, .nav-menu');
        if (navbar) {
            navbar.appendChild(switcher);
        } else {
            document.body.appendChild(switcher);
        }

        // Add event listener
        document.getElementById('langSelect').addEventListener('change', (e) => {
            this.switchLanguage(e.target.value);
        });
    }

    getStyles(style) {
        const baseStyles = `
            .language-switcher {
                display: inline-block;
                margin-left: auto;
            }
            
            .lang-select {
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.3s ease;
                outline: none;
            }
            
            .lang-select:focus {
                outline: none;
            }
        `;

        const themeStyles = {
            minimalist: `
                .language-switcher {
                    order: 3;
                }
                .lang-select {
                    background: transparent;
                    border: 1px solid #e0e0e0;
                    color: #666;
                }
                .lang-select:hover {
                    border-color: #333;
                    color: #333;
                }
            `,
            dark: `
                .lang-select {
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid #d4af37;
                    color: #d4af37;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .lang-select:hover {
                    background: rgba(212, 175, 55, 0.2);
                }
            `,
            magazine: `
                .lang-select {
                    background: white;
                    border: 2px solid #000;
                    color: #000;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 12px;
                }
                .lang-select:hover {
                    background: #000;
                    color: white;
                }
            `,
            interactive: `
                .lang-select {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    backdrop-filter: blur(10px);
                }
                .lang-select:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `,
            fancy: `
                .lang-select {
                    background: linear-gradient(45deg, #ff006e, #8338ec);
                    border: none;
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 4px 15px rgba(131, 56, 236, 0.4);
                }
                .lang-select:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(131, 56, 236, 0.6);
                }
            `,
            default: `
                .language-switcher {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }
                .lang-select {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    color: white;
                }
            `
        };

        return baseStyles + (themeStyles[style] || themeStyles.default);
    }

    setupExistingSelector(selector) {
        // Set the current language
        selector.value = this.currentLang;
        
        // Add event listener for language changes
        selector.addEventListener('change', (e) => {
            this.switchLanguage(e.target.value);
        });
        
        // Using existing navigation language selector
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        localStorage.setItem('selectedLanguage', lang);
        
        // Update the existing selector if it exists
        const existingSelector = document.getElementById('language-selector');
        if (existingSelector && existingSelector.value !== lang) {
            existingSelector.value = lang;
        }
        
        this.applyTranslations();
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    applyTranslations() {
        // Check if translations object exists
        if (typeof translations === 'undefined') {
            console.warn('Translations not loaded yet, retrying...');
            setTimeout(() => this.applyTranslations(), 100);
            return;
        }
        
        const t = translations[this.currentLang];
        
        // Apply translations to elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const keys = element.dataset.translate.split('.');
            let translation = t;
            keys.forEach(key => {
                translation = translation[key];
            });
            if (translation) {
                element.textContent = translation;
            }
        });

        // Apply translations to elements with data-translate-placeholder
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const keys = element.dataset.translatePlaceholder.split('.');
            let translation = t;
            keys.forEach(key => {
                translation = translation[key];
            });
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update document title if it has translation
        const titleElement = document.querySelector('title[data-translate]');
        if (titleElement) {
            const keys = titleElement.dataset.translate.split('.');
            let translation = t;
            keys.forEach(key => {
                translation = translation[key];
            });
            if (translation) {
                document.title = translation;
            }
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Give translations a moment to load
    setTimeout(() => {
        new LanguageSwitcher();
    }, 50);
});