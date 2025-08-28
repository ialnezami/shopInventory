import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Helper to create mock MongoDB ObjectId
  createMockId: () => '507f1f77bcf86cd799439011',
  
  // Helper to create mock dates
  createMockDate: (dateString?: string) => new Date(dateString || '2024-01-01T00:00:00.000Z'),
  
  // Helper to create mock products
  createMockProduct: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'Test Description',
    price: 99.99,
    cost: 50.00,
    category: 'Electronics',
    stock: 100,
    minStock: 10,
    supplier: 'Test Supplier',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  // Helper to create mock users
  createMockUser: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'admin',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  // Helper to create mock sales
  createMockSale: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439012',
    customer: '507f1f77bcf86cd799439013',
    items: [
      {
        product: '507f1f77bcf86cd799439011',
        quantity: 2,
        price: 99.99,
        total: 199.98,
      },
    ],
    total: 199.98,
    paymentMethod: 'cash',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};

// Extend global types
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockId: () => string;
        createMockDate: (dateString?: string) => Date;
        createMockProduct: (overrides?: any) => any;
        createMockUser: (overrides?: any) => any;
        createMockSale: (overrides?: any) => any;
      };
    }
  }
}
