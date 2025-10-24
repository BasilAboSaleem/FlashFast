/**
 * FlashFast Frontend - Test Runner
 * Simple test runner for authentication and other frontend tests
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.currentSuite = null;
    this.beforeEachCallback = null;
    this.afterEachCallback = null;
  }

  /**
   * Define a test suite
   * @param {string} suiteName - Name of the test suite
   * @param {Function} callback - Suite definition callback
   */
  describe(suiteName, callback) {
    this.currentSuite = suiteName;
    callback();
    this.currentSuite = null;
  }

  /**
   * Define a test case
   * @param {string} testName - Name of the test
   * @param {Function} callback - Test implementation
   */
  it(testName, callback) {
    this.tests.push({
      suite: this.currentSuite,
      name: testName,
      callback: callback,
    });
  }

  /**
   * Set up before each test
   * @param {Function} callback - Setup callback
   */
  beforeEach(callback) {
    this.beforeEachCallback = callback;
  }

  /**
   * Clean up after each test
   * @param {Function} callback - Cleanup callback
   */
  afterEach(callback) {
    this.afterEachCallback = callback;
  }

  /**
   * Run all tests
   * @returns {Promise<Object>} Test results summary
   */
  async runTests() {
    this.results = [];
    console.log('🧪 Running FlashFast Authentication Tests...\n');

    for (const test of this.tests) {
      try {
        // Run beforeEach if defined
        if (this.beforeEachCallback) {
          await this.beforeEachCallback();
        }

        // Run the test
        await test.callback();

        // Run afterEach if defined
        if (this.afterEachCallback) {
          await this.afterEachCallback();
        }

        this.results.push({
          ...test,
          status: 'pass',
          error: null,
        });

        console.log(`✅ ${test.suite} - ${test.name}`);
      } catch (error) {
        this.results.push({
          ...test,
          status: 'fail',
          error: error.message,
        });

        console.log(`❌ ${test.suite} - ${test.name}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    return this.getSummary();
  }

  /**
   * Get test results summary
   * @returns {Object} Summary of test results
   */
  getSummary() {
    const passed = this.results.filter((r) => r.status === 'pass').length;
    const failed = this.results.filter((r) => r.status === 'fail').length;
    const total = this.results.length;

    const summary = {
      total,
      passed,
      failed,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      results: this.results,
    };

    console.log('\n📊 Test Summary:');
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${summary.successRate}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter((r) => r.status === 'fail')
        .forEach((result) => {
          console.log(`  - ${result.suite} - ${result.name}: ${result.error}`);
        });
    }

    return summary;
  }

  /**
   * Assertion helpers
   * @param {*} actual - Actual value
   * @returns {Object} Assertion methods
   */
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(
            `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(
              actual
            )}`
          );
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, but got ${actual}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, but got ${actual}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toThrow: () => {
        let threw = false;
        try {
          if (typeof actual === 'function') {
            actual();
          }
        } catch (e) {
          threw = true;
        }
        if (!threw) {
          throw new Error('Expected function to throw an error');
        }
      },
      toBeInstanceOf: (expectedClass) => {
        if (!(actual instanceof expectedClass)) {
          throw new Error(
            `Expected instance of ${expectedClass.name}, but got ${actual.constructor.name}`
          );
        }
      },
      toHaveProperty: (property) => {
        if (!(property in actual)) {
          throw new Error(`Expected object to have property ${property}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
    };
  }
}

// Mock localStorage for testing environments
class MockLocalStorage {
  constructor() {
    this.data = {};
  }

  getItem(key) {
    return this.data[key] || null;
  }

  setItem(key, value) {
    this.data[key] = value;
  }

  removeItem(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }

  key(index) {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.data).length;
  }
}

// Mock fetch for API testing
class MockFetch {
  constructor() {
    this.responses = new Map();
    this.requests = [];
  }

  mockResponse(url, response) {
    this.responses.set(url, response);
  }

  async fetch(url, options = {}) {
    this.requests.push({ url, options });

    const mockResponse = this.responses.get(url);
    if (mockResponse) {
      return {
        ok: mockResponse.status >= 200 && mockResponse.status < 300,
        status: mockResponse.status || 200,
        json: async () => mockResponse.data,
        text: async () => JSON.stringify(mockResponse.data),
        headers: new Map(Object.entries(mockResponse.headers || {})),
      };
    }

    // Default success response
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '{}',
      headers: new Map(),
    };
  }

  getRequests() {
    return this.requests;
  }

  clearRequests() {
    this.requests = [];
  }

  clearMocks() {
    this.responses.clear();
    this.requests = [];
  }
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, MockLocalStorage, MockFetch };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.TestRunner = TestRunner;
  window.MockLocalStorage = MockLocalStorage;
  window.MockFetch = MockFetch;
}
