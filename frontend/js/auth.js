/**
 * FlashFast Frontend - Authentication Logic and JWT Handling
 * Provides high-level authentication functions and JWT token management
 */

class AuthManager {
  constructor() {
    this.tokenKey = 'jwt_token';
    this.refreshTokenKey = 'refresh_token';
    this.userKey = 'user_data';
    this.tokenRefreshInterval = null;
    this.refreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry

    // Initialize authentication state
    this.init();
  }

  /**
   * Initialize authentication manager
   */
  init() {
    this.checkTokenValidity();
    this.setupTokenRefresh();
  }

  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result
   */
  async login(credentials) {
    try {
      const response = await window.apiClient.login(credentials);

      if (response.token) {
        this.setToken(response.token);

        // Store user data if provided
        if (response.user) {
          this.setUser(response.user);
        }

        // Store refresh token if provided
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

        // Setup automatic token refresh
        this.setupTokenRefresh();

        return {
          success: true,
          user: response.user,
          message: 'Login successful',
        };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      return {
        success: false,
        error: error.getUserMessage ? error.getUserMessage() : error.message,
        status: error.status,
      };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await window.apiClient.register(userData);

      if (response.token) {
        this.setToken(response.token);

        // Store user data if provided
        if (response.user) {
          this.setUser(response.user);
        }

        // Store refresh token if provided
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

        // Setup automatic token refresh
        this.setupTokenRefresh();

        return {
          success: true,
          user: response.user,
          message: 'Registration successful',
        };
      } else {
        return {
          success: true,
          message: 'Registration successful. Please log in.',
          requiresLogin: true,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.getUserMessage ? error.getUserMessage() : error.message,
        status: error.status,
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      // Call logout endpoint if token exists
      if (this.getToken()) {
        await window.apiClient.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local data
      this.clearAuthData();
      this.clearTokenRefresh();

      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

  /**
   * Get current user data
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(this.userKey);
      }
    }

    // Try to extract user from token
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload) {
        return {
          id: payload.id || payload.userId,
          email: payload.email,
          username: payload.username,
          role: payload.role,
        };
      }
    }

    return null;
  }

  /**
   * Get JWT token from storage
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set JWT token in storage
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get refresh token from storage
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Set refresh token in storage
   * @param {string} refreshToken - Refresh token
   */
  setRefreshToken(refreshToken) {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  /**
   * Set user data in storage
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Decode JWT token payload
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload
   */
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} Whether token is expired
   */
  isTokenExpired(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp <= currentTime;
  }

  /**
   * Check if token needs refresh
   * @param {string} token - JWT token
   * @returns {boolean} Whether token needs refresh
   */
  shouldRefreshToken(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = (payload.exp - currentTime) * 1000;

    return timeUntilExpiry <= this.refreshThreshold;
  }

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} Success status
   */
  async refreshAuthToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await window.apiClient.refreshToken();

      if (response.token) {
        this.setToken(response.token);

        // Update user data if provided
        if (response.user) {
          this.setUser(response.user);
        }

        // Update refresh token if provided
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);

      // If refresh fails, clear auth data and redirect to login
      this.clearAuthData();
      if (window.flashFastApp) {
        window.flashFastApp.navigateTo('login', true);
      }

      return false;
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    this.clearTokenRefresh();

    const token = this.getToken();
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = Math.max(
      (payload.exp - currentTime) * 1000 - this.refreshThreshold,
      60000 // Minimum 1 minute
    );

    this.tokenRefreshInterval = setTimeout(async () => {
      const success = await this.refreshAuthToken();
      if (success) {
        this.setupTokenRefresh(); // Setup next refresh
      }
    }, timeUntilRefresh);
  }

  /**
   * Clear token refresh interval
   */
  clearTokenRefresh() {
    if (this.tokenRefreshInterval) {
      clearTimeout(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  /**
   * Check token validity on app start
   */
  checkTokenValidity() {
    const token = this.getToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      console.log('Token expired, clearing auth data');
      this.clearAuthData();
    } else if (this.shouldRefreshToken(token)) {
      console.log('Token needs refresh');
      this.refreshAuthToken();
    }
  }

  /**
   * Get authorization header for API requests
   * @returns {Object|null} Authorization header
   */
  getAuthHeader() {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return null;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  /**
   * Check if user is admin
   * @returns {boolean} Whether user is admin
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is customer
   * @returns {boolean} Whether user is customer
   */
  isCustomer() {
    return this.hasRole('customer');
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    const minLength = 6;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [
      password.length >= minLength,
      hasLowerCase,
      hasUpperCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;

    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    const feedback = [];
    if (password.length < minLength) {
      feedback.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasLowerCase) {
      feedback.push('Add lowercase letters');
    }
    if (!hasUpperCase) {
      feedback.push('Add uppercase letters');
    }
    if (!hasNumbers) {
      feedback.push('Add numbers');
    }
    if (!hasSpecialChar) {
      feedback.push('Add special characters');
    }

    return {
      isValid: score >= 2,
      strength,
      score,
      feedback,
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {Object} Validation result
   */
  validateUsername(username) {
    const minLength = 3;
    const maxLength = 20;
    const validFormat = /^[a-zA-Z0-9_]+$/.test(username);

    const feedback = [];
    if (username.length < minLength) {
      feedback.push(`Username must be at least ${minLength} characters long`);
    }
    if (username.length > maxLength) {
      feedback.push(`Username must be less than ${maxLength} characters long`);
    }
    if (!validFormat) {
      feedback.push(
        'Username can only contain letters, numbers, and underscores'
      );
    }

    return {
      isValid:
        username.length >= minLength &&
        username.length <= maxLength &&
        validFormat,
      feedback,
    };
  }

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   * @returns {Object} Error handling result
   */
  handleAuthError(error) {
    if (error.status === 401) {
      this.clearAuthData();
      return {
        shouldRedirect: true,
        redirectTo: 'login',
        message: 'Your session has expired. Please log in again.',
      };
    }

    if (error.status === 403) {
      return {
        shouldRedirect: false,
        message: 'You do not have permission to perform this action.',
      };
    }

    return {
      shouldRedirect: false,
      message: error.getUserMessage ? error.getUserMessage() : error.message,
    };
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, authManager };
}

// Make available globally
window.AuthManager = AuthManager;
window.authManager = authManager;
