// Mobile Video Intro for Studio Arteamo
(function() {
    'use strict';
    
    // Check if device is mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768 && 'ontouchstart' in window);
    }
    
    // Check if video has already been shown in this session
    function hasVideoBeenShown() {
        return sessionStorage.getItem('arteamoVideoShown') === 'true';
    }
    
    // Mark video as shown
    function markVideoAsShown() {
        sessionStorage.setItem('arteamoVideoShown', 'true');
    }
    
    // Create and show fullscreen video
    function showMobileVideo() {
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'mobile-video-intro';
        videoContainer.innerHTML = `
            <video id="introVideo" playsinline webkit-playsinline>
                <source src="ArteamoAd.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <button class="skip-video-btn" aria-label="Skip video">Skip</button>
            <div class="video-progress">
                <div class="video-progress-bar"></div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-video-intro {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .mobile-video-intro video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .skip-video-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10001;
                font-family: 'Space Grotesk', sans-serif;
                letter-spacing: 0.5px;
            }
            
            .skip-video-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            
            .video-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                z-index: 10001;
            }
            
            .video-progress-bar {
                height: 100%;
                background: #d4af37;
                width: 0%;
                transition: width 0.1s linear;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            .mobile-video-intro.fade-out {
                animation: fadeOut 0.5s ease-out forwards;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(videoContainer);
        
        const video = document.getElementById('introVideo');
        const skipBtn = document.querySelector('.skip-video-btn');
        const progressBar = document.querySelector('.video-progress-bar');
        
        // Update progress bar
        video.addEventListener('timeupdate', function() {
            if (video.duration) {
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.style.width = progress + '%';
            }
        });
        
        // Handle video end
        function closeVideo() {
            markVideoAsShown();
            videoContainer.classList.add('fade-out');
            setTimeout(() => {
                videoContainer.remove();
                style.remove();
            }, 500);
        }
        
        video.addEventListener('ended', closeVideo);
        skipBtn.addEventListener('click', closeVideo);
        
        // Try to play video with sound
        video.muted = false;
        video.volume = 1.0;
        
        // Attempt to enter fullscreen
        function enterFullscreen() {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        }
        
        // Play video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Video started playing successfully
                console.log('Video playing with sound');
                // Try fullscreen after play starts
                setTimeout(enterFullscreen, 100);
            }).catch(error => {
                // Auto-play was prevented, try muted
                console.log('Autoplay with sound failed, trying muted:', error);
                video.muted = true;
                video.play().then(() => {
                    // Show unmute button
                    const unmuteBtn = document.createElement('button');
                    unmuteBtn.className = 'unmute-btn';
                    unmuteBtn.innerHTML = '🔇 Tap for sound';
                    unmuteBtn.style.cssText = `
                        position: absolute;
                        bottom: 60px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(212, 175, 55, 0.9);
                        color: black;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        z-index: 10001;
                        font-family: 'Space Grotesk', sans-serif;
                        animation: pulse 2s infinite;
                    `;
                    
                    // Add pulse animation
                    const pulseStyle = document.createElement('style');
                    pulseStyle.textContent = `
                        @keyframes pulse {
                            0%, 100% {
                                transform: translateX(-50%) scale(1);
                            }
                            50% {
                                transform: translateX(-50%) scale(1.05);
                            }
                        }
                    `;
                    document.head.appendChild(pulseStyle);
                    
                    videoContainer.appendChild(unmuteBtn);
                    
                    unmuteBtn.addEventListener('click', function() {
                        video.muted = false;
                        video.volume = 1.0;
                        unmuteBtn.remove();
                        pulseStyle.remove();
                        enterFullscreen();
                    });
                    
                    // Try fullscreen even when muted
                    setTimeout(enterFullscreen, 100);
                }).catch(err => {
                    console.error('Video playback failed:', err);
                    closeVideo();
                });
            });
        }
        
        // Handle fullscreen exit
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        
        function handleFullscreenChange() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                // User exited fullscreen, close video
                closeVideo();
                document.removeEventListener('fullscreenchange', handleFullscreenChange);
                document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            }
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        if (isMobileDevice() && !hasVideoBeenShown()) {
            // Small delay to ensure page resources are loaded
            setTimeout(showMobileVideo, 500);
        }
    }
    
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();