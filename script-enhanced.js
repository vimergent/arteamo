// Enhanced Premium Minimalist JavaScript

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Custom cursor
class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'cursor';
        document.body.appendChild(this.cursor);
        
        this.mouse = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        this.ease = 0.15;
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Cursor hover effects
        const hoverElements = document.querySelectorAll('a, button, .project-card, .filter-btn, .nav-link');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });
        
        this.animate();
    }
    
    animate() {
        this.target.x += (this.mouse.x - this.target.x) * this.ease;
        this.target.y += (this.mouse.y - this.target.y) * this.ease;
        
        this.cursor.style.transform = `translate(${this.target.x - 10}px, ${this.target.y - 10}px)`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize cursor system - now managed by font tester
// Check if cursor effect is selected via testing menu
const savedCursor = localStorage.getItem('selectedCursor');
const urlParams = new URLSearchParams(window.location.search);
const urlCursor = urlParams.get('cursor') === 'true';

// Priority: localStorage setting > URL parameter > default (none)
let enableCustomCursor = false;
let cursorType = 'none';

if (savedCursor && savedCursor !== 'none') {
    enableCustomCursor = true;
    cursorType = savedCursor;
} else if (urlCursor) {
    enableCustomCursor = true;
    cursorType = 'minimal'; // Default for URL parameter
}

// Apply cursor if enabled and on desktop
if (enableCustomCursor && window.innerWidth > 768 && !('ontouchstart' in window)) {
    document.body.classList.add('custom-cursor-enabled');
    // Note: Actual cursor implementation is handled by FontTester class
    // This just enables the CSS for custom cursor
}

// Enhanced navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

const handleNavbarScroll = debounce(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
}, 10);

window.addEventListener('scroll', handleNavbarScroll);

// Smooth scrolling with easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const setActiveNav = debounce(() => {
    let scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, 100);

window.addEventListener('scroll', setActiveNav);

// Enhanced project filtering with animation
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectsGrid = document.querySelector('.projects-grid');

let isFiltering = false;

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (isFiltering) return;
        isFiltering = true;
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        // Add exit animation
        projectCards.forEach((card, index) => {
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'translateY(20px)';
            card.style.opacity = '0';
        });
        
        setTimeout(() => {
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Add entrance animation
            setTimeout(() => {
                projectCards.forEach((card, index) => {
                    if (card.style.display !== 'none') {
                        setTimeout(() => {
                            card.style.transform = 'translateY(0)';
                            card.style.opacity = '1';
                        }, index * 100);
                    }
                });
                
                setTimeout(() => {
                    isFiltering = false;
                }, 500);
            }, 50);
        }, 400);
    });
});

// Enhanced sorting with smooth transitions
const sortSelect = document.getElementById('sort-select');

sortSelect.addEventListener('change', () => {
    if (isFiltering) return;
    isFiltering = true;
    
    const sortValue = sortSelect.value;
    const projects = Array.from(projectCards).filter(card => 
        card.style.display !== 'none'
    );
    
    // Add exit animation
    projects.forEach(card => {
        card.style.transition = 'all 0.4s ease';
        card.style.transform = 'scale(0.8) translateY(20px)';
        card.style.opacity = '0';
    });
    
    setTimeout(() => {
        projects.sort((a, b) => {
            if (sortValue === 'newest') {
                return parseInt(b.getAttribute('data-year')) - parseInt(a.getAttribute('data-year'));
            } else if (sortValue === 'oldest') {
                return parseInt(a.getAttribute('data-year')) - parseInt(b.getAttribute('data-year'));
            } else if (sortValue === 'name') {
                const nameA = a.querySelector('h3').textContent.toLowerCase();
                const nameB = b.querySelector('h3').textContent.toLowerCase();
                return nameA.localeCompare(nameB);
            }
        });
        
        projects.forEach(project => {
            projectsGrid.appendChild(project);
        });
        
        // Add entrance animation
        setTimeout(() => {
            projects.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transform = 'scale(1) translateY(0)';
                    card.style.opacity = '1';
                }, index * 100);
            });
            
            setTimeout(() => {
                isFiltering = false;
            }, 500);
        }, 50);
    }, 400);
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Add scroll animation classes to elements
window.addEventListener('load', () => {
    const animateElements = [
        '.hero-content',
        '.about-content',
        '.service-card',
        '.contact-item'
    ];
    
    animateElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    });
});

// Enhanced parallax effect
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

const handleParallax = debounce(() => {
    const scrolled = window.pageYOffset;
    const parallax = scrolled * 0.3;
    const opacity = Math.max(0, 1 - scrolled / 800);
    
    if (hero) {
        hero.style.transform = `translateY(${parallax}px)`;
        heroContent.style.opacity = opacity;
    }
}, 10);

window.addEventListener('scroll', handleParallax);

// Enhanced image loading with blur effect
class ImageLoader {
    constructor() {
        this.images = document.querySelectorAll('.project-image img');
        this.loadImages();
    }
    
    loadImages() {
        this.images.forEach(img => {
            // Add blur effect initially
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.6s ease';
            
            // Create intersection observer for lazy loading
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            });
            
            imageObserver.observe(img);
        });
    }
    
    loadImage(img) {
        const src = img.src;
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.style.filter = 'blur(0)';
            img.classList.add('loaded');
        };
        
        tempImg.src = src;
    }
}

new ImageLoader();

// Page transition effects
class PageTransitions {
    constructor() {
        this.createLoader();
        this.handleTransitions();
    }
    
    createLoader() {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-logo">STUDIO ARTEAMO</div>
                <div class="loader-progress">
                    <div class="loader-bar"></div>
                </div>
            </div>
        `;
        
        const loaderStyles = `
            .page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ffffff 0%, #f9f7f4 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                transition: opacity 0.6s ease, visibility 0.6s ease;
            }
            
            .page-loader.hidden {
                opacity: 0;
                visibility: hidden;
            }
            
            .loader-content {
                text-align: center;
            }
            
            .loader-logo {
                font-family: 'Space Grotesk', sans-serif;
                font-size: 2rem;
                font-weight: 700;
                letter-spacing: 0.02em;
                background: linear-gradient(135deg, #000000, #d4af37);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 2rem;
            }
            
            .loader-progress {
                width: 200px;
                height: 2px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 1px;
                overflow: hidden;
            }
            
            .loader-bar {
                height: 100%;
                background: linear-gradient(90deg, #000000, #d4af37);
                animation: loadProgress 2s ease-out forwards;
                transform: translateX(-100%);
            }
            
            @keyframes loadProgress {
                to {
                    transform: translateX(0);
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = loaderStyles;
        document.head.appendChild(styleSheet);
        document.body.appendChild(loader);
        
        this.loader = loader;
    }
    
    handleTransitions() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loader.classList.add('hidden');
                document.body.style.overflow = 'auto';
                
                setTimeout(() => {
                    this.loader.remove();
                }, 600);
            }, 2000);
        });
    }
}

// Initialize page transitions
new PageTransitions();

// Enhanced mobile menu (if mobile menu toggle exists)
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Touch device optimizations
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Add touch feedback for interactive elements
    const touchElements = document.querySelectorAll('.project-card, .filter-btn, .service-card');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', () => {
            el.style.transform = 'scale(0.98)';
        });
        
        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.style.transform = '';
            }, 150);
        });
    });
}

// Enhanced project gallery opening
function openProjectGallery(projectFolder, projectName) {
    // Add exit animation before navigation
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.7';
    
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const fromPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        window.location.href = `../gallery-premium.html?project=${encodeURIComponent(projectFolder)}&name=${encodeURIComponent(projectName)}&from=${encodeURIComponent(fromPath)}`;
    }, 300);
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.monitorPerformance();
    }
    
    monitorPerformance() {
        // Monitor paint metrics
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        console.log(`First Contentful Paint: ${entry.startTime}ms`);
                    }
                }
            });
            
            paintObserver.observe({ entryTypes: ['paint'] });
        }
        
        // Monitor layout shifts
        if ('PerformanceObserver' in window) {
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        console.log('Layout shift detected:', entry.value);
                    }
                }
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost') {
    new PerformanceMonitor();
}

// Accessibility enhancements
class AccessibilityEnhancements {
    constructor() {
        this.addKeyboardNavigation();
        this.addFocusManagement();
        this.addScreenReaderSupport();
    }
    
    addKeyboardNavigation() {
        // Add keyboard navigation for project cards
        projectCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View project: ${card.querySelector('h3').textContent}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
        
        // Add keyboard navigation for filters
        filterButtons.forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }
    
    addFocusManagement() {
        // Add focus indicators
        const focusableElements = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        
        focusableElements.forEach(el => {
            el.addEventListener('focus', () => {
                el.style.outline = '2px solid #d4af37';
                el.style.outlineOffset = '2px';
            });
            
            el.addEventListener('blur', () => {
                el.style.outline = 'none';
            });
        });
    }
    
    addScreenReaderSupport() {
        // Add ARIA labels and descriptions
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
            projectsSection.setAttribute('aria-label', 'Portfolio projects');
        }
        
        const filtersSection = document.getElementById('filters');
        if (filtersSection) {
            filtersSection.setAttribute('aria-label', 'Project filters and sorting options');
        }
    }
}

new AccessibilityEnhancements();

// Global function for project gallery (required by onclick handlers)
window.openProjectGallery = openProjectGallery;