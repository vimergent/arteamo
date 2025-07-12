// Awards Handler - Dynamically creates award items with optional links
function initializeAwards() {
    // Check if translations are loaded
    if (!window.translations) {
        setTimeout(initializeAwards, 100);
        return;
    }
    
    // Find all elements with data-awards attribute
    const awardsContainers = document.querySelectorAll('[data-awards="true"]');
    
    awardsContainers.forEach(container => {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const awards = window.translations[currentLang].about;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create award list
        const ul = document.createElement('ul');
        
        // Process each award (1-3)
        for (let i = 1; i <= 3; i++) {
            const awardText = awards[`award${i}`];
            const awardLink = awards[`award${i}_link`];
            
            if (awardText) {
                const li = document.createElement('li');
                
                if (awardLink && awardLink.trim() !== '') {
                    // Create link if URL exists
                    const a = document.createElement('a');
                    a.href = awardLink;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = awardText;
                    a.style.cssText = 'color: inherit; text-decoration: none; border-bottom: 1px solid currentColor; transition: opacity 0.3s;';
                    a.onmouseover = function() { this.style.opacity = '0.7'; };
                    a.onmouseout = function() { this.style.opacity = '1'; };
                    li.appendChild(a);
                } else {
                    // Just text if no link
                    li.textContent = awardText;
                }
                
                ul.appendChild(li);
            }
        }
        
        container.appendChild(ul);
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initializeAwards);

// Re-initialize when language changes
document.addEventListener('languageChanged', initializeAwards);