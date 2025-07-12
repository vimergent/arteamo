// Secure Contact Form Handler for Studio Arteamo (No Email Exposure)
class SecureContactForm {
    constructor() {
        this.formId = 'contactForm';
        this.initialized = false;
        // FormSubmit.co endpoint - replace with your encoded endpoint
        // Get your endpoint at: https://formsubmit.co/your-email@example.com
        // This will give you a hash like: https://formsubmit.co/el/confirm/abc123xyz
        this.formEndpoint = 'https://formsubmit.co/YOUR_FORMSUBMIT_HASH';
    }

    init() {
        if (this.initialized) return;
        
        const formContainer = document.getElementById('contactFormContainer');
        if (!formContainer) return;
        
        this.createForm(formContainer);
        this.attachEventListeners();
        this.initialized = true;
    }

    createForm(container) {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translations = window.translations && window.translations[currentLang] ? 
            window.translations[currentLang].contact : {};
        
        container.innerHTML = `
            <form id="${this.formId}" class="contact-form" action="${this.formEndpoint}" method="POST">
                <!-- FormSubmit Configuration -->
                <input type="hidden" name="_subject" value="New contact from Studio Arteamo website">
                <input type="hidden" name="_captcha" value="false"> <!-- Disable captcha if desired -->
                <input type="hidden" name="_template" value="table"> <!-- Email template style -->
                
                <div class="form-group">
                    <label for="name">${translations.formName || 'Name'} *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">${translations.formEmail || 'Email'} *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">${translations.formPhone || 'Phone'}</label>
                    <input type="tel" id="phone" name="phone">
                </div>
                
                <div class="form-group">
                    <label for="subject">${translations.formSubject || 'Subject'} *</label>
                    <input type="text" id="subject" name="subject" required>
                </div>
                
                <div class="form-group">
                    <label for="message">${translations.formMessage || 'Message'} *</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                
                <!-- Honeypot field for spam protection -->
                <input type="text" name="_honey" style="display:none">
                
                <div class="form-group">
                    <button type="submit" class="submit-btn">
                        ${translations.formSubmit || 'Send Message'}
                    </button>
                </div>
                
                <div id="formStatus" class="form-status"></div>
            </form>
        `;
        
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('contactFormStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'contactFormStyles';
        styles.innerHTML = `
            .contact-form {
                max-width: 600px;
                margin: 0 auto;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.95);
                font-size: 0.95rem;
                letter-spacing: 0.5px;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 0.875rem 1rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                font-size: 1rem;
                font-family: inherit;
                transition: all 0.3s ease;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                color: white;
            }
            
            .form-group input::placeholder,
            .form-group textarea::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--premium-gold, #d4af37);
                box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .submit-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 0.875rem 2.5rem;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                backdrop-filter: blur(10px);
                border-radius: 6px;
            }
            
            .submit-btn:hover {
                background: var(--premium-gold, #d4af37);
                border-color: var(--premium-gold, #d4af37);
                color: #1a1a1a;
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
            }
            
            .submit-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .form-status {
                margin-top: 1rem;
                padding: 1rem;
                border-radius: 4px;
                display: none;
                text-align: center;
            }
            
            .form-status.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                display: block;
            }
            
            .form-status.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                display: block;
            }
        `;
        
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        const form = document.getElementById(this.formId);
        if (!form) return;
        
        // For AJAX submission (optional - FormSubmit works without JS too)
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Update form when language changes
        document.addEventListener('languageChanged', () => {
            const container = document.getElementById('contactFormContainer');
            if (container) {
                this.createForm(container);
                this.attachEventListeners();
            }
        });
    }

    async handleSubmit(e) {
        // Optional: Handle form submission via AJAX
        // If you want the default form submission (page reload), comment out this entire method
        
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const statusDiv = document.getElementById('formStatus');
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translations = window.translations[currentLang].contact;
        
        submitBtn.disabled = true;
        submitBtn.textContent = translations.formSending || 'Sending...';
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch(this.formEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                statusDiv.className = 'form-status success';
                statusDiv.textContent = translations.formSuccess || 'Message sent successfully!';
                form.reset();
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            statusDiv.className = 'form-status error';
            statusDiv.textContent = translations.formError || 'Error sending message. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = translations.formSubmit || 'Send Message';
        }
    }
}

// Initialize contact form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new SecureContactForm();
    
    // Wait for translations to load
    function tryInit() {
        if (window.translations) {
            contactForm.init();
        } else {
            setTimeout(tryInit, 100);
        }
    }
    
    tryInit();
});

// Re-initialize when language changes
document.addEventListener('languageChanged', () => {
    const contactForm = new SecureContactForm();
    contactForm.initialized = false;
    contactForm.init();
});

/* 
SETUP INSTRUCTIONS:

1. Go to https://formsubmit.co/your-email@example.com
2. You'll receive an activation email - click the link
3. You'll get a unique hash URL like: https://formsubmit.co/el/confirm/abc123xyz
4. Replace 'YOUR_FORMSUBMIT_HASH' in line 8 with your hash
5. FormSubmit features:
   - No registration required
   - Email addresses are never exposed
   - Built-in spam protection
   - Works on any static hosting
   - Supports multiple recipients
   - Custom email templates
   - Auto-response to users

Alternative services:
- Formspree: https://formspree.io
- Web3Forms: https://web3forms.com
- EmailJS: https://www.emailjs.com
*/