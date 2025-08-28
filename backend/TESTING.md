# Testing Guide for Shop Inventory API

This document provides comprehensive information about testing the Shop Inventory API, including how to run tests, what tests are available, and how to write new tests.

## 🧪 Test Structure

The testing suite is organized into two main categories:

### 1. Unit Tests (`*.spec.ts`)
- **Location**: `src/**/*.spec.ts`
- **Purpose**: Test individual functions, services, and controllers in isolation
- **Dependencies**: Mocked using Jest mocks
- **Speed**: Fast execution

### 2. End-to-End Tests (`*.e2e-spec.ts`)
- **Location**: `test/**/*.e2e-spec.ts`
- **Purpose**: Test complete API endpoints and database interactions
- **Dependencies**: Real MongoDB test database
- **Speed**: Slower execution due to real database operations

## 🚀 Running Tests

### Quick Start
```bash
# Run all tests
./run-tests.sh

# Run only unit tests
./run-tests.sh unit

# Run only e2e tests
./run-tests.sh e2e

# Run tests with coverage
./run-tests.sh coverage

# Run tests in watch mode
./run-tests.sh watch
```

### Using npm scripts
```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 📋 Available Tests

### Unit Tests
- **Products**: `src/modules/products/products.service.spec.ts`
- **Products Controller**: `src/modules/products/products.controller.spec.ts`
- **Sales**: `src/modules/sales/sales.service.spec.ts`
- **Auth**: `src/modules/auth/auth.service.spec.ts`
- **Customers**: `src/modules/customers/customers.service.spec.ts`

### End-to-End Tests
- **App**: `test/app.e2e-spec.ts` - Basic app functionality
- **Products API**: `test/products.e2e-spec.ts` - Complete products CRUD operations

## 🛠️ Test Configuration

### Environment Variables
Tests use a separate environment configuration file: `test.env`

```env
NODE_ENV=test
PORT=3001
MONGODB_URI=mongodb://admin:password123@localhost:27017/shop_inventory_test?authSource=admin
JWT_SECRET=test-jwt-secret-key-for-testing-only
```

### Jest Configuration
- **Unit Tests**: `package.json` → `jest` section
- **E2E Tests**: `test/jest-e2e.json`

### Test Setup
- **Global Setup**: `test/test-setup.ts`
- **Test Utilities**: Global helper functions for creating mock data

## 📝 Writing New Tests

### Unit Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### E2E Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Your API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('expectedProperty');
      });
  });
});
```

## 🔧 Test Utilities

### Global Test Helpers
```typescript
// Available globally in tests
global.testUtils.createMockId()           // Creates mock MongoDB ObjectId
global.testUtils.createMockDate()         // Creates mock Date
global.testUtils.createMockProduct()      // Creates mock Product
global.testUtils.createMockUser()         // Creates mock User
global.testUtils.createMockSale()         // Creates mock Sale
```

### Mock Data Examples
```typescript
const mockProduct = global.testUtils.createMockProduct({
  name: 'Custom Product',
  price: 199.99,
});

const mockUser = global.testUtils.createMockUser({
  email: 'custom@example.com',
  role: 'admin',
});
```

## 🗄️ Database Testing

### Test Database Setup
- **Database**: `shop_inventory_test`
- **Connection**: Separate from development database
- **Cleanup**: Collections are cleared before each test

### MongoDB Connection
```typescript
import { Connection, connect, disconnect } from 'mongoose';

beforeAll(async () => {
  const mongoUri = 'mongodb://admin:password123@localhost:27017/shop_inventory_test?authSource=admin';
  mongoConnection = await connect(mongoUri);
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoConnection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

## 📊 Test Coverage

### Running Coverage
```bash
npm run test:cov
```

### Coverage Report
- **Location**: `coverage/` directory
- **Format**: HTML and console output
- **Thresholds**: Configured in Jest configuration

### Coverage Goals
- **Statements**: >80%
- **Branches**: >80%
- **Functions**: >80%
- **Lines**: >80%

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test File
```bash
npm test -- products.service.spec.ts
```

### Watch Mode with Debug
```bash
npm run test:watch -- --verbose
```

## 📚 Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking
- Mock external dependencies
- Use realistic mock data
- Verify mock interactions

### 3. Database Testing
- Use separate test database
- Clean up data between tests
- Test both success and failure scenarios

### 4. Error Handling
- Test error conditions
- Verify error messages
- Test edge cases

### 5. Performance
- Keep tests fast
- Use appropriate timeouts
- Avoid unnecessary database operations

## 🚨 Common Issues

### 1. MongoDB Connection
- Ensure MongoDB is running
- Check connection string in `test.env`
- Verify database credentials

### 2. Test Timeouts
- Increase timeout in `jest-e2e.json`
- Check for hanging operations
- Verify cleanup in `afterAll`

### 3. Mock Issues
- Ensure mocks are properly configured
- Check mock return values
- Verify mock function calls

### 4. Environment Variables
- Check `test.env` file exists
- Verify variable names match code
- Ensure test environment is loaded

## 🔄 Continuous Integration

### GitHub Actions
Tests are automatically run on:
- Pull requests
- Push to main branch
- Scheduled runs

### Pre-commit Hooks
Consider adding pre-commit hooks to run tests before commits:
```bash
npm install --save-dev husky lint-staged
```

## 📖 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Testing Best Practices](https://docs.mongodb.com/drivers/node/current/fundamentals/testing/)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Use descriptive names
3. Test both success and failure cases
4. Add appropriate error handling
5. Update this documentation if needed

---

**Happy Testing! 🎉**
