// Netlify Identity - Single Source of Truth for Initialization
// This file handles ALL Identity initialization to prevent conflicts

(function() {
    'use strict';
    
    const IdentityManager = {
        initialized: false,
        initAttempts: 0,
        maxInitAttempts: 50, // 5 seconds max wait
        
        // Check if Identity widget is loaded
        isWidgetLoaded() {
            return typeof window.netlifyIdentity !== 'undefined' && window.netlifyIdentity;
        },
        
        // Wait for Identity widget to load
        waitForWidget(callback, attempt = 0) {
            if (this.isWidgetLoaded()) {
                callback();
                return;
            }
            
            if (attempt >= this.maxInitAttempts) {
                console.error('[Identity] Widget failed to load after', this.maxInitAttempts * 100, 'ms');
                return;
            }
            
            setTimeout(() => {
                this.waitForWidget(callback, attempt + 1);
            }, 100);
        },
        
        // Initialize Identity widget (only once)
        init() {
            if (this.initialized) {
                console.log('[Identity] Already initialized, skipping');
                return;
            }
            
            if (!this.isWidgetLoaded()) {
                console.log('[Identity] Widget not loaded yet, waiting...');
                this.waitForWidget(() => this.init());
                return;
            }
            
            try {
                // Check if already initialized by checking for _initialized flag
                if (window.netlifyIdentity._initialized) {
                    console.log('[Identity] Widget already initialized by another script');
                    this.initialized = true;
                    return;
                }
                
                // Initialize with API URL
                // Important: Initialize BEFORE checking for tokens
                window.netlifyIdentity.init({
                    APIUrl: window.location.origin + "/.netlify/identity"
                });
                
                this.initialized = true;
                console.log('[Identity] Successfully initialized');
                
                // Set up event listeners
                this.setupEventListeners();
                
                // After initialization, check for tokens in URL and process them
                // This handles confirmation_token, invite_token, etc.
                setTimeout(() => {
                    const hash = window.location.hash;
                    if (hash) {
                        if (hash.includes('confirmation_token=') || 
                            hash.includes('invite_token=') ||
                            hash.includes('recovery_token=')) {
                            console.log('[Identity] Token in URL after init, widget should process it');
                            // The widget will automatically show the appropriate form
                            // For invite_token: shows password setup form
                            // For confirmation_token: confirms email
                            // For recovery_token: shows password reset form
                        }
                    }
                }, 500);
                
            } catch (error) {
                console.error('[Identity] Initialization error:', error);
            }
        },
        
        // Set up event listeners (only once)
        setupEventListeners() {
            if (!this.isWidgetLoaded()) {
                return;
            }
            
            // Login event
            window.netlifyIdentity.on('login', (user) => {
                console.log('[Identity] User logged in:', user.email);
                // Close modal
                window.netlifyIdentity.close();
                // Redirect to admin (if not already there)
                if (!window.location.pathname.includes('/admin')) {
                    window.location.href = '/admin/';
                } else {
                    // Reload to show admin interface
                    window.location.reload();
                }
            });
            
            // Logout event
            window.netlifyIdentity.on('logout', () => {
                console.log('[Identity] User logged out');
                window.location.href = '/admin/';
            });
            
            // Error event - handle gracefully
            window.netlifyIdentity.on('error', (err) => {
                console.log('[Identity] Error event:', err);
                
                // "User not found" is normal for invalid/expired tokens - ignore it
                if (err && err.message && (
                    err.message.includes('not found') ||
                    err.message.includes('User not found') ||
                    err.message.includes('Invalid token')
                )) {
                    console.log('[Identity] Token invalid/expired - this is normal');
                    // Clear any invalid tokens from URL
                    if (window.location.hash && (
                        window.location.hash.includes('token=') ||
                        window.location.hash.includes('recovery_token=')
                    )) {
                        // Remove token from URL to prevent repeated errors
                        const url = new URL(window.location.href);
                        url.hash = '';
                        window.history.replaceState({}, '', url);
                    }
                    return; // Don't log as error
                }
                
                // "Invited users must specify a password" - this means user needs to accept invitation
                if (err && err.message && err.message.includes('Invited users must specify a password')) {
                    console.log('[Identity] User was invited - they need to accept invitation and set password');
                    console.log('[Identity] Check URL for invite_token - if present, widget should show password form');
                    // Check if we have invite_token in URL
                    const hash = window.location.hash;
                    if (hash && hash.includes('invite_token=')) {
                        console.log('[Identity] invite_token found - widget should show password setup form');
                        // Widget will handle this automatically
                    } else {
                        console.log('[Identity] No invite_token in URL - user needs invitation link');
                    }
                    // Don't show error to user - widget will handle it
                    return;
                }
                
                // Log other errors
                console.error('[Identity] Error:', err);
            });
            
            // Init event - check for tokens
            window.netlifyIdentity.on('init', (user) => {
                console.log('[Identity] Widget initialized, user:', user ? user.email : 'none');
                
                // Check for tokens in URL
                const hash = window.location.hash;
                if (hash) {
                    if (hash.includes('confirmation_token=')) {
                        console.log('[Identity] Confirmation token detected, widget will process it');
                        // Widget will automatically show confirmation form
                    } else if (
                        hash.includes('recovery_token=') ||
                        hash.includes('invite_token=') ||
                        hash.includes('token=')
                    ) {
                        console.log('[Identity] Token detected in URL, widget should handle it');
                        // Widget will automatically show appropriate form
                    }
                }
            });
            
            // Handle successful email confirmation
            window.netlifyIdentity.on('confirm', (user) => {
                console.log('[Identity] Email confirmed, user:', user.email);
                // User is now logged in after confirmation
                if (typeof adminApp !== 'undefined') {
                    adminApp.state.isAuthenticated = true;
                    adminApp.state.currentUser = user;
                    adminApp.showAdminInterface();
                    adminApp.showToast('Email confirmed! Welcome!', 'success');
                } else {
                    // Reload page to show admin interface
                    window.location.reload();
                }
            });
        },
        
        // Open login modal
        openLogin() {
            if (!this.isWidgetLoaded()) {
                console.error('[Identity] Cannot open login - widget not loaded');
                // Try to initialize
                this.init();
                // Wait and try again
                setTimeout(() => {
                    if (this.isWidgetLoaded()) {
                        window.netlifyIdentity.open('login');
                    }
                }, 500);
                return;
            }
            
            try {
                window.netlifyIdentity.open('login');
            } catch (error) {
                console.error('[Identity] Error opening login:', error);
            }
        },
        
        // Get current user
        getCurrentUser() {
            if (!this.isWidgetLoaded()) {
                return null;
            }
            return window.netlifyIdentity.currentUser();
        },
        
        // Logout
        logout() {
            if (!this.isWidgetLoaded()) {
                return;
            }
            window.netlifyIdentity.logout();
        }
    };
    
    // Auto-initialize when DOM is ready
    // But only on admin pages (not homepage)
    const isAdminPage = window.location.pathname.includes('/admin');
    
    if (isAdminPage) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                IdentityManager.init();
            });
        } else {
            // DOM already ready
            IdentityManager.init();
        }
    } else {
        // On homepage, just make IdentityManager available but don't auto-init
        // It will be used if needed for token handling
        console.log('[IdentityManager] Available on homepage, will init if needed');
    }
    
    // Make IdentityManager globally available
    window.IdentityManager = IdentityManager;
    
})();
