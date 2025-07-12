// Fix image paths with special characters (Version 2)
// This script properly handles URL encoding for special characters in image paths

(function() {
    'use strict';
    
    function fixImagePaths() {
        // Get all image elements
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            const originalSrc = img.getAttribute('src');
            const originalSrcset = img.getAttribute('srcset');
            
            // Fix src attribute
            if (originalSrc && !originalSrc.startsWith('data:')) {
                try {
                    // Parse the URL to check if it needs fixing
                    const url = new URL(originalSrc, window.location.href);
                    const pathname = url.pathname;
                    
                    // Check if the path contains encoded characters that shouldn't be double-encoded
                    if (pathname.includes('%25')) {
                        // Already double-encoded, fix it
                        const fixed = pathname.replace(/%25/g, '%');
                        url.pathname = fixed;
                        img.src = url.href;
                    } else if (/[а-яА-Я(),\s]/.test(decodeURIComponent(pathname))) {
                        // Path contains special characters that need encoding
                        // But only if they're not already properly encoded
                        const parts = pathname.split('/');
                        const fixedParts = parts.map(part => {
                            // Skip empty parts
                            if (!part) return part;
                            
                            try {
                                // Try to decode to check if already encoded
                                const decoded = decodeURIComponent(part);
                                // If it decodes successfully and contains special chars, it's already encoded properly
                                if (decoded !== part && /[а-яА-Я(),\s]/.test(decoded)) {
                                    return part; // Keep as is
                                }
                                // Otherwise encode it
                                return encodeURIComponent(decoded);
                            } catch (e) {
                                // If decode fails, it might be partially encoded
                                return part;
                            }
                        });
                        
                        url.pathname = fixedParts.join('/');
                        if (url.href !== img.src) {
                            img.src = url.href;
                        }
                    }
                } catch (e) {
                    console.warn('Error processing image URL:', originalSrc, e);
                }
            }
            
            // Fix srcset attribute if present
            if (originalSrcset) {
                try {
                    const srcsetParts = originalSrcset.split(',').map(part => {
                        const [urlPart, ...descriptors] = part.trim().split(/\s+/);
                        const url = new URL(urlPart, window.location.href);
                        const pathname = url.pathname;
                        
                        if (pathname.includes('%25')) {
                            const fixed = pathname.replace(/%25/g, '%');
                            url.pathname = fixed;
                            return [url.href, ...descriptors].join(' ');
                        }
                        
                        return part;
                    });
                    
                    const newSrcset = srcsetParts.join(', ');
                    if (newSrcset !== originalSrcset) {
                        img.srcset = newSrcset;
                    }
                } catch (e) {
                    console.warn('Error processing srcset:', originalSrcset, e);
                }
            }
        });
    }

    // Fix image paths when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixImagePaths);
    } else {
        fixImagePaths();
    }

    // Also fix paths for dynamically loaded images
    const observer = new MutationObserver((mutations) => {
        let hasNewImages = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'IMG') {
                    hasNewImages = true;
                } else if (node.querySelectorAll) {
                    const images = node.querySelectorAll('img');
                    if (images.length > 0) {
                        hasNewImages = true;
                    }
                }
            });
        });
        
        if (hasNewImages) {
            // Debounce to avoid too many calls
            clearTimeout(observer.timeout);
            observer.timeout = setTimeout(fixImagePaths, 100);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Export for use in other scripts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = fixImagePaths;
    }
})();