/**
 * FlashFast Frontend - Main Application Controller
 * Handles SPA routing, state management, and core application logic
 */

class FlashFastApp {
  constructor() {
    this.state = {
      user: null,
      products: [],
      flashSaleEvents: [],
      orders: [],
      currentPage: 'login',
      loading: false,
      error: null,
      isAuthenticated: false,
    };

    this.routes = {
      login: this.showLoginPage.bind(this),
      register: this.showRegisterPage.bind(this),
      dashboard: this.showDashboardPage.bind(this),
      products: this.showProductsPage.bind(this),
      flashsales: this.showFlashSalesPage.bind(this),
      orders: this.showOrdersPage.bind(this),
      admin: this.showAdminPage.bind(this),
    };

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.checkAuthentication();
    this.setupEventListeners();
    this.handleInitialRoute();
  }

  /**
   * Check if user is authenticated on app start
   */
  checkAuthentication() {
    if (window.authManager && window.authManager.isAuthenticated()) {
      const user = window.authManager.getCurrentUser();
      if (user) {
        this.setState({
          user: user,
          isAuthenticated: true,
        });
      }
    }
  }

  /**
   * Set up event listeners for routing and global events
   */
  setupEventListeners() {
    // Handle hash changes for routing
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));

    // Handle browser back/forward buttons
    window.addEventListener('popstate', this.handleRouteChange.bind(this));

    // Handle form submissions globally
    document.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Handle clicks globally for navigation
    document.addEventListener('click', this.handleClick.bind(this));

    // Handle window resize for responsive updates
    window.addEventListener('resize', this.handleResize.bind(this));

    // Handle input events for real-time validation
    document.addEventListener('input', this.handleInput.bind(this));

    // Handle focus events for form fields
    document.addEventListener('focus', this.handleFocus.bind(this), true);
  }

  /**
   * Handle initial route when app loads
   */
  handleInitialRoute() {
    const hash = window.location.hash.slice(1) || 'login';
    this.navigateTo(hash);
  }

  /**
   * Handle route changes
   */
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'login';
    this.navigateTo(hash);
  }

  /**
   * Navigate to a specific route
   * @param {string} route - The route to navigate to
   * @param {boolean} updateHash - Whether to update the URL hash
   */
  navigateTo(route, updateHash = false) {
    // Check authentication for protected routes
    const protectedRoutes = [
      'dashboard',
      'products',
      'flashsales',
      'orders',
      'admin',
    ];
    const adminRoutes = ['admin'];

    if (protectedRoutes.includes(route) && !this.state.isAuthenticated) {
      this.navigateTo('login', true);
      return;
    }

    if (
      adminRoutes.includes(route) &&
      (!this.state.user || this.state.user.role !== 'admin')
    ) {
      this.showError('Access denied. Admin privileges required.');
      this.navigateTo('dashboard', true);
      return;
    }

    // Update URL hash if needed
    if (updateHash) {
      window.location.hash = route;
    }

    // Update current page state
    this.setState({ currentPage: route });

    // Execute route handler
    if (this.routes[route]) {
      this.routes[route]();
    } else {
      this.show404Page();
    }
  }

  /**
   * Update application state
   * @param {Object} newState - State updates to apply
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * Get current application state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Show loading state
   * @param {boolean} loading - Whether to show loading
   */
  setLoading(loading) {
    this.setState({ loading });
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.setState({ error: message });
    this.displayError(message);
  }

  /**
   * Show success message
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    this.displaySuccess(message);
  }

  /**
   * Clear error state
   */
  clearError() {
    this.setState({ error: null });
    this.hideError();
  }

  /**
   * Handle global form submissions
   * @param {Event} event - Form submit event
   */
  handleFormSubmit(event) {
    const form = event.target;

    // Handle login form
    if (form.id === 'loginForm') {
      event.preventDefault();
      if (this.validateLoginForm(form)) {
        this.handleLogin(form);
      }
    }

    // Handle register form
    if (form.id === 'registerForm') {
      event.preventDefault();
      if (this.validateRegisterForm(form)) {
        this.handleRegister(form);
      }
    }

    // Add other form handlers as needed
  }

  /**
   * Handle global click events
   * @param {Event} event - Click event
   */
  handleClick(event) {
    const target = event.target;

    // Handle navigation links
    if (target.matches('[data-route]')) {
      event.preventDefault();
      const route = target.getAttribute('data-route');
      this.navigateTo(route, true);
    }

    // Handle logout
    if (target.matches('[data-action="logout"]')) {
      event.preventDefault();
      this.handleLogout();
    }

    // Handle error dismissal
    if (target.matches('#error-container .alert .btn-close')) {
      event.preventDefault();
      this.clearError();
    }

    // Handle success dismissal
    if (target.matches('#success-container .alert .btn-close')) {
      event.preventDefault();
      this.hideSuccess();
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    // Update mobile menu state or other responsive elements
    this.updateResponsiveElements();
  }

  /**
   * Handle input events for real-time validation
   * @param {Event} event - Input event
   */
  handleInput(event) {
    const target = event.target;

    // Handle password strength checking
    if (target.id === 'register-password') {
      this.updatePasswordStrength(target);
    }

    // Clear validation errors on input
    if (target.classList.contains('is-invalid')) {
      this.clearFieldValidation(target);
    }
  }

  /**
   * Handle focus events for form fields
   * @param {Event} event - Focus event
   */
  handleFocus(event) {
    const target = event.target;

    // Clear validation state when field gets focus
    if (target.matches('.form-control, .form-select')) {
      this.clearFieldValidation(target);
    }
  }

  /**
   * Update password strength indicator
   * @param {HTMLElement} passwordField - Password input field
   */
  updatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const strengthContainer =
      passwordField.parentNode.querySelector('.password-strength');
    const strengthBar = strengthContainer?.querySelector(
      '.password-strength-bar'
    );
    const strengthText = passwordField.parentNode.querySelector(
      '.password-strength-text'
    );

    if (!strengthContainer || !strengthBar || !strengthText) return;

    const strength = this.getPasswordStrength(password);

    // Update strength indicator
    strengthContainer.className = `password-strength password-strength-${strength.strength}`;

    // Update strength text
    if (password.length === 0) {
      strengthText.textContent = '';
    } else {
      const strengthLabels = {
        weak: 'Weak password',
        medium: 'Medium strength',
        strong: 'Strong password',
      };
      strengthText.textContent = strengthLabels[strength.strength];
      strengthText.className = `password-strength-text text-${
        strength.strength === 'weak'
          ? 'danger'
          : strength.strength === 'medium'
          ? 'warning'
          : 'success'
      }`;
    }
  }

  /**
   * Handle user login
   * @param {HTMLFormElement} form - Login form element
   */
  async handleLogin(form) {
    const formData = new FormData(form);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      this.setLoading(true);
      this.clearError();

      const result = await window.authManager.login(credentials);

      if (result.success) {
        // Update user state
        this.setState({
          user: result.user,
          isAuthenticated: true,
        });
        this.navigateTo('dashboard', true);
        this.showSuccess('Login successful! Welcome back.');
      } else {
        this.showError(result.error || 'Login failed');
      }
    } catch (error) {
      this.showError(
        error.getUserMessage
          ? error.getUserMessage()
          : error.message || 'Login failed'
      );
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle user registration
   * @param {HTMLFormElement} form - Register form element
   */
  async handleRegister(form) {
    const formData = new FormData(form);
    const userData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    };

    try {
      this.setLoading(true);
      this.clearError();

      const result = await window.authManager.register(userData);

      if (result.success) {
        if (result.requiresLogin) {
          // Registration successful, redirect to login
          this.navigateTo('login', true);
          this.showSuccess('Registration successful! Please log in.');
        } else {
          // Auto-login after registration
          this.setState({
            user: result.user,
            isAuthenticated: true,
          });
          this.navigateTo('dashboard', true);
          this.showSuccess('Registration successful! Welcome to FlashFast.');
        }
      } else {
        this.showError(result.error || 'Registration failed');
      }
    } catch (error) {
      this.showError(
        error.getUserMessage
          ? error.getUserMessage()
          : error.message || 'Registration failed'
      );
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle user logout
   */
  async handleLogout() {
    try {
      await window.authManager.logout();
      this.setState({
        user: null,
        isAuthenticated: false,
        products: [],
        flashSaleEvents: [],
        orders: [],
      });
      this.navigateTo('login', true);
      this.showSuccess('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      this.setState({
        user: null,
        isAuthenticated: false,
        products: [],
        flashSaleEvents: [],
        orders: [],
      });
      this.navigateTo('login', true);
    }
  }

  /**
   * Validate login form
   * @param {HTMLFormElement} form - Login form element
   * @returns {boolean} Whether form is valid
   */
  validateLoginForm(form) {
    const email = form.querySelector('#login-email');
    const password = form.querySelector('#login-password');
    let isValid = true;

    // Clear previous validation states
    this.clearFieldValidation(email);
    this.clearFieldValidation(password);

    // Validate email
    if (!email.value.trim()) {
      this.showFieldError(email, 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email.value)) {
      this.showFieldError(email, 'Please enter a valid email address');
      isValid = false;
    } else {
      this.showFieldSuccess(email);
    }

    // Validate password
    if (!password.value.trim()) {
      this.showFieldError(password, 'Password is required');
      isValid = false;
    } else if (password.value.length < 6) {
      this.showFieldError(password, 'Password must be at least 6 characters');
      isValid = false;
    } else {
      this.showFieldSuccess(password);
    }

    return isValid;
  }

  /**
   * Validate register form
   * @param {HTMLFormElement} form - Register form element
   * @returns {boolean} Whether form is valid
   */
  validateRegisterForm(form) {
    const username = form.querySelector('#register-username');
    const email = form.querySelector('#register-email');
    const password = form.querySelector('#register-password');
    const role = form.querySelector('input[name="role"]:checked');
    let isValid = true;

    // Clear previous validation states
    this.clearFieldValidation(username);
    this.clearFieldValidation(email);
    this.clearFieldValidation(password);

    // Validate username
    if (!username.value.trim()) {
      this.showFieldError(username, 'Username is required');
      isValid = false;
    } else {
      const usernameValidation = window.authManager
        ? window.authManager.validateUsername(username.value)
        : {
            isValid: username.value.length >= 3 && username.value.length <= 20,
            feedback: [],
          };

      if (!usernameValidation.isValid) {
        this.showFieldError(
          username,
          usernameValidation.feedback[0] || 'Invalid username'
        );
        isValid = false;
      } else {
        this.showFieldSuccess(username);
      }
    }

    // Validate email
    if (!email.value.trim()) {
      this.showFieldError(email, 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email.value)) {
      this.showFieldError(email, 'Please enter a valid email address');
      isValid = false;
    } else {
      this.showFieldSuccess(email);
    }

    // Validate password
    if (!password.value.trim()) {
      this.showFieldError(password, 'Password is required');
      isValid = false;
    } else if (password.value.length < 6) {
      this.showFieldError(password, 'Password must be at least 6 characters');
      isValid = false;
    } else {
      const strength = this.getPasswordStrength(password.value);
      if (strength.score < 2) {
        this.showFieldError(
          password,
          'Password is too weak. Please use a stronger password.'
        );
        isValid = false;
      } else {
        this.showFieldSuccess(password);
      }
    }

    // Validate role selection
    if (!role) {
      const roleContainer = form.querySelector('.role-selection');
      this.showFieldError(roleContainer, 'Please select an account type');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Check if email is valid
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    return window.authManager ? window.authManager.validateEmail(email) : false;
  }

  /**
   * Get password strength
   * @param {string} password - Password to check
   * @returns {Object} Password strength info
   */
  getPasswordStrength(password) {
    if (window.authManager) {
      const validation = window.authManager.validatePassword(password);
      return {
        score: validation.score,
        strength: validation.strength,
        feedback: validation.feedback,
      };
    }

    // Fallback implementation
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;

    let strength = 'weak';
    if (score >= 3) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return { score, strength, feedback: [] };
  }

  /**
   * Show field error
   * @param {HTMLElement} field - Form field element
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');

    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = message;
    }
  }

  /**
   * Show field success
   * @param {HTMLElement} field - Form field element
   */
  showFieldSuccess(field) {
    field.classList.add('is-valid');
    field.classList.remove('is-invalid');

    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.textContent = '';
    }
  }

  /**
   * Clear field validation
   * @param {HTMLElement} field - Form field element
   */
  clearFieldValidation(field) {
    if (field) {
      field.classList.remove('is-valid', 'is-invalid');
      const feedback = field.parentNode.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.textContent = '';
      }
    }
  }

  /**
   * Route handlers
   */
  showLoginPage() {
    this.renderPage('login', this.getLoginPageHTML());
  }

  showRegisterPage() {
    this.renderPage('register', this.getRegisterPageHTML());
  }

  showDashboardPage() {
    this.renderPage('dashboard', this.getDashboardPageHTML());
  }

  showProductsPage() {
    this.renderPage('products', this.getProductsPageHTML());
  }

  showFlashSalesPage() {
    this.renderPage('flashsales', this.getFlashSalesPageHTML());
  }

  showOrdersPage() {
    this.renderPage('orders', this.getOrdersPageHTML());
  }

  showAdminPage() {
    this.renderPage('admin', this.getAdminPageHTML());
  }

  show404Page() {
    this.renderPage('404', this.get404PageHTML());
  }

  /**
   * Render a page with given content
   * @param {string} pageId - Page identifier
   * @param {string} content - HTML content to render
   */
  renderPage(pageId, content) {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = content;
      this.updateNavigation();
    }
  }

  /**
   * Update navigation based on current state
   */
  updateNavigation() {
    // This will be implemented when navigation component is ready
    console.log('Updating navigation for page:', this.state.currentPage);
  }

  /**
   * Update responsive elements
   */
  updateResponsiveElements() {
    // Handle mobile menu toggle, responsive layouts, etc.
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-view', isMobile);
  }

  /**
   * Display error message in UI
   * @param {string} message - Error message
   */
  displayError(message) {
    let errorContainer = document.getElementById('error-container');

    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.id = 'error-container';
      errorContainer.className = 'error-container';
      document.body.insertBefore(errorContainer, document.body.firstChild);
    }

    errorContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible">
        ${this.escapeHtml(message)}
        <button type="button" class="btn-close" aria-label="Close">×</button>
      </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  /**
   * Display success message in UI
   * @param {string} message - Success message
   */
  displaySuccess(message) {
    let successContainer = document.getElementById('success-container');

    if (!successContainer) {
      successContainer = document.createElement('div');
      successContainer.id = 'success-container';
      successContainer.className = 'success-container';
      document.body.insertBefore(successContainer, document.body.firstChild);
    }

    successContainer.innerHTML = `
      <div class="alert alert-success alert-dismissible">
        ${this.escapeHtml(message)}
        <button type="button" class="btn-close" aria-label="Close">×</button>
      </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideSuccess();
    }, 5000);
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }

  /**
   * Hide success message
   */
  hideSuccess() {
    const successContainer = document.getElementById('success-container');
    if (successContainer) {
      successContainer.innerHTML = '';
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Main render method
   */
  render() {
    // Update loading state in UI
    document.body.classList.toggle('loading', this.state.loading);

    // Update authentication state in UI
    document.body.classList.toggle('authenticated', this.state.isAuthenticated);
    document.body.classList.toggle(
      'admin',
      this.state.user && this.state.user.role === 'admin'
    );
  }

  /**
   * Page HTML templates (basic placeholders for now)
   */
  getLoginPageHTML() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h3>Welcome Back</h3>
            <p class="subtitle">Sign in to your FlashFast account</p>
          </div>
          <div class="auth-body">
            <form id="loginForm" class="auth-form" novalidate>
              <div class="form-group">
                <label for="login-email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="login-email" 
                  name="email" 
                  placeholder="Enter your email"
                  required
                  autocomplete="email"
                >
                <div class="invalid-feedback"></div>
              </div>
              <div class="form-group">
                <label for="login-password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="login-password" 
                  name="password" 
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                >
                <div class="invalid-feedback"></div>
              </div>
              <div class="remember-me">
                <input type="checkbox" id="remember-me" name="remember">
                <label for="remember-me">Remember me</label>
              </div>
              <button type="submit" class="btn btn-primary auth-submit-btn" ${
                this.state.loading ? 'disabled' : ''
              }>
                ${
                  this.state.loading
                    ? '<span class="spinner spinner-sm"></span> Signing in...'
                    : 'Sign In'
                }
              </button>
            </form>
          </div>
          <div class="auth-footer">
            <p>Don't have an account? <a href="#" data-route="register">Create one here</a></p>
          </div>
        </div>
      </div>
    `;
  }

  getRegisterPageHTML() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h3>Join FlashFast</h3>
            <p class="subtitle">Create your account to start shopping</p>
          </div>
          <div class="auth-body">
            <form id="registerForm" class="auth-form" novalidate>
              <div class="form-group">
                <label for="register-username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="register-username" 
                  name="username" 
                  placeholder="Choose a username"
                  required
                  autocomplete="username"
                  minlength="3"
                  maxlength="20"
                >
                <div class="invalid-feedback"></div>
              </div>
              <div class="form-group">
                <label for="register-email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="register-email" 
                  name="email" 
                  placeholder="Enter your email"
                  required
                  autocomplete="email"
                >
                <div class="invalid-feedback"></div>
              </div>
              <div class="form-group">
                <label for="register-password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="register-password" 
                  name="password" 
                  placeholder="Create a strong password"
                  required
                  autocomplete="new-password"
                  minlength="6"
                >
                <div class="password-strength">
                  <div class="password-strength-bar"></div>
                </div>
                <div class="password-strength-text"></div>
                <div class="invalid-feedback"></div>
              </div>
              <div class="form-group">
                <label for="register-role" class="form-label">Account Type</label>
                <div class="role-selection">
                  <input type="radio" id="role-customer" name="role" value="customer" class="role-option" required>
                  <label for="role-customer">Customer</label>
                  <input type="radio" id="role-admin" name="role" value="admin" class="role-option">
                  <label for="role-admin">Admin</label>
                </div>
                <div class="invalid-feedback"></div>
              </div>
              <button type="submit" class="btn btn-primary auth-submit-btn" ${
                this.state.loading ? 'disabled' : ''
              }>
                ${
                  this.state.loading
                    ? '<span class="spinner spinner-sm"></span> Creating Account...'
                    : 'Create Account'
                }
              </button>
            </form>
          </div>
          <div class="auth-footer">
            <p>Already have an account? <a href="#" data-route="login">Sign in here</a></p>
          </div>
        </div>
      </div>
    `;
  }

  getDashboardPageHTML() {
    return `
      <div class="container">
        <h1>Dashboard</h1>
        <p>Welcome to FlashFast, ${
          this.state.user ? this.state.user.username : 'User'
        }!</p>
        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Products</h5>
                <p class="card-text">Browse available products</p>
                <a href="#" data-route="products" class="btn btn-primary">View Products</a>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Flash Sales</h5>
                <p class="card-text">Check active flash sales</p>
                <a href="#" data-route="flashsales" class="btn btn-primary">View Flash Sales</a>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">My Orders</h5>
                <p class="card-text">View your order history</p>
                <a href="#" data-route="orders" class="btn btn-primary">View Orders</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getProductsPageHTML() {
    return `
      <div class="container">
        <h1>Products</h1>
        <p>Product listing will be implemented here.</p>
      </div>
    `;
  }

  getFlashSalesPageHTML() {
    return `
      <div class="container">
        <h1>Flash Sales</h1>
        <p>Flash sales listing will be implemented here.</p>
      </div>
    `;
  }

  getOrdersPageHTML() {
    return `
      <div class="container">
        <h1>My Orders</h1>
        <p>Order history will be implemented here.</p>
      </div>
    `;
  }

  getAdminPageHTML() {
    return `
      <div class="container">
        <h1>Admin Panel</h1>
        <p>Admin functionality will be implemented here.</p>
      </div>
    `;
  }

  get404PageHTML() {
    return `
      <div class="container text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="#" data-route="dashboard" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
  }
}

// Utility functions for DOM manipulation and event handling
const Utils = {
  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  getElementById(id) {
    return document.getElementById(id);
  },

  /**
   * Get elements by class name
   * @param {string} className - Class name
   * @returns {HTMLCollection} Collection of elements
   */
  getElementsByClassName(className) {
    return document.getElementsByClassName(className);
  },

  /**
   * Query selector
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Element or null
   */
  querySelector(selector) {
    return document.querySelector(selector);
  },

  /**
   * Query selector all
   * @param {string} selector - CSS selector
   * @returns {NodeList} List of elements
   */
  querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * Add event listener to element
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  addEventListener(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.addEventListener(event, handler);
    }
  },

  /**
   * Remove event listener from element
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  removeEventListener(element, event, handler) {
    if (element && typeof handler === 'function') {
      element.removeEventListener(event, handler);
    }
  },

  /**
   * Create element with attributes
   * @param {string} tagName - Tag name
   * @param {Object} attributes - Element attributes
   * @param {string} textContent - Text content
   * @returns {HTMLElement} Created element
   */
  createElement(tagName, attributes = {}, textContent = '') {
    const element = document.createElement(tagName);

    Object.keys(attributes).forEach((key) => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'dataset') {
        Object.keys(attributes[key]).forEach((dataKey) => {
          element.dataset[dataKey] = attributes[key][dataKey];
        });
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    if (textContent) {
      element.textContent = textContent;
    }

    return element;
  },

  /**
   * Show element
   * @param {HTMLElement} element - Element to show
   */
  show(element) {
    if (element) {
      element.classList.remove('d-none');
    }
  },

  /**
   * Hide element
   * @param {HTMLElement} element - Element to hide
   */
  hide(element) {
    if (element) {
      element.classList.add('d-none');
    }
  },

  /**
   * Toggle element visibility
   * @param {HTMLElement} element - Element to toggle
   */
  toggle(element) {
    if (element) {
      element.classList.toggle('d-none');
    }
  },

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.flashFastApp = new FlashFastApp();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FlashFastApp, Utils };
}
