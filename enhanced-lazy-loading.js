// Enhanced lazy loading with WebP support and performance optimization
(function() {
    'use strict';
    
    // WebP detection
    let webpSupport = false;
    function checkWebP(callback) {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
            webpSupport = webP.height === 2;
            callback(webpSupport);
        };
        webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }
    
    // Enhanced Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading 50px before visible
        threshold: 0.01
    });
    
    // Load image with WebP support
    function loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Create picture element for WebP support
        if (webpSupport && !img.closest('picture')) {
            const picture = document.createElement('picture');
            
            // WebP source
            const webpSource = document.createElement('source');
            webpSource.srcset = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            webpSource.type = 'image/webp';
            
            // Original format source
            const origSource = document.createElement('source');
            origSource.srcset = src;
            origSource.type = `image/${src.match(/\.(\w+)$/)[1]}`;
            
            // Insert picture element
            img.parentNode.insertBefore(picture, img);
            picture.appendChild(webpSource);
            picture.appendChild(origSource);
            picture.appendChild(img);
        }
        
        // Preload image
        const tempImg = new Image();
        tempImg.onload = function() {
            img.src = src;
            img.classList.add('loaded');
            
            // Full opacity after load
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        };
        
        tempImg.onerror = function() {
            img.src = src; // Try loading anyway
            img.classList.add('error');
        };
        
        tempImg.src = webpSupport && !img.closest('picture') 
            ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') 
            : src;
    }
    
    // Process all images
    function processImages() {
        // Convert NodeList to Array for better performance
        const images = Array.from(document.querySelectorAll('img[data-src], img[loading="lazy"]'));
        
        images.forEach(img => {
            // Add loading styles (removed blur for sharper images)
            if (!img.classList.contains('loaded')) {
                img.style.opacity = '0.8';
                img.style.transition = 'opacity 0.3s';
            }
            
            // Set up lazy loading
            if (img.dataset.src && !img.src) {
                // Use native lazy loading if supported
                if ('loading' in HTMLImageElement.prototype) {
                    img.loading = 'lazy';
                    loadImage(img);
                } else {
                    // Fall back to Intersection Observer
                    imageObserver.observe(img);
                }
            }
        });
    }
    
    // Add CSS for loading states
    function addLoadingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            img[data-src]:not(.loaded) {
                background: #f0f0f0;
                background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            img.loaded {
                animation: none;
                background: none;
            }
            
            img.error {
                background: #ffebee;
                position: relative;
            }
            
            img.error::after {
                content: '⚠️';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2em;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    function init() {
        checkWebP(function(supported) {
            if (supported) {
                document.documentElement.classList.add('webp');
            } else {
                document.documentElement.classList.add('no-webp');
            }
            
            addLoadingStyles();
            processImages();
            
            // Re-process images when new content is added
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        processImages();
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for use in other scripts
    window.LazyLoader = {
        processImages: processImages,
        loadImage: loadImage,
        webpSupport: () => webpSupport
    };
})();