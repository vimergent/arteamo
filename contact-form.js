// Contact Form Handler with Netlify Integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        // Add required Netlify attributes
        form.setAttribute('data-netlify', 'true');
        form.setAttribute('data-netlify-honeypot', 'bot-field');
        
        // Add hidden form-name field for Netlify
        const formNameInput = document.createElement('input');
        formNameInput.type = 'hidden';
        formNameInput.name = 'form-name';
        formNameInput.value = 'contact';
        form.appendChild(formNameInput);
        
        // Add honeypot field
        const honeypot = document.createElement('div');
        honeypot.style.display = 'none';
        honeypot.innerHTML = '<label>Don\'t fill this out: <input name="bot-field" /></label>';
        form.insertBefore(honeypot, form.firstChild);
        
        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Update button state
            submitButton.disabled = true;
            submitButton.textContent = 'Изпращане...';
            
            try {
                const formData = new FormData(form);
                
                // Submit to Netlify
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });
                
                if (response.ok) {
                    // Success
                    showMessage('success', 'Благодарим ви! Вашето запитване беше изпратено успешно. Ще се свържем с вас скоро.');
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                // Error
                console.error('Form submission error:', error);
                showMessage('error', 'Съжаляваме, възникна грешка. Моля, опитайте отново по-късно.');
            } finally {
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
    
    function showMessage(type, text) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        
        // Style the message
        message.style.cssText = `
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        `;
        
        if (type === 'success') {
            message.style.backgroundColor = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        } else {
            message.style.backgroundColor = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        
        // Insert message after form
        form.parentNode.insertBefore(message, form.nextSibling);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            message.remove();
        }, 10000);
    }
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});