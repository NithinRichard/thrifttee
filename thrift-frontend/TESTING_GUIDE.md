# Frontend Testing Guide

## Overview
Comprehensive testing suite for ThriftTee frontend using Jest, React Testing Library, and Cypress.

## Test Structure

```
src/
├── setupTests.js                    # Jest configuration
├── utils/test-utils.js              # Testing utilities
├── components/
│   ├── common/__tests__/
│   ├── auth/__tests__/
│   ├── cart/__tests__/
│   ├── checkout/__tests__/
│   └── product/__tests__/
├── services/__tests__/              # API integration tests
└── __tests__/integration/           # Integration tests

cypress/
├── e2e/                             # E2E tests
│   ├── authentication.cy.js
│   ├── product-browsing.cy.js
│   ├── cart.cy.js
│   └── checkout.cy.js
├── support/
│   ├── commands.js                  # Custom commands
│   └── e2e.js
└── fixtures/                        # Test data
```

## Running Tests

### Unit & Integration Tests (Jest)
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci

# Run specific test file
npm test -- ProductCard.test.js

# Run tests in watch mode
npm test -- --watch
```

### E2E Tests (Cypress)
```bash
# Install Cypress (first time only)
npm install --save-dev cypress

# Open Cypress UI
npx cypress open

# Run headless
npx cypress run

# Run specific test
npx cypress run --spec "cypress/e2e/checkout.cy.js"
```

## Test Coverage Goals

- **Statements**: 50%+
- **Branches**: 50%+
- **Functions**: 50%+
- **Lines**: 50%+

## Writing Tests

### Component Tests
```javascript
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API Tests
```javascript
import axios from 'axios';
import api from '../api';

jest.mock('axios');

describe('API Service', () => {
  test('fetches data', async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });
    const result = await api.getProducts();
    expect(axios.get).toHaveBeenCalled();
  });
});
```

### E2E Tests
```javascript
describe('Feature', () => {
  it('completes user flow', () => {
    cy.visit('/page');
    cy.get('button').click();
    cy.contains('Success').should('be.visible');
  });
});
```

## Best Practices

1. **Use data-testid for stable selectors**
   ```jsx
   <div data-testid="product-card">...</div>
   ```

2. **Mock external dependencies**
   ```javascript
   jest.mock('axios');
   ```

3. **Test user behavior, not implementation**
   ```javascript
   // Good
   fireEvent.click(screen.getByRole('button', { name: /submit/i }));
   
   // Avoid
   wrapper.find('.submit-btn').simulate('click');
   ```

4. **Use custom render with providers**
   ```javascript
   renderWithProviders(<Component />);
   ```

5. **Clean up after tests**
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
     localStorage.clear();
   });
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npx cypress run
```

## Debugging Tests

### Jest
```bash
# Run with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Cypress
```bash
# Open Cypress with browser DevTools
npx cypress open

# Take screenshots on failure (automatic)
# Videos saved in cypress/videos/
```

## Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js
```javascript
testTimeout: 10000
```

### Issue: Axios not transforming
**Solution**: Add to jest config
```javascript
transformIgnorePatterns: ["/node_modules/(?!axios)/"]
```

### Issue: localStorage not defined
**Solution**: Mock in setupTests.js (already done)

## Test Maintenance

- Run tests before every commit
- Update tests when features change
- Remove obsolete tests
- Keep coverage above thresholds
- Review test failures in CI

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
