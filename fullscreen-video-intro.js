// Fullscreen video intro for ArteamoAd.mp4 - LOCAL TESTING ONLY
(function() {
    'use strict';
    
    // Only run on local/test environments
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname.includes('192.168.') ||
                    window.location.hostname === '31.97.139.39';
    
    if (!isLocal) {
        console.log('Fullscreen intro disabled - not on local environment');
        return;
    }
    
    function createFullscreenIntro() {
        // Create fullscreen container
        const introContainer = document.createElement('div');
        introContainer.id = 'fullscreen-intro';
        introContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        
        // Create video element
        const video = document.createElement('video');
        video.src = 'ArteamoAd.mp4';
        video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
        `;
        video.autoplay = true;
        video.playsInline = true;
        // Start with sound
        video.muted = false;
        video.volume = 0.8;
        
        // Skip button
        const skipButton = document.createElement('button');
        skipButton.textContent = 'Skip Intro';
        skipButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.4);
            color: white;
            font-size: 14px;
            cursor: pointer;
            border-radius: 4px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        skipButton.onmouseover = () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.3)';
        };
        
        skipButton.onmouseout = () => {
            skipButton.style.background = 'rgba(255, 255, 255, 0.2)';
        };
        
        // Play/Pause on click
        introContainer.onclick = (e) => {
            if (e.target === skipButton) return;
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        };
        
        // Function to close intro
        const closeIntro = () => {
            introContainer.style.opacity = '0';
            introContainer.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                introContainer.remove();
                // Restore body scroll
                document.body.style.overflow = '';
            }, 500);
        };
        
        // Skip button click
        skipButton.onclick = (e) => {
            e.stopPropagation();
            closeIntro();
        };
        
        // Auto close when video ends
        video.onended = closeIntro;
        
        // Add elements to page
        introContainer.appendChild(video);
        introContainer.appendChild(skipButton);
        document.body.appendChild(introContainer);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Try to play with sound
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // If autoplay with sound fails, show play button
                if (error.name === 'NotAllowedError') {
                    const playButton = document.createElement('button');
                    playButton.innerHTML = `
                        <svg width="60" height="60" viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="28" fill="none" stroke="white" stroke-width="2"/>
                            <path d="M23 20 L23 40 L40 30 Z" fill="white"/>
                        </svg>
                    `;
                    playButton.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 0, 0, 0.5);
                        border: none;
                        border-radius: 50%;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    `;
                    
                    playButton.onclick = (e) => {
                        e.stopPropagation();
                        video.play();
                        playButton.remove();
                    };
                    
                    introContainer.appendChild(playButton);
                }
            });
        }
        
        // Volume control
        const volumeControl = document.createElement('input');
        volumeControl.type = 'range';
        volumeControl.min = '0';
        volumeControl.max = '100';
        volumeControl.value = '80';
        volumeControl.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 100px;
        `;
        
        volumeControl.oninput = (e) => {
            video.volume = e.target.value / 100;
        };
        
        introContainer.appendChild(volumeControl);
        
        // Add keyboard controls
        document.addEventListener('keydown', function introKeyHandler(e) {
            if (e.key === 'Escape') {
                closeIntro();
                document.removeEventListener('keydown', introKeyHandler);
            } else if (e.key === ' ') {
                e.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    }
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFullscreenIntro);
    } else {
        // Small delay to ensure everything is loaded
        setTimeout(createFullscreenIntro, 100);
    }
    
    console.log('Fullscreen video intro enabled (local testing mode)');
})();