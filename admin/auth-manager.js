// Google OAuth Authentication Manager
// Handles login, logout, and session verification for the admin panel

(function() {
  'use strict';

  const AuthManager = {
    user: null,
    initialized: false,
    onAuthChange: null, // Callback for auth state changes

    // Initialize and check current session
    async init() {
      if (this.initialized) {
        console.log('[AuthManager] Already initialized');
        return;
      }
      
      console.log('[AuthManager] Initializing...');
      this.initialized = true;

      // Check for error in URL (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      
      if (error) {
        console.error('[AuthManager] OAuth error:', error);
        this.showError(this.getErrorMessage(error));
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Verify current session
      await this.verifySession();
    },

    // Get user-friendly error message
    getErrorMessage(error) {
      const messages = {
        'access_denied': 'Access denied. Your email is not authorized to access the admin panel.',
        'invalid_state': 'Security validation failed. Please try logging in again.',
        'token_exchange_failed': 'Authentication failed. Please try again.',
        'user_info_failed': 'Could not retrieve your information from Google. Please try again.',
        'server_error': 'Server error occurred. Please try again later.',
        'missing_params': 'Invalid authentication response. Please try again.'
      };
      return messages[error] || 'An unknown error occurred. Please try again.';
    },

    // Verify current session with server
    async verifySession() {
      try {
        console.log('[AuthManager] Verifying session...');
        
        const response = await fetch('/.netlify/functions/auth-verify', {
          method: 'GET',
          credentials: 'include' // Important: include cookies
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
          console.log('[AuthManager] Session valid, user:', data.user.email);
          this.user = data.user;
          this.notifyAuthChange(true, data.user);
          return true;
        } else {
          console.log('[AuthManager] No valid session');
          this.user = null;
          this.notifyAuthChange(false, null);
          return false;
        }
      } catch (error) {
        console.error('[AuthManager] Session verification error:', error);
        this.user = null;
        this.notifyAuthChange(false, null);
        return false;
      }
    },

    // Initiate Google OAuth login
    login() {
      console.log('[AuthManager] Initiating Google OAuth login...');
      window.location.href = '/.netlify/functions/auth-login';
    },

    // Logout and clear session
    logout() {
      console.log('[AuthManager] Logging out...');
      window.location.href = '/.netlify/functions/auth-logout';
    },

    // Get current user
    getCurrentUser() {
      return this.user;
    },

    // Check if authenticated
    isAuthenticated() {
      return this.user !== null;
    },

    // Set callback for auth state changes
    setOnAuthChange(callback) {
      this.onAuthChange = callback;
      // If already authenticated, notify immediately
      if (this.user) {
        console.log('[AuthManager] Already authenticated, notifying callback immediately');
        callback(true, this.user);
      }
    },

    // Notify about auth state change
    notifyAuthChange(authenticated, user) {
      if (typeof this.onAuthChange === 'function') {
        this.onAuthChange(authenticated, user);
      }
    },

    // Show error message (can be overridden by adminApp)
    showError(message) {
      const errorElement = document.getElementById('authError');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      } else {
        console.error('[AuthManager] Error:', message);
        alert(message);
      }
    },

    // Hide error message
    hideError() {
      const errorElement = document.getElementById('authError');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  };

  // Make AuthManager globally available
  window.AuthManager = AuthManager;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AuthManager.init();
    });
  } else {
    // DOM already ready
    AuthManager.init();
  }

})();
