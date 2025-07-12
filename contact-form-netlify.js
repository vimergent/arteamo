// Contact Form Handler for Studio Arteamo - Netlify Forms Version
class ContactForm {
    constructor() {
        this.formId = 'contactForm';
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        console.log('ContactForm: Initializing...');
        const formContainer = document.getElementById('contactFormContainer');
        if (!formContainer) {
            console.error('ContactForm: Container not found');
            return;
        }
        
        this.createForm(formContainer);
        this.attachEventListeners();
        this.initialized = true;
        console.log('ContactForm: Initialized successfully');
    }

    createForm(container) {
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translations = window.translations && window.translations[currentLang] ? 
            window.translations[currentLang].contact : {
                formName: 'Name',
                formEmail: 'Email',
                formPhone: 'Phone',
                formSubject: 'Subject',
                formMessage: 'Message',
                formSubmit: 'Send Message',
                formSuccessTitle: 'Thank You!',
                formSuccessMessage: 'We will get back to you as soon as possible.',
                formNewMessage: 'Send Another Message'
            };
        
        container.innerHTML = `
            <form id="${this.formId}" 
                  name="contact" 
                  method="POST" 
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  data-netlify-recaptcha="true"
                  class="contact-form"
                  style="display: block !important; flex-direction: column !important; max-width: 600px !important; margin: 0 auto !important;">
                
                <!-- Hidden field for Netlify Forms -->
                <input type="hidden" name="form-name" value="contact">
                
                <!-- Honeypot field for spam protection -->
                <p style="display: none;">
                    <label>Don't fill this out: <input name="bot-field" /></label>
                </p>
                
                <!-- Language field to track form submission language -->
                <input type="hidden" name="language" value="${currentLang}">
                
                <div class="form-group" style="display: block !important; width: 100% !important; margin-bottom: 1.5rem !important;">
                    <label for="name" style="display: block !important; margin-bottom: 0.5rem !important;">${translations.formName || 'Name'} *</label>
                    <input type="text" id="name" name="name" required style="display: block !important; width: 100% !important;">
                </div>
                
                <div class="form-group" style="display: block !important; width: 100% !important; margin-bottom: 1.5rem !important;">
                    <label for="email" style="display: block !important; margin-bottom: 0.5rem !important;">${translations.formEmail || 'Email'} *</label>
                    <input type="email" id="email" name="email" required style="display: block !important; width: 100% !important;">
                </div>
                
                <div class="form-group" style="display: block !important; width: 100% !important; margin-bottom: 1.5rem !important;">
                    <label for="phone" style="display: block !important; margin-bottom: 0.5rem !important;">${translations.formPhone || 'Phone'}</label>
                    <input type="tel" id="phone" name="phone" style="display: block !important; width: 100% !important;">
                </div>
                
                <div class="form-group" style="display: block !important; width: 100% !important; margin-bottom: 1.5rem !important;">
                    <label for="subject" style="display: block !important; margin-bottom: 0.5rem !important;">${translations.formSubject || 'Subject'} *</label>
                    <input type="text" id="subject" name="subject" required style="display: block !important; width: 100% !important;">
                </div>
                
                <div class="form-group" style="display: block !important; width: 100% !important; margin-bottom: 1.5rem !important;">
                    <label for="message" style="display: block !important; margin-bottom: 0.5rem !important;">${translations.formMessage || 'Message'} *</label>
                    <textarea id="message" name="message" rows="5" required style="display: block !important; width: 100% !important;"></textarea>
                </div>
                
                <div class="form-group">
                    <div data-netlify-recaptcha="true"></div>
                </div>
                
                <div class="form-group">
                    <button type="submit" class="submit-btn">
                        ${translations.formSubmit || 'Send Message'}
                    </button>
                </div>
                
                <div id="formStatus" class="form-status"></div>
            </form>
            
            <!-- Success page content (hidden by default) -->
            <div id="formSuccess" class="form-success-message" style="display: none;">
                <h3>${translations.formSuccess || 'Thank you for your message!'}</h3>
                <p>${translations.formSuccessMessage || 'We will get back to you as soon as possible.'}</p>
                <button class="back-btn" onclick="window.location.reload()">
                    ${translations.formNewMessage || 'Send Another Message'}
                </button>
            </div>
        `;
        
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('contactFormStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'contactFormStyles';
        styles.innerHTML = `
            .contact-form {
                max-width: 600px !important;
                margin: 0 auto !important;
                display: block !important;
                flex-direction: column !important;
            }
            
            .contact-form:not(.processing) {
                display: block !important;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
                display: block !important;
                width: 100% !important;
                flex: none !important;
                flex-direction: column !important;
            }
            
            .contact-form .form-group {
                display: block !important;
                width: 100% !important;
                clear: both !important;
                float: none !important;
            }
            
            #contactFormContainer .form-group {
                display: block !important;
                width: 100% !important;
                margin-bottom: 1.5rem !important;
                flex: none !important;
            }
            
            #contactFormContainer .form-group > * {
                display: block !important;
                width: 100% !important;
                clear: both !important;
                float: none !important;
            }
            
            /* Override any flex container styles */
            #contactFormContainer,
            #contactFormContainer form,
            #contactFormContainer .contact-form {
                display: block !important;
                flex-direction: column !important;
                flex-wrap: nowrap !important;
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
            
            .submit-btn, .back-btn {
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
            
            .submit-btn:hover, .back-btn:hover {
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
            
            .form-success-message {
                text-align: center;
                padding: 3rem;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(212, 175, 55, 0.3);
            }
            
            .form-success-message h3 {
                color: var(--premium-gold, #d4af37);
                margin-bottom: 1rem;
                font-size: 1.75rem;
            }
            
            .form-success-message p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 2rem;
            }
            
            /* reCAPTCHA styling */
            .g-recaptcha {
                margin: 0 auto;
                display: inline-block;
            }
            
            [data-netlify-recaptcha] {
                display: flex;
                justify-content: center;
                margin-bottom: 1rem;
            }
        `;
        
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        const form = document.getElementById(this.formId);
        if (!form) return;
        
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
        // Netlify Forms will handle the submission automatically
        // We'll just handle the UI feedback
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const translations = window.translations[currentLang].contact;
        
        // Update button text during submission
        submitBtn.disabled = true;
        submitBtn.textContent = translations.formSending || 'Sending...';
        
        // Let Netlify handle the form submission
        // The form will redirect or show success based on Netlify's response
        
        // Note: If you want to handle the submission via AJAX instead:
        // Uncomment the following code and prevent default submission
        
        /*
        e.preventDefault();
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            if (response.ok) {
                // Show success message
                form.style.display = 'none';
                document.getElementById('formSuccess').style.display = 'block';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            const statusDiv = document.getElementById('formStatus');
            statusDiv.className = 'form-status error';
            statusDiv.textContent = translations.formError || 'Error sending message. Please try again.';
            statusDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = translations.formSubmit || 'Send Message';
        }
        */
    }
}

// Initialize contact form
// Since script is loaded with defer, DOM is already ready
console.log('Contact form script loaded');

// Create global instance
window.contactForm = new ContactForm();

// Initialize immediately since defer ensures DOM is ready
setTimeout(() => {
    console.log('Attempting to initialize contact form...');
    console.log('Translations available:', !!window.translations);
    console.log('Container exists:', !!document.getElementById('contactFormContainer'));
    
    // Force initialization even without translations
    const container = document.getElementById('contactFormContainer');
    if (container && !window.contactForm.initialized) {
        window.contactForm.init();
    }
}, 500); // Small delay to ensure other scripts have loaded

// Re-initialize when language changes
document.addEventListener('languageChanged', () => {
    const contactForm = new ContactForm();
    contactForm.initialized = false;
    contactForm.init();
});