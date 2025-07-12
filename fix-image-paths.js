// Fix image paths with special characters
// This script URL-encodes special characters in image paths to prevent 404 errors

(function() {
    'use strict';
    
    function fixImagePaths() {
        // Get all image elements
        const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        const originalSrc = img.src;
        const originalSrcset = img.srcset;
        
        // Fix src attribute
        if (originalSrc) {
            // Decode first to handle any already encoded URLs
            const decodedSrc = decodeURI(originalSrc);
            
            // Split the URL into parts
            const urlParts = decodedSrc.split('/');
            
            // Encode only the filename part (last segment)
            if (urlParts.length > 0) {
                const filename = urlParts[urlParts.length - 1];
                // Encode the filename, preserving the file extension
                const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/');
                urlParts[urlParts.length - 1] = encodedFilename;
                
                // Also encode the folder name if it contains special characters
                if (urlParts.length > 1) {
                    const folderName = urlParts[urlParts.length - 2];
                    // Check if folder name contains Cyrillic or special characters
                    if (/[а-яА-Я()]/u.test(folderName)) {
                        urlParts[urlParts.length - 2] = encodeURIComponent(folderName);
                    }
                }
                
                const newSrc = urlParts.join('/');
                if (newSrc !== originalSrc) {
                    img.src = newSrc;
                }
            }
        }
        
        // Fix srcset attribute if present
        if (originalSrcset) {
            const srcsetParts = originalSrcset.split(',').map(part => {
                const [url, descriptor] = part.trim().split(/\s+/);
                const decodedUrl = decodeURI(url);
                const urlParts = decodedUrl.split('/');
                
                if (urlParts.length > 0) {
                    const filename = urlParts[urlParts.length - 1];
                    const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/');
                    urlParts[urlParts.length - 1] = encodedFilename;
                    
                    if (urlParts.length > 1) {
                        const folderName = urlParts[urlParts.length - 2];
                        if (/[а-яА-Я()]/u.test(folderName)) {
                            urlParts[urlParts.length - 2] = encodeURIComponent(folderName);
                        }
                    }
                    
                    const newUrl = urlParts.join('/');
                    return descriptor ? `${newUrl} ${descriptor}` : newUrl;
                }
                return part;
            });
            
            const newSrcset = srcsetParts.join(', ');
            if (newSrcset !== originalSrcset) {
                img.srcset = newSrcset;
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
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IMG') {
                fixImagePaths();
            } else if (node.querySelectorAll) {
                const images = node.querySelectorAll('img');
                if (images.length > 0) {
                    fixImagePaths();
                }
            }
        });
    });
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