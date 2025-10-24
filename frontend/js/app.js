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
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        // Decode JWT token to get user info (basic decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if token is expired
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          this.setState({
            user: {
              id: payload.id || payload.userId,
              email: payload.email,
              role: payload.role,
              username: payload.username,
            },
            isAuthenticated: true,
          });
        } else {
          // Token expired, remove it
          localStorage.removeItem('jwt_token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('jwt_token');
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
      this.handleLogin(form);
    }

    // Handle register form
    if (form.id === 'registerForm') {
      event.preventDefault();
      this.handleRegister(form);
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
    if (target.matches('.alert .btn-close')) {
      event.preventDefault();
      this.clearError();
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

      const response = await window.apiClient.login(credentials);

      // Update user state
      if (response.user) {
        this.setState({
          user: response.user,
          isAuthenticated: true,
        });
        this.navigateTo('dashboard', true);
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

      const response = await window.apiClient.register(userData);

      // Update user state and redirect to dashboard
      if (response.user) {
        this.setState({
          user: response.user,
          isAuthenticated: true,
        });
        this.navigateTo('dashboard', true);
      } else {
        // Registration successful, redirect to login
        this.navigateTo('login', true);
        this.showError('Registration successful! Please log in.', 'success');
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
  handleLogout() {
    localStorage.removeItem('jwt_token');
    this.setState({
      user: null,
      isAuthenticated: false,
      products: [],
      flashSaleEvents: [],
      orders: [],
    });
    this.navigateTo('login', true);
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
   * Hide error message
   */
  hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
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
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title text-center">Login to FlashFast</h3>
              </div>
              <div class="card-body">
                <form id="loginForm">
                  <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block">
                    ${
                      this.state.loading
                        ? '<span class="spinner spinner-sm"></span> Logging in...'
                        : 'Login'
                    }
                  </button>
                </form>
                <div class="text-center mt-3">
                  <a href="#" data-route="register">Don't have an account? Register</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getRegisterPageHTML() {
    return `
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title text-center">Register for FlashFast</h3>
              </div>
              <div class="card-body">
                <form id="registerForm">
                  <div class="form-group">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" required>
                  </div>
                  <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                  </div>
                  <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                  </div>
                  <div class="form-group">
                    <label for="role" class="form-label">Role</label>
                    <select class="form-select" id="role" name="role" required>
                      <option value="">Select Role</option>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block">
                    ${
                      this.state.loading
                        ? '<span class="spinner spinner-sm"></span> Registering...'
                        : 'Register'
                    }
                  </button>
                </form>
                <div class="text-center mt-3">
                  <a href="#" data-route="login">Already have an account? Login</a>
                </div>
              </div>
            </div>
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
