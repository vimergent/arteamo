// Emergency fix to remove all blur effects from images
(function() {
    'use strict';
    
    // Function to remove blur from all images
    function removeAllBlur() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Remove any inline blur styles
            if (img.style.filter && img.style.filter.includes('blur')) {
                img.style.filter = 'none';
            }
            // Remove scale transform
            if (img.style.transform && img.style.transform.includes('scale')) {
                img.style.transform = 'none';
            }
            // Ensure full opacity
            img.style.opacity = '1';
        });
    }
    
    // Run immediately
    removeAllBlur();
    
    // Run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeAllBlur);
    }
    
    // Run after a delay to catch late-loading images
    setTimeout(removeAllBlur, 1000);
    setTimeout(removeAllBlur, 2000);
    
    // Monitor for new images
    if (document.body) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    removeAllBlur();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // If body doesn't exist yet, wait for it
        document.addEventListener('DOMContentLoaded', function() {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        removeAllBlur();
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    console.log('Blur removal fix applied');
})();