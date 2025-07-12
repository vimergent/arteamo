// Video Player Functionality
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('arteamo-video');
    const playButton = document.querySelector('.play-button');
    const videoOverlay = document.querySelector('.video-overlay');
    const playPauseBtn = document.querySelector('.play-pause');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    const soundToggle = document.querySelector('.sound-toggle');
    const soundOn = document.querySelector('.sound-on');
    const soundOff = document.querySelector('.sound-off');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const videoControls = document.querySelector('.video-controls');

    if (!video) return;

    // Play button click
    playButton.addEventListener('click', function() {
        video.play();
        videoOverlay.classList.add('hidden');
        videoControls.classList.add('visible');
        updatePlayPauseButton(true);
    });

    // Play/Pause toggle
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            updatePlayPauseButton(true);
        } else {
            video.pause();
            updatePlayPauseButton(false);
        }
    });

    // Sound toggle
    soundToggle.addEventListener('click', function() {
        video.muted = !video.muted;
        updateSoundButton(video.muted);
    });

    // Progress bar click
    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    });

    // Update progress bar
    video.addEventListener('timeupdate', function() {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = percent + '%';
    });

    // Video ended
    video.addEventListener('ended', function() {
        videoOverlay.classList.remove('hidden');
        updatePlayPauseButton(false);
        progressFill.style.width = '0%';
    });

    // Hide controls when playing
    let controlsTimeout;
    video.addEventListener('play', function() {
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(function() {
            if (!video.paused) {
                videoControls.classList.remove('visible');
            }
        }, 3000);
    });

    // Show controls on pause
    video.addEventListener('pause', function() {
        clearTimeout(controlsTimeout);
        videoControls.classList.add('visible');
    });

    // Show controls on mouse move
    const videoContainer = document.querySelector('.video-container');
    videoContainer.addEventListener('mousemove', function() {
        videoControls.classList.add('visible');
        clearTimeout(controlsTimeout);
        if (!video.paused) {
            controlsTimeout = setTimeout(function() {
                videoControls.classList.remove('visible');
            }, 3000);
        }
    });

    // Helper functions
    function updatePlayPauseButton(isPlaying) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }

    function updateSoundButton(isMuted) {
        if (isMuted) {
            soundOn.style.display = 'none';
            soundOff.style.display = 'inline';
        } else {
            soundOn.style.display = 'inline';
            soundOff.style.display = 'none';
        }
    }

    // Initialize button states
    updatePlayPauseButton(false);
    updateSoundButton(video.muted);
});