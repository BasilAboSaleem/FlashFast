// Configuration file for API endpoints and environment variables
const CONFIG = {
  // API Base URLs for different backend versions
  API_BASE_URL:
    window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://api.flashfast.com',

  API_VERSION: 'v1', // Default to v1, can be switched to v2

  // Backend version endpoints
  ENDPOINTS: {
    v1:
      window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://api-v1.flashfast.com',
    v2:
      window.location.hostname === 'localhost'
        ? 'http://localhost:3002'
        : 'https://api-v2.flashfast.com',
  },

  // JWT token storage key
  JWT_STORAGE_KEY: 'jwt_token',

  // Refresh interval for flash sale updates (30 seconds)
  REFRESH_INTERVAL: 30000,

  // API timeout settings
  REQUEST_TIMEOUT: 10000, // 10 seconds

  // Environment detection
  ENVIRONMENT:
    window.location.hostname === 'localhost' ? 'development' : 'production',
};

// Function to get current API base URL based on selected version
function getApiBaseUrl() {
  return CONFIG.ENDPOINTS[CONFIG.API_VERSION] || CONFIG.API_BASE_URL;
}

// Function to switch backend version
function switchBackendVersion(version) {
  if (CONFIG.ENDPOINTS[version]) {
    CONFIG.API_VERSION = version;
    CONFIG.API_BASE_URL = CONFIG.ENDPOINTS[version];
    console.log(`Switched to backend version: ${version}`);
    return true;
  }
  console.error(`Invalid backend version: ${version}`);
  return false;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getApiBaseUrl, switchBackendVersion };
}
