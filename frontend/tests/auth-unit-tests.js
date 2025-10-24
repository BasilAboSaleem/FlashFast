/**
 * FlashFast Frontend - Authentication Unit Tests
 * Comprehensive tests for authentication logic and JWT handling
 */

// Authentication Tests
function runAuthenticationTests() {
  const testRunner = new TestRunner();
  const { describe, it, expect, beforeEach } = testRunner;

  // Mock localStorage
  const mockLocalStorage = new MockLocalStorage();

  describe('AuthManager - JWT Token Handling', () => {
    let authManager;

    beforeEach(() => {
      // Reset localStorage mock
      mockLocalStorage.clear();
      // Replace global localStorage
      global.localStorage = mockLocalStorage;
      window.localStorage = mockLocalStorage;
      // Create new auth manager instance
      authManager = new AuthManager();
    });

    it('should store and retrieve JWT token', () => {
      const testToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      authManager.setToken(testToken);
      const retrievedToken = authManager.getToken();

      expect(retrievedToken).toBe(testToken);
    });

    it('should store and retrieve refresh token', () => {
      const testRefreshToken = 'refresh-token-123';

      authManager.setRefreshToken(testRefreshToken);
      const retrievedToken = authManager.getRefreshToken();

      expect(retrievedToken).toBe(testRefreshToken);
    });

    it('should store and retrieve user data', () => {
      const testUser = {
        id: '123',
        email: 'test@example.com',
        role: 'customer',
      };

      authManager.setUser(testUser);
      const retrievedUser = authManager.getCurrentUser();

      expect(retrievedUser).toEqual(testUser);
    });

    it('should decode JWT token payload correctly', () => {
      const testToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const payload = authManager.decodeToken(testToken);

      expect(payload.sub).toBe('1234567890');
      expect(payload.name).toBe('John Doe');
      expect(payload.iat).toBe(1516239022);
    });

    it('should handle invalid JWT token gracefully', () => {
      const invalidToken = 'invalid.token.here';

      const payload = authManager.decodeToken(invalidToken);

      expect(payload).toBe(null);
    });

    it('should detect expired tokens', () => {
      // Create token with past expiry
      const expiredPayload = {
        sub: '1234567890',
        name: 'John Doe',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(expiredPayload)) +
        '.signature';

      const isExpired = authManager.isTokenExpired(expiredToken);

      expect(isExpired).toBeTruthy();
    });

    it('should detect valid tokens', () => {
      // Create token with future expiry
      const validPayload = {
        sub: '1234567890',
        name: 'John Doe',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(validPayload)) +
        '.signature';

      const isExpired = authManager.isTokenExpired(validToken);

      expect(isExpired).toBeFalsy();
    });

    it('should detect tokens that need refresh', () => {
      // Create token that expires in 2 minutes (less than refresh threshold)
      const soonToExpirePayload = {
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes from now
      };
      const soonToExpireToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(soonToExpirePayload)) +
        '.signature';

      const shouldRefresh = authManager.shouldRefreshToken(soonToExpireToken);

      expect(shouldRefresh).toBeTruthy();
    });

    it('should clear all authentication data', () => {
      authManager.setToken('test-token');
      authManager.setRefreshToken('test-refresh-token');
      authManager.setUser({ id: 1, name: 'Test User' });

      authManager.clearAuthData();

      expect(authManager.getToken()).toBe(null);
      expect(authManager.getRefreshToken()).toBe(null);
      expect(authManager.getCurrentUser()).toBe(null);
    });

    it('should generate correct authorization header', () => {
      const validPayload = {
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(validPayload)) +
        '.signature';

      authManager.setToken(validToken);
      const authHeader = authManager.getAuthHeader();

      expect(authHeader).toEqual({ Authorization: `Bearer ${validToken}` });
    });

    it('should return null authorization header for expired token', () => {
      const expiredPayload = {
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(expiredPayload)) +
        '.signature';

      authManager.setToken(expiredToken);
      const authHeader = authManager.getAuthHeader();

      expect(authHeader).toBe(null);
    });
  });

  describe('AuthManager - User Authentication State', () => {
    let authManager;

    beforeEach(() => {
      mockLocalStorage.clear();
      global.localStorage = mockLocalStorage;
      window.localStorage = mockLocalStorage;
      authManager = new AuthManager();
    });

    it('should return false for isAuthenticated when no token exists', () => {
      const isAuth = authManager.isAuthenticated();
      expect(isAuth).toBeFalsy();
    });

    it('should return false for isAuthenticated when token is expired', () => {
      const expiredPayload = {
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(expiredPayload)) +
        '.signature';

      authManager.setToken(expiredToken);
      const isAuth = authManager.isAuthenticated();

      expect(isAuth).toBeFalsy();
    });

    it('should return true for isAuthenticated when token is valid', () => {
      const validPayload = {
        sub: '1234567890',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(validPayload)) +
        '.signature';

      authManager.setToken(validToken);
      const isAuth = authManager.isAuthenticated();

      expect(isAuth).toBeTruthy();
    });

    it('should extract user data from token when no stored user data', () => {
      const userPayload = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'customer',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(userPayload)) +
        '.signature';

      authManager.setToken(userToken);
      const user = authManager.getCurrentUser();

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('customer');
    });

    it('should prefer stored user data over token data', () => {
      const tokenPayload = {
        id: '123',
        email: 'token@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(tokenPayload)) +
        '.signature';

      const storedUser = {
        id: '123',
        email: 'stored@example.com',
        role: 'admin',
      };

      authManager.setToken(token);
      authManager.setUser(storedUser);

      const user = authManager.getCurrentUser();

      expect(user.email).toBe('stored@example.com');
      expect(user.role).toBe('admin');
    });

    it('should check user roles correctly', () => {
      const adminPayload = {
        id: '123',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const adminToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        btoa(JSON.stringify(adminPayload)) +
        '.signature';

      authManager.setToken(adminToken);

      expect(authManager.hasRole('admin')).toBeTruthy();
      expect(authManager.hasRole('customer')).toBeFalsy();
      expect(authManager.isAdmin()).toBeTruthy();
      expect(authManager.isCustomer()).toBeFalsy();
    });

    it('should handle role checks when no user is authenticated', () => {
      expect(authManager.hasRole('admin')).toBeFalsy();
      expect(authManager.hasRole('customer')).toBeFalsy();
      expect(authManager.isAdmin()).toBeFalsy();
      expect(authManager.isCustomer()).toBeFalsy();
    });
  });

  describe('AuthManager - Form Validation', () => {
    let authManager;

    beforeEach(() => {
      authManager = new AuthManager();
    });

    it('should validate email addresses correctly', () => {
      expect(authManager.validateEmail('test@example.com')).toBeTruthy();
      expect(
        authManager.validateEmail('user.name+tag@domain.co.uk')
      ).toBeTruthy();
      expect(authManager.validateEmail('user123@test-domain.com')).toBeTruthy();

      expect(authManager.validateEmail('invalid-email')).toBeFalsy();
      expect(authManager.validateEmail('test@')).toBeFalsy();
      expect(authManager.validateEmail('@example.com')).toBeFalsy();
      expect(authManager.validateEmail('test@.com')).toBeFalsy();
      expect(authManager.validateEmail('test.example.com')).toBeFalsy();
      expect(authManager.validateEmail('')).toBeFalsy();
      expect(authManager.validateEmail(null)).toBeFalsy();
    });

    it('should validate usernames correctly', () => {
      const validUsername = authManager.validateUsername('testuser123');
      expect(validUsername.isValid).toBeTruthy();
      expect(validUsername.feedback).toEqual([]);

      const validUsernameWithUnderscore =
        authManager.validateUsername('test_user');
      expect(validUsernameWithUnderscore.isValid).toBeTruthy();

      const shortUsername = authManager.validateUsername('ab');
      expect(shortUsername.isValid).toBeFalsy();
      expect(shortUsername.feedback).toContain(
        'Username must be at least 3 characters long'
      );

      const longUsername = authManager.validateUsername('a'.repeat(25));
      expect(longUsername.isValid).toBeFalsy();
      expect(longUsername.feedback).toContain(
        'Username must be less than 20 characters long'
      );

      const invalidUsername = authManager.validateUsername('test-user!');
      expect(invalidUsername.isValid).toBeFalsy();
      expect(invalidUsername.feedback).toContain(
        'Username can only contain letters, numbers, and underscores'
      );

      const emptyUsername = authManager.validateUsername('');
      expect(emptyUsername.isValid).toBeFalsy();
    });

    it('should validate password strength correctly', () => {
      const weakPassword = authManager.validatePassword('123');
      expect(weakPassword.strength).toBe('weak');
      expect(weakPassword.isValid).toBeFalsy();
      expect(weakPassword.score).toBeLessThan(2);

      const shortPassword = authManager.validatePassword('Pass1');
      expect(shortPassword.isValid).toBeFalsy();
      expect(shortPassword.feedback).toContain(
        'Password must be at least 6 characters long'
      );

      const mediumPassword = authManager.validatePassword('password123');
      expect(mediumPassword.strength).toBe('medium');
      expect(mediumPassword.isValid).toBeTruthy();
      expect(mediumPassword.score).toBeGreaterThan(1);

      const strongPassword = authManager.validatePassword('Password123!');
      expect(strongPassword.strength).toBe('strong');
      expect(strongPassword.isValid).toBeTruthy();
      expect(strongPassword.score).toBeGreaterThan(3);

      const emptyPassword = authManager.validatePassword('');
      expect(emptyPassword.isValid).toBeFalsy();
    });

    it('should provide helpful password feedback', () => {
      const noLowerCase = authManager.validatePassword('PASSWORD123!');
      expect(noLowerCase.feedback).toContain('Add lowercase letters');

      const noUpperCase = authManager.validatePassword('password123!');
      expect(noUpperCase.feedback).toContain('Add uppercase letters');

      const noNumbers = authManager.validatePassword('Password!');
      expect(noNumbers.feedback).toContain('Add numbers');

      const noSpecialChars = authManager.validatePassword('Password123');
      expect(noSpecialChars.feedback).toContain('Add special characters');
    });
  });

  describe('AuthManager - Error Handling', () => {
    let authManager;

    beforeEach(() => {
      authManager = new AuthManager();
    });

    it('should handle 401 authentication errors correctly', () => {
      const authError = { status: 401, message: 'Unauthorized' };
      const result = authManager.handleAuthError(authError);

      expect(result.shouldRedirect).toBeTruthy();
      expect(result.redirectTo).toBe('login');
      expect(result.message).toContain('session has expired');
    });

    it('should handle 403 authorization errors correctly', () => {
      const authError = { status: 403, message: 'Forbidden' };
      const result = authManager.handleAuthError(authError);

      expect(result.shouldRedirect).toBeFalsy();
      expect(result.message).toContain('do not have permission');
    });

    it('should handle other errors correctly', () => {
      const genericError = { status: 500, message: 'Server Error' };
      const result = authManager.handleAuthError(genericError);

      expect(result.shouldRedirect).toBeFalsy();
      expect(result.message).toBe('Server Error');
    });

    it('should handle errors with getUserMessage method', () => {
      const errorWithUserMessage = {
        status: 400,
        message: 'Bad Request',
        getUserMessage: () => 'User-friendly error message',
      };
      const result = authManager.handleAuthError(errorWithUserMessage);

      expect(result.message).toBe('User-friendly error message');
    });
  });

  return testRunner;
}

// Form Validation Tests
function runFormValidationTests() {
  const testRunner = new TestRunner();
  const { describe, it, expect } = testRunner;

  describe('Login Form Validation', () => {
    it('should validate email field correctly', () => {
      // Mock form validation logic
      const validateEmail = (email) => {
        if (!email.trim())
          return { isValid: false, message: 'Email is required' };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return {
            isValid: false,
            message: 'Please enter a valid email address',
          };
        }
        return { isValid: true };
      };

      expect(validateEmail('').isValid).toBeFalsy();
      expect(validateEmail('invalid-email').isValid).toBeFalsy();
      expect(validateEmail('test@example.com').isValid).toBeTruthy();
    });

    it('should validate password field correctly', () => {
      const validatePassword = (password) => {
        if (!password.trim())
          return { isValid: false, message: 'Password is required' };
        if (password.length < 6) {
          return {
            isValid: false,
            message: 'Password must be at least 6 characters',
          };
        }
        return { isValid: true };
      };

      expect(validatePassword('').isValid).toBeFalsy();
      expect(validatePassword('123').isValid).toBeFalsy();
      expect(validatePassword('password123').isValid).toBeTruthy();
    });
  });

  describe('Register Form Validation', () => {
    it('should validate all required fields', () => {
      const validateRegisterForm = (formData) => {
        const errors = [];

        if (!formData.username || formData.username.length < 3) {
          errors.push('Username must be at least 3 characters');
        }

        if (
          !formData.email ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          errors.push('Valid email is required');
        }

        if (!formData.password || formData.password.length < 6) {
          errors.push('Password must be at least 6 characters');
        }

        if (!formData.role) {
          errors.push('Role selection is required');
        }

        return { isValid: errors.length === 0, errors };
      };

      const invalidForm = {
        username: 'ab',
        email: 'invalid',
        password: '123',
        role: '',
      };

      const invalidResult = validateRegisterForm(invalidForm);
      expect(invalidResult.isValid).toBeFalsy();
      expect(invalidResult.errors.length).toBeGreaterThan(0);

      const validForm = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
      };

      const validResult = validateRegisterForm(validForm);
      expect(validResult.isValid).toBeTruthy();
      expect(validResult.errors.length).toBe(0);
    });
  });

  return testRunner;
}

// Export test functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAuthenticationTests, runFormValidationTests };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.runAuthenticationTests = runAuthenticationTests;
  window.runFormValidationTests = runFormValidationTests;
}
