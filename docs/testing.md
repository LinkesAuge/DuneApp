# Testing Documentation - POI Linking System

## Overview

This document outlines the comprehensive testing strategy for the unified POI linking system, including test procedures, performance benchmarks, and maintenance guidelines.

## Test Suite Structure

### 1. Test Utilities (`src/lib/__tests__/testUtils.ts`)

Comprehensive utilities for mocking and test data generation:

- **Mock Supabase Client**: Complete mocking of Supabase operations
- **Test Data Generators**: Functions for creating realistic test POIs, items, and schematics
- **Network Simulation**: Functions for simulating delays, errors, and various network conditions
- **Performance Measurement**: Utilities for measuring execution time and memory usage
- **Scenario Builders**: Pre-configured test scenarios for different scale operations

### 2. Unit Tests (`src/lib/__tests__/linkingUtils.test.ts`)

**Coverage Areas:**
- Link creation functions (`createPoiItemLinks`, `createPoiItemLinksWithRetry`)
- Error classification and handling
- Retry logic with exponential backoff
- Operation history management
- Undo functionality
- Data validation and sanitization

**Key Test Scenarios:**
- Successful link creation (small, medium, large datasets)
- Error handling for network, database, and validation failures
- Retry logic with different failure patterns
- Operation history storage and retrieval
- Undo operations with various link counts
- Edge cases and boundary conditions

### 3. Component Tests

#### EnhancedFeedbackDisplay Tests (`src/components/poi-linking/__tests__/EnhancedFeedbackDisplay.test.tsx`)

**Coverage Areas:**
- Success state display with analytics
- Error state display with enhanced error details
- Retry and undo button functionality
- Error details expansion/collapse
- Retry history display
- Accessibility compliance
- Keyboard navigation support

#### Integration Tests (`src/components/poi-linking/__tests__/UnifiedPoiLinkingPage.integration.test.tsx`)

**Coverage Areas:**
- Complete workflow from selection to link creation
- Error scenarios with retry capability
- Undo functionality end-to-end
- URL state management integration
- Performance with large selections
- Error recovery scenarios
- Accessibility integration
- Concurrent operations

### 4. Performance Tests (`src/lib/__tests__/performance.test.ts`)

**Test Categories:**

#### Bulk Operation Performance
- Small selections (< 1 second, < 10MB memory)
- Medium selections (< 3 seconds, < 25MB memory)
- Large selections (< 10 seconds, < 50MB memory)
- Massive selections (< 30 seconds, < 100MB memory)

#### Error Recovery Performance
- Retry scenarios with exponential backoff
- Delay calculation efficiency
- Error classification performance

#### Memory Management Performance
- Operation history management
- Undo operations with large link counts
- Memory cleanup verification

#### Concurrent Operations
- Multiple simultaneous operations
- Resource sharing and contention
- Performance under load

#### Timeout and Edge Cases
- Operation timeout handling
- Rapid successive operations
- Resource exhaustion scenarios

## Performance Benchmarks

### Execution Time Thresholds

| Operation Size | Max Execution Time | Max Memory Usage |
|----------------|-------------------|------------------|
| Small (< 100 links) | 1 second | 10MB |
| Medium (< 1,000 links) | 3 seconds | 25MB |
| Large (< 10,000 links) | 10 seconds | 50MB |
| Massive (< 100,000 links) | 30 seconds | 100MB |

### Retry Performance

- **Retry Delay Calculation**: < 10ms for 100 calculations
- **Error Classification**: < 5ms per error
- **Operation History Storage**: < 1 second for 100 operations
- **Operation History Retrieval**: < 100ms

### Batch Processing Efficiency

- **Minimum Batch Size**: 20 links per API call
- **Maximum Batch Size**: 1,000 links per API call
- **API Call Efficiency**: < 5% of total links as separate API calls

## Running Tests

### Prerequisites

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test linkingUtils.test.ts
npm test EnhancedFeedbackDisplay.test.tsx
npm test performance.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run integration tests only
npm test -- --testPathPattern=integration

# Run performance tests only
npm test -- --testPathPattern=performance
```

### Test Configuration

Tests use Jest with the following configuration:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Coverage Goals

### Target Coverage Metrics

- **Lines**: 90% minimum
- **Functions**: 95% minimum
- **Branches**: 85% minimum
- **Statements**: 90% minimum

### Critical Coverage Areas

1. **Error Handling**: 100% coverage required
2. **Retry Logic**: 100% coverage required
3. **Undo Functionality**: 100% coverage required
4. **Data Validation**: 100% coverage required
5. **Performance Critical Paths**: 95% coverage required

## Test Data Management

### Test Data Generation

```typescript
// Example usage of test utilities
import {
  generateTestPois,
  generateTestItems,
  generateTestSchematics,
  createSmallSelectionScenario,
  createLargeSelectionScenario,
} from './testUtils';

// Generate specific amounts
const pois = generateTestPois(50);
const items = generateTestItems(100);
const schematics = generateTestSchematics(25);

// Use pre-configured scenarios
const smallScenario = createSmallSelectionScenario();
const largeScenario = createLargeSelectionScenario();
```

### Mock Management

```typescript
// Setup comprehensive mocking
import { setupTestEnvironment, teardownTestEnvironment } from './testUtils';

beforeEach(() => {
  setupTestEnvironment();
});

afterEach(() => {
  teardownTestEnvironment();
});
```

## Performance Testing Guidelines

### 1. Baseline Establishment

Before making changes, establish baseline performance:

```bash
npm test -- --testPathPattern=performance --verbose
```

### 2. Performance Regression Detection

- Run performance tests before and after changes
- Compare execution times and memory usage
- Flag any degradation > 20% as requiring investigation
- Document performance improvements

### 3. Load Testing

For production-like testing:

```typescript
// Example load test scenario
const massiveScenario = createMassiveSelectionScenario();
const config = {
  poiIds: Array.from(massiveScenario.poiIds).slice(0, 500),
  itemIds: Array.from(massiveScenario.itemIds).slice(0, 1000),
  schematicIds: Array.from(massiveScenario.schematicIds).slice(0, 500),
  linkType: 'found_here',
};
```

## Continuous Integration

### CI Pipeline Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - run: npm run test:performance
      - uses: codecov/codecov-action@v2
```

### Performance Monitoring

- Track performance metrics over time
- Set up alerts for performance degradation
- Regular performance audits and optimization

## Error Simulation Testing

### Network Conditions

```typescript
// Test various network scenarios
await simulateNetworkError('timeout');
await simulateNetworkError('connection_failed');
await simulateRateLimitError();
await simulateNetworkDelay(5000); // 5 second delay
```

### Database Conditions

```typescript
// Test database error scenarios
await simulateDatabaseError('constraint_violation');
await simulateDatabaseError('connection_lost');
await simulateDatabaseError('permission_denied');
```

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// Example accessibility test
import { runAxeTest } from './testUtils';

it('should meet accessibility standards', async () => {
  render(<UnifiedPoiLinkingPage />);
  const results = await runAxeTest();
  expect(results).toHaveNoViolations();
});
```

### Manual Accessibility Testing

- Keyboard navigation through complete workflow
- Screen reader compatibility
- Color contrast verification
- Focus management during operations

## Test Maintenance

### Regular Review Schedule

- **Weekly**: Review failing tests and performance trends
- **Monthly**: Update test data and scenarios
- **Quarterly**: Comprehensive test suite audit
- **Release**: Full regression testing

### Test Quality Metrics

- Test execution time (< 5 minutes for full suite)
- Test reliability (< 1% flaky test rate)
- Test coverage maintenance (goals met consistently)
- Performance benchmark stability

### Adding New Tests

When adding new functionality:

1. **Write tests first** (TDD approach)
2. **Include performance tests** for critical paths
3. **Add accessibility tests** for UI components
4. **Update documentation** with new test procedures
5. **Verify CI integration** works correctly

## Debugging Test Failures

### Common Issues

1. **Timing Issues**: Use `waitFor` and proper async handling
2. **Mock Conflicts**: Ensure proper mock cleanup
3. **Performance Variations**: Use performance thresholds with margins
4. **Environment Differences**: Standardize test environment setup

### Debugging Tools

```typescript
// Enable debug logging
process.env.DEBUG = 'linkingUtils:*';

// Performance profiling
import { measureExecutionTime } from './testUtils';

const { result, executionTime } = await measureExecutionTime(async () => {
  return await createPoiItemLinks(config);
});

console.log(`Operation took ${executionTime}ms`);
```

## Future Testing Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Automated UI change detection
2. **End-to-End Testing**: Full user journey automation
3. **Stress Testing**: System behavior under extreme load
4. **Security Testing**: Input validation and XSS prevention
5. **Internationalization Testing**: Multi-language support

### Testing Tools Evaluation

- **Playwright**: E2E testing consideration
- **Storybook**: Component testing and documentation
- **Artillery**: Load testing framework
- **Pa11y**: Automated accessibility testing

This comprehensive testing strategy ensures the POI linking system is reliable, performant, and maintainable while providing excellent user experience across all scenarios. 