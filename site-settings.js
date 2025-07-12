// Site Settings Manager
// This file manages settings that can be configured from the admin panel

const siteSettings = {
    // Get the contact email from localStorage or use default
    getContactEmail() {
        try {
            // First try to get from localStorage (set by admin)
            const adminEmail = localStorage.getItem('adminContactEmail');
            if (adminEmail) {
                return adminEmail;
            }
            
            // Then try to get from site settings
            const settings = localStorage.getItem('siteSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                if (parsed.contactEmail) {
                    return parsed.contactEmail;
                }
            }
        } catch (e) {
            console.error('Error reading site settings:', e);
        }
        
        // Default email
        return 'petyaem@abv.bg';
    },
    
    // Save contact email (called from admin panel)
    setContactEmail(email) {
        localStorage.setItem('adminContactEmail', email);
        const settings = {
            contactEmail: email,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('siteSettings', JSON.stringify(settings));
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = siteSettings;
}