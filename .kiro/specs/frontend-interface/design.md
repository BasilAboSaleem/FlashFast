# Frontend Interface Design Document

## Overview

The FlashFast Frontend Interface is a responsive web application built with vanilla HTML, CSS, and JavaScript that provides a complete user interface for the FlashFast e-commerce flash sale system. The frontend communicates with the backend APIs through RESTful HTTP requests and supports both v1 (synchronous) and v2 (asynchronous) backend implementations through configurable endpoints.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐
│   Web Browser   │ ◄──────────────► │  Frontend App   │
│                 │                   │  (Static Files) │
└─────────────────┘                   └─────────────────┘
                                              │
                                              │ REST API Calls
                                              ▼
                                      ┌─────────────────┐
                                      │  FlashFast API  │
                                      │   (v1 or v2)    │
                                      └─────────────────┘
```

### Frontend Architecture Pattern

The frontend follows a **Single Page Application (SPA)** pattern with:

- **Vanilla JavaScript** for DOM manipulation and API communication
- **Modular CSS** for styling with responsive design
- **Local Storage** for JWT token persistence
- **Fetch API** for HTTP requests to backend
- **Dynamic routing** using hash-based navigation

## Components and Interfaces

### 1. Core Application Structure

```
frontend/
├── index.html              # Main HTML entry point
├── css/
│   ├── main.css           # Global styles
│   ├── auth.css           # Authentication pages
│   ├── dashboard.css      # Dashboard and main app
│   └── components.css     # Reusable components
├── js/
│   ├── app.js            # Main application controller
│   ├── auth.js           # Authentication logic
│   ├── api.js            # API communication layer
│   ├── dashboard.js      # Dashboard functionality
│   ├── products.js       # Product management
│   ├── flashsales.js     # Flash sale functionality
│   ├── orders.js         # Order management
│   └── utils.js          # Utility functions
└── config/
    └── config.js         # Configuration settings
```

### 2. API Communication Layer

**File: `js/api.js`**

```javascript
class ApiClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.token = localStorage.getItem('jwt_token');
  }

  // Core HTTP methods
  async request(endpoint, options = {}) { ... }
  async get(endpoint) { ... }
  async post(endpoint, data) { ... }

  // Authentication endpoints
  async register(userData) { ... }
  async login(credentials) { ... }

  // Product endpoints
  async getProducts() { ... }
  async createProduct(productData) { ... }

  // Flash sale endpoints
  async getFlashSaleEvents() { ... }
  async createFlashSaleEvent(eventData) { ... }
  async purchaseProduct(eventId) { ... }

  // Order endpoints
  async getMyOrders() { ... }
}
```

### 3. Authentication System

**JWT Token Management:**

- Store JWT token in localStorage upon successful login
- Include Authorization header in all authenticated requests
- Automatic token validation and redirect to login if expired
- Role-based UI rendering (admin vs customer features)

**Authentication Flow:**

1. User submits login form
2. Frontend sends POST to `/auth/login`
3. Backend returns JWT token
4. Frontend stores token and redirects to dashboard
5. All subsequent requests include Authorization header

### 4. Page Components

#### 4.1 Authentication Pages

- **Login Page**: Email/password form with validation
- **Register Page**: User registration with role selection
- **Logout**: Clear token and redirect to login

#### 4.2 Dashboard Pages

- **Products Page**: Display all products with admin create functionality
- **Flash Sales Page**: Show active/upcoming events with purchase buttons
- **Orders Page**: User's order history
- **Admin Panel**: Product and event management (admin only)

#### 4.3 Shared Components

- **Navigation Bar**: Role-based menu with logout
- **Loading Spinner**: For async operations
- **Error Messages**: Consistent error display
- **Success Notifications**: Confirmation messages

## Data Models

### Frontend Data Structures

```javascript
// User object (from JWT decode)
const User = {
  id: String,
  email: String,
  role: String, // 'admin' or 'customer'
  username: String,
};

// Product object
const Product = {
  _id: String,
  name: String,
  description: String,
  price: Number,
  stock: Number,
  createdAt: Date,
};

// Flash Sale Event object
const FlashSaleEvent = {
  _id: String,
  productId: String,
  salePrice: Number,
  startTime: Date,
  endTime: Date,
  maxQuantity: Number,
  isActive: Boolean,
};

// Order object
const Order = {
  _id: String,
  userId: String,
  productId: String,
  quantity: Number,
  totalPrice: Number,
  createdAt: Date,
};
```

### State Management

```javascript
// Application state
const AppState = {
  user: null,
  products: [],
  flashSaleEvents: [],
  orders: [],
  currentPage: 'login',
  loading: false,
  error: null,
};
```

## Error Handling

### 1. API Error Handling

- **Network Errors**: Display "Connection failed" message with retry option
- **Authentication Errors (401)**: Clear token and redirect to login
- **Authorization Errors (403)**: Display "Access denied" message
- **Validation Errors (400)**: Show specific field validation messages
- **Server Errors (500)**: Display generic error message

### 2. Client-Side Validation

- **Form Validation**: Real-time validation for all input fields
- **Email Format**: Validate email format before submission
- **Password Strength**: Minimum length and complexity requirements
- **Required Fields**: Prevent submission with empty required fields

### 3. Error Display Strategy

```javascript
// Centralized error handling
function displayError(message, type = 'error') {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
      <button onclick="clearError()">×</button>
    </div>
  `;
  setTimeout(clearError, 5000); // Auto-clear after 5 seconds
}
```

## Testing Strategy

### 1. Manual Testing Checklist

- **Authentication Flow**: Register, login, logout, token persistence
- **Role-Based Access**: Admin vs customer feature visibility
- **API Integration**: All CRUD operations with both v1 and v2 backends
- **Error Scenarios**: Network failures, invalid inputs, expired tokens
- **Responsive Design**: Mobile, tablet, desktop layouts

### 2. Cross-Browser Testing

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript Features**: Fetch API, localStorage, ES6+ syntax
- **CSS Features**: Flexbox, Grid, responsive units

### 3. Performance Testing

- **Load Times**: Measure initial page load and API response times
- **Memory Usage**: Monitor for memory leaks during navigation
- **Network Efficiency**: Minimize API calls and payload sizes

### 4. Backend Compatibility Testing

- **v1 Backend**: Test all features with synchronous HTTP implementation
- **v2 Backend**: Test all features with asynchronous queue implementation
- **Switching Backends**: Verify seamless operation when changing API endpoints

## Configuration Management

### Environment Configuration

```javascript
// config/config.js
const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  API_VERSION: process.env.API_VERSION || 'v1',
  JWT_STORAGE_KEY: 'jwt_token',
  REFRESH_INTERVAL: 30000, // 30 seconds for flash sale updates

  // Backend version switching
  ENDPOINTS: {
    v1: 'http://localhost:3001',
    v2: 'http://localhost:3002',
  },
};
```

### Dynamic Backend Switching

- Environment variable or config file to specify backend version
- Runtime switching capability for testing different implementations
- Consistent API interface regardless of backend version

## Security Considerations

### 1. Token Security

- Store JWT in localStorage (acceptable for demo/educational project)
- Include token in Authorization header, not URL parameters
- Clear token on logout and browser close

### 2. Input Sanitization

- Escape HTML content to prevent XSS attacks
- Validate all user inputs before sending to backend
- Use textContent instead of innerHTML for user-generated content

### 3. HTTPS Considerations

- Recommend HTTPS in production deployment
- Secure cookie settings for production environment
- Content Security Policy headers

## Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Layout Strategy

- **Mobile-First**: Design for mobile, enhance for larger screens
- **Flexbox/Grid**: Modern CSS layout techniques
- **Touch-Friendly**: Adequate button sizes and spacing for mobile
- **Progressive Enhancement**: Core functionality works without JavaScript

## Performance Optimization

### 1. Loading Strategy

- **Critical CSS**: Inline critical styles in HTML head
- **Lazy Loading**: Load non-critical JavaScript asynchronously
- **Image Optimization**: Compress and serve appropriate sizes

### 2. Caching Strategy

- **Static Assets**: Cache CSS and JavaScript files
- **API Responses**: Cache product data with appropriate TTL
- **Local Storage**: Store frequently accessed data locally

### 3. Network Optimization

- **Minimize Requests**: Bundle CSS and JavaScript files
- **Compress Assets**: Gzip compression for text files
- **CDN Usage**: Consider CDN for static assets in production
