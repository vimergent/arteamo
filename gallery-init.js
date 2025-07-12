// Gallery initialization script - optimized for performance

// Custom encoding function that properly encodes parentheses
function encodeImagePath(path) {
    return encodeURIComponent(path).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function openProjectGallery(projectFolder, projectName) {
    const currentPath = window.location.pathname;
    const fromPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    window.location.href = `gallery-premium.html?project=${encodeURIComponent(projectFolder)}&name=${encodeURIComponent(projectName)}&from=${encodeURIComponent(fromPath)}`;
}

// Get gallery data from centralized configuration
const currentLang = localStorage.getItem('selectedLanguage') || 'en';
const galleryData = Object.entries(projectConfig).map(([folder, config]) => ({
    folder: folder,
    name: config.name[currentLang] || config.name.en,
    images: config.images.slice(0, 5) // Take first 5 images for random gallery
}));

// Function to get random images
function getRandomImages(count = 6) {
    const allImages = [];
    
    // Collect all images with project info
    galleryData.forEach(project => {
        // Only take first 2 images per project for faster loading
        project.images.slice(0, 2).forEach(image => {
            // Use direct folder path to access images
            const imagePath = `${encodeImagePath(project.folder)}/${encodeImagePath(image)}`;
            allImages.push({
                src: imagePath,
                projectName: project.name,
                projectFolder: project.folder
            });
        });
    });
    
    // Shuffle array
    for (let i = allImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }
    
    // Return requested number of images
    return allImages.slice(0, count);
}

// Simple gallery creation
function createGalleryWithImages(container, images) {
    container.innerHTML = ''; // Clear existing content
    
    images.forEach((imageData, index) => {
        const item = document.createElement('div');
        item.className = 'random-gallery-item loaded'; // Add loaded class immediately
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.projectName;
        img.loading = index < 3 ? 'eager' : 'lazy'; // Load first 3 images eagerly
        
        const overlay = document.createElement('div');
        overlay.className = 'gallery-item-overlay';
        overlay.innerHTML = `<div class="gallery-item-title">${imageData.projectName}</div>`;
        
        item.appendChild(img);
        item.appendChild(overlay);
        
        // Click handler
        item.addEventListener('click', () => {
            openProjectGallery(imageData.projectFolder, imageData.projectName);
        });
        
        container.appendChild(item);
    });
}

// Seamless crossfade refresh
let isRefreshing = false;
let userInteracting = false;
let lastInteraction = Date.now();

function autoRefreshGallery() {
    // Skip if already refreshing or user recently interacted
    if (isRefreshing || (Date.now() - lastInteraction < 2000)) {
        return;
    }
    
    isRefreshing = true;
    const gallery = document.getElementById('randomGallery');
    const randomImages = getRandomImages(6);
    
    // Create a new container for seamless transition
    const newGallery = document.createElement('div');
    newGallery.id = 'randomGalleryNew';
    newGallery.className = 'random-gallery';
    newGallery.style.position = 'absolute';
    newGallery.style.top = '0';
    newGallery.style.left = '0';
    newGallery.style.width = '100%';
    newGallery.style.opacity = '0';
    newGallery.style.transition = 'opacity 0.8s ease';
    
    // Insert new gallery
    gallery.parentNode.style.position = 'relative';
    gallery.parentNode.appendChild(newGallery);
    
    // Create new gallery content
    createGalleryWithImages(newGallery, randomImages);
    
    // Trigger crossfade
    requestAnimationFrame(() => {
        gallery.style.transition = 'opacity 0.8s ease';
        gallery.style.opacity = '0';
        newGallery.style.opacity = '1';
        
        // Cleanup after transition
        setTimeout(() => {
            gallery.remove();
            newGallery.id = 'randomGallery';
            newGallery.style.position = 'static';
            isRefreshing = false;
        }, 800);
    });
}

// Track user interaction
document.addEventListener('mousemove', () => {
    lastInteraction = Date.now();
});

document.addEventListener('touchstart', () => {
    lastInteraction = Date.now();
});

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('randomGallery');
    if (gallery) {
        const initialImages = getRandomImages(6);
        createGalleryWithImages(gallery, initialImages);
        
        // Disable auto-refresh for now - it's causing issues
        // setInterval(() => {
        //     autoRefreshGallery();
        // }, 10000);
    }
});