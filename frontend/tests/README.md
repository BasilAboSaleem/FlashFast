# FlashFast Frontend Tests

This directory contains comprehensive unit tests for the FlashFast frontend authentication system and form validation.

## Test Structure

### Files

- **`run-tests.html`** - Interactive test runner that can be opened in a browser
- **`auth-tests.html`** - Standalone authentication tests with visual interface
- **`auth-unit-tests.js`** - Core authentication unit tests
- **`test-runner.js`** - Simple test framework for frontend testing
- **`README.md`** - This documentation file

### Test Suites

1. **Authentication Tests** (`auth-unit-tests.js`)

   - JWT token handling and storage
   - Token expiration detection
   - User authentication state management
   - Role-based access control
   - Form validation logic
   - Error handling

2. **Form Validation Tests**
   - Login form validation
   - Registration form validation
   - Email format validation
   - Password strength validation
   - Username format validation

## Running Tests

### Option 1: Interactive Browser Tests (Recommended)

1. Open `run-tests.html` in your web browser
2. Click the buttons to run specific test suites:
   - **Run Authentication Tests** - Tests JWT handling and auth logic
   - **Run Form Validation Tests** - Tests form validation functions
   - **Run All Tests** - Executes all test suites

### Option 2: Standalone Authentication Tests

1. Open `auth-tests.html` in your web browser
2. Click "Run All Tests" to execute the authentication test suite
3. View detailed results and test coverage

### Option 3: Console Testing

You can also run tests programmatically in the browser console:

```javascript
// Run authentication tests
const authRunner = runAuthenticationTests();
authRunner.runTests().then((summary) => console.log(summary));

// Run form validation tests
const formRunner = runFormValidationTests();
formRunner.runTests().then((summary) => console.log(summary));
```

## Test Coverage

### JWT Token Handling

- ✅ Token storage and retrieval
- ✅ Token payload decoding
- ✅ Token expiration detection
- ✅ Token refresh logic
- ✅ Authorization header generation

### Authentication State Management

- ✅ User authentication status
- ✅ User data extraction from tokens
- ✅ Role-based access control
- ✅ Authentication state persistence

### Form Validation

- ✅ Email format validation
- ✅ Password strength validation
- ✅ Username format validation
- ✅ Required field validation
- ✅ Real-time validation feedback

### Error Handling

- ✅ Authentication error handling
- ✅ Network error handling
- ✅ Validation error display
- ✅ User-friendly error messages

## Test Framework Features

The custom test framework (`test-runner.js`) provides:

- **Describe/It syntax** - Familiar BDD-style test organization
- **Assertion helpers** - `expect().toBe()`, `expect().toEqual()`, etc.
- **Mock utilities** - MockLocalStorage, MockFetch for testing
- **Setup/Teardown** - `beforeEach()` and `afterEach()` hooks
- **Error handling** - Graceful test failure handling
- **Results reporting** - Detailed test results and summaries

## Mock Objects

### MockLocalStorage

Simulates browser localStorage for testing:

```javascript
const mockStorage = new MockLocalStorage();
mockStorage.setItem('key', 'value');
mockStorage.getItem('key'); // returns 'value'
```

### MockFetch

Simulates fetch API for testing HTTP requests:

```javascript
const mockFetch = new MockFetch();
mockFetch.mockResponse('/api/login', {
  status: 200,
  data: { token: 'abc123' },
});
```

## Writing New Tests

To add new tests, follow this pattern:

```javascript
describe('Feature Name', () => {
  let testSubject;

  beforeEach(() => {
    // Setup before each test
    testSubject = new FeatureClass();
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test input';

    // Act
    const result = testSubject.doSomething(input);

    // Assert
    expect(result).toBe('expected output');
  });
});
```

## Browser Compatibility

Tests are designed to run in modern browsers that support:

- ES6+ JavaScript features
- Fetch API
- LocalStorage
- Promises/Async-Await

## Troubleshooting

### Common Issues

1. **Tests not loading**: Ensure all script files are properly included
2. **LocalStorage errors**: Tests use MockLocalStorage to avoid browser restrictions
3. **Network errors**: Tests use MockFetch to simulate API responses
4. **Console errors**: Check browser developer tools for detailed error messages

### Debug Mode

Enable debug mode by opening browser developer tools and checking the console for detailed test execution logs.

## Contributing

When adding new authentication features:

1. Write tests first (TDD approach)
2. Ensure tests cover both success and failure scenarios
3. Add appropriate mocks for external dependencies
4. Update this README with new test coverage information

## Requirements Coverage

These tests fulfill the requirements specified in the FlashFast frontend specification:

- **Requirement 1.1**: Login form validation ✅
- **Requirement 1.2**: Registration form validation ✅
- **Requirement 1.3**: Role selection validation ✅
- **Requirement 1.4**: JWT token handling ✅
- **Requirement 1.5**: Authentication state management ✅

All core authentication functionality is thoroughly tested with comprehensive coverage of edge cases and error scenarios.
