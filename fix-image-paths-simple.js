// Simple fix for double-encoded image paths
(function() {
    'use strict';
    
    function fixDoubleEncoding() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (img.src && img.src.includes('%25')) {
                // Fix double-encoded URLs by replacing %25 with %
                img.src = img.src.replace(/%25/g, '%');
            }
            
            if (img.srcset && img.srcset.includes('%25')) {
                img.srcset = img.srcset.replace(/%25/g, '%');
            }
        });
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixDoubleEncoding);
    } else {
        fixDoubleEncoding();
    }
    
    // Monitor for new images
    const observer = new MutationObserver(() => {
        fixDoubleEncoding();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();