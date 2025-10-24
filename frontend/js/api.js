/**
 * FlashFast Frontend - API Communication Layer
 * Handles all HTTP requests to the backend with authentication and error handling
 */

class ApiClient {
  constructor() {
    // Load configuration
    this.baseURL = window.CONFIG
      ? window.CONFIG.API_BASE_URL
      : 'http://localhost:3001';
    this.timeout = 10000; // 10 seconds
    this.token = localStorage.getItem('jwt_token');

    // Request interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default request and response interceptors
   */
  setupDefaultInterceptors() {
    // Request interceptor for authentication
    this.addRequestInterceptor((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    // Response interceptor for error handling
    this.addResponseInterceptor(
      (response) => response,
      (error) => {
        // Handle authentication errors
        if (error.status === 401) {
          localStorage.removeItem('jwt_token');
          if (window.flashFastApp) {
            window.flashFastApp.handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Add request interceptor
   * @param {Function} interceptor - Request interceptor function
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * @param {Function} onFulfilled - Success handler
   * @param {Function} onRejected - Error handler
   */
  addResponseInterceptor(onFulfilled, onRejected) {
    this.responseInterceptors.push({ onFulfilled, onRejected });
  }

  /**
   * Apply request interceptors
   * @param {Object} config - Request configuration
   * @returns {Object} Modified configuration
   */
  applyRequestInterceptors(config) {
    return this.requestInterceptors.reduce((acc, interceptor) => {
      return interceptor(acc) || acc;
    }, config);
  }

  /**
   * Apply response interceptors
   * @param {Promise} responsePromise - Response promise
   * @returns {Promise} Modified response promise
   */
  applyResponseInterceptors(responsePromise) {
    return this.responseInterceptors.reduce(
      (promise, { onFulfilled, onRejected }) => {
        return promise.then(onFulfilled, onRejected);
      },
      responsePromise
    );
  }

  /**
   * Core HTTP request method
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Default configuration
    let config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...options,
    };

    // Apply request interceptors
    config = this.applyRequestInterceptors(config);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Make the request
      const responsePromise = fetch(url, {
        ...config,
        signal: controller.signal,
      }).then(async (response) => {
        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          const errorData = await this.parseErrorResponse(response);
          throw new ApiError(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        // Parse response based on content type
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text();
        }
      });

      // Apply response interceptors
      return await this.applyResponseInterceptors(responsePromise);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(error.message || 'Network error occurred', 0, {
        originalError: error,
      });
    }
  }

  /**
   * Parse error response
   * @param {Response} response - Fetch response object
   * @returns {Object} Error data
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        return { message: text || response.statusText };
      }
    } catch (parseError) {
      return { message: response.statusText || 'Unknown error' };
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} Response promise
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Response promise
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Response promise
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise} Response promise
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} Response promise
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication API methods

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise} Registration response
   */
  async register(userData) {
    const response = await this.post('/auth/register', userData);

    // Store token if provided
    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
      this.token = response.token;
    }

    return response;
  }

  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @returns {Promise} Login response
   */
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);

    // Store token if provided
    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
      this.token = response.token;
    }

    return response;
  }

  /**
   * User logout
   * @returns {Promise} Logout response
   */
  async logout() {
    try {
      const response = await this.post('/auth/logout');
      return response;
    } finally {
      // Always clear local token
      localStorage.removeItem('jwt_token');
      this.token = null;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise} Refresh response
   */
  async refreshToken() {
    const response = await this.post('/auth/refresh');

    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
      this.token = response.token;
    }

    return response;
  }

  // Product API methods

  /**
   * Get all products
   * @param {Object} filters - Product filters
   * @returns {Promise} Products list
   */
  async getProducts(filters = {}) {
    return this.get('/products', filters);
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise} Product data
   */
  async getProduct(productId) {
    return this.get(`/products/${productId}`);
  }

  /**
   * Create new product (admin only)
   * @param {Object} productData - Product data
   * @returns {Promise} Created product
   */
  async createProduct(productData) {
    return this.post('/products', productData);
  }

  /**
   * Update product (admin only)
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} Updated product
   */
  async updateProduct(productId, productData) {
    return this.put(`/products/${productId}`, productData);
  }

  /**
   * Delete product (admin only)
   * @param {string} productId - Product ID
   * @returns {Promise} Deletion response
   */
  async deleteProduct(productId) {
    return this.delete(`/products/${productId}`);
  }

  // Flash Sale Event API methods

  /**
   * Get all flash sale events
   * @param {Object} filters - Event filters
   * @returns {Promise} Flash sale events list
   */
  async getFlashSaleEvents(filters = {}) {
    return this.get('/flashsale-events', filters);
  }

  /**
   * Get flash sale event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise} Event data
   */
  async getFlashSaleEvent(eventId) {
    return this.get(`/flashsale-events/${eventId}`);
  }

  /**
   * Create new flash sale event (admin only)
   * @param {Object} eventData - Event data
   * @returns {Promise} Created event
   */
  async createFlashSaleEvent(eventData) {
    return this.post('/flashsale-events', eventData);
  }

  /**
   * Update flash sale event (admin only)
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise} Updated event
   */
  async updateFlashSaleEvent(eventId, eventData) {
    return this.put(`/flashsale-events/${eventId}`, eventData);
  }

  /**
   * Delete flash sale event (admin only)
   * @param {string} eventId - Event ID
   * @returns {Promise} Deletion response
   */
  async deleteFlashSaleEvent(eventId) {
    return this.delete(`/flashsale-events/${eventId}`);
  }

  /**
   * Purchase product in flash sale
   * @param {string} eventId - Flash sale event ID
   * @param {Object} purchaseData - Purchase data (quantity, etc.)
   * @returns {Promise} Purchase response
   */
  async purchaseProduct(eventId, purchaseData = {}) {
    return this.post(`/flashsale-events/${eventId}/purchase`, purchaseData);
  }

  // Order API methods

  /**
   * Get user's orders
   * @param {Object} filters - Order filters
   * @returns {Promise} Orders list
   */
  async getMyOrders(filters = {}) {
    return this.get('/orders/my-orders', filters);
  }

  /**
   * Get all orders (admin only)
   * @param {Object} filters - Order filters
   * @returns {Promise} All orders list
   */
  async getAllOrders(filters = {}) {
    return this.get('/orders', filters);
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} Order data
   */
  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  /**
   * Update order status (admin only)
   * @param {string} orderId - Order ID
   * @param {Object} statusData - Status update data
   * @returns {Promise} Updated order
   */
  async updateOrderStatus(orderId, statusData) {
    return this.patch(`/orders/${orderId}/status`, statusData);
  }

  // User API methods

  /**
   * Get current user profile
   * @returns {Promise} User profile
   */
  async getProfile() {
    return this.get('/users/profile');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise} Updated profile
   */
  async updateProfile(profileData) {
    return this.put('/users/profile', profileData);
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - User filters
   * @returns {Promise} Users list
   */
  async getUsers(filters = {}) {
    return this.get('/users', filters);
  }

  // Health check and utility methods

  /**
   * Check API health
   * @returns {Promise} Health status
   */
  async healthCheck() {
    return this.get('/health');
  }

  /**
   * Get API version info
   * @returns {Promise} Version info
   */
  async getVersion() {
    return this.get('/version');
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /**
   * Check if error is a network error
   * @returns {boolean} True if network error
   */
  isNetworkError() {
    return this.status === 0;
  }

  /**
   * Check if error is a client error (4xx)
   * @returns {boolean} True if client error
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a server error (5xx)
   * @returns {boolean} True if server error
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is an authentication error
   * @returns {boolean} True if auth error
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Get user-friendly error message
   * @returns {string} User-friendly message
   */
  getUserMessage() {
    if (this.isNetworkError()) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (this.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (this.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (this.status === 404) {
      return 'The requested resource was not found.';
    }

    if (this.status === 408) {
      return 'Request timeout. Please try again.';
    }

    if (this.status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (this.isServerError()) {
      return 'Server error occurred. Please try again later.';
    }

    return this.message || 'An unexpected error occurred.';
  }
}

// Create global API client instance
const apiClient = new ApiClient();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient, ApiError, apiClient };
}

// Make available globally
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.apiClient = apiClient;
