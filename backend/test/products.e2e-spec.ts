import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection, connect, disconnect } from 'mongoose';
import { ConfigService } from '@nestjs/config';

describe('Products API (e2e)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = moduleFixture.get<ConfigService>(ConfigService);
    
    await app.init();

    // Connect to test database
    const mongoUri = configService.get<string>('MONGODB_URI') || 'mongodb://admin:password123@localhost:27017/shop_inventory_test?authSource=admin';
    mongoConnection = await connect(mongoUri);
  });

  afterAll(async () => {
    await disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      const createProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Test Supplier',
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe(createProductDto.name);
          expect(res.body.sku).toBe(createProductDto.sku);
          expect(res.body.price).toBe(createProductDto.price);
          expect(res.body.stock).toBe(createProductDto.stock);
        });
    });

    it('should return 400 for invalid product data', () => {
      const invalidProduct = {
        name: '', // Invalid: empty name
        sku: 'TEST-001',
        price: -10, // Invalid: negative price
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });

    it('should return 400 for duplicate SKU', async () => {
      const product1 = {
        name: 'Product 1',
        sku: 'DUPLICATE-SKU',
        description: 'First product',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Supplier 1',
      };

      const product2 = {
        name: 'Product 2',
        sku: 'DUPLICATE-SKU', // Same SKU
        description: 'Second product',
        price: 149.99,
        cost: 75.00,
        category: 'Electronics',
        stock: 50,
        minStock: 5,
        supplier: 'Supplier 2',
      };

      // Create first product
      await request(app.getHttpServer())
        .post('/products')
        .send(product1)
        .expect(201);

      // Try to create second product with same SKU
      return request(app.getHttpServer())
        .post('/products')
        .send(product2)
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('should return empty array when no products exist', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect([]);
    });

    it('should return all products', async () => {
      const products = [
        {
          name: 'Product 1',
          sku: 'PROD-001',
          description: 'First product',
          price: 99.99,
          cost: 50.00,
          category: 'Electronics',
          stock: 100,
          minStock: 10,
          supplier: 'Supplier 1',
        },
        {
          name: 'Product 2',
          sku: 'PROD-002',
          description: 'Second product',
          price: 149.99,
          cost: 75.00,
          category: 'Clothing',
          stock: 50,
          minStock: 5,
          supplier: 'Supplier 2',
        },
      ];

      // Create products
      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send(product)
          .expect(201);
      }

      // Get all products
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0].name).toBe(products[0].name);
          expect(res.body[1].name).toBe(products[1].name);
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a product by id', async () => {
      const createProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Test Supplier',
      };

      // Create product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      const productId = createResponse.body._id;

      // Get product by id
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(productId);
          expect(res.body.name).toBe(createProductDto.name);
          expect(res.body.sku).toBe(createProductDto.sku);
        });
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      return request(app.getHttpServer())
        .get(`/products/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid id format', () => {
      return request(app.getHttpServer())
        .get('/products/invalid-id')
        .expect(400);
    });
  });

  describe('/products/sku/:sku (GET)', () => {
    it('should return a product by SKU', async () => {
      const createProductDto = {
        name: 'Test Product',
        sku: 'UNIQUE-SKU-001',
        description: 'Test Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Test Supplier',
      };

      // Create product
      await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      // Get product by SKU
      return request(app.getHttpServer())
        .get('/products/sku/UNIQUE-SKU-001')
        .expect(200)
        .expect((res) => {
          expect(res.body.sku).toBe('UNIQUE-SKU-001');
          expect(res.body.name).toBe(createProductDto.name);
        });
    });

    it('should return 404 for non-existent SKU', () => {
      return request(app.getHttpServer())
        .get('/products/sku/NONEXISTENT-SKU')
        .expect(404);
    });
  });

  describe('/products/:id (PUT)', () => {
    it('should update a product', async () => {
      const createProductDto = {
        name: 'Original Product',
        sku: 'UPDATE-001',
        description: 'Original Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Original Supplier',
      };

      // Create product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      const productId = createResponse.body._id;

      // Update product
      const updateData = {
        name: 'Updated Product',
        price: 149.99,
        description: 'Updated Description',
      };

      return request(app.getHttpServer())
        .put(`/products/${productId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.price).toBe(updateData.price);
          expect(res.body.description).toBe(updateData.description);
          expect(res.body.sku).toBe(createProductDto.sku); // Should remain unchanged
        });
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Name' };

      return request(app.getHttpServer())
        .put(`/products/${fakeId}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/products/:id/stock (PUT)', () => {
    it('should update product stock', async () => {
      const createProductDto = {
        name: 'Stock Product',
        sku: 'STOCK-001',
        description: 'Product for stock testing',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Stock Supplier',
      };

      // Create product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      const productId = createResponse.body._id;

      // Update stock
      const newStock = 75;

      return request(app.getHttpServer())
        .put(`/products/${productId}/stock`)
        .send({ stock: newStock })
        .expect(200)
        .expect((res) => {
          expect(res.body.stock).toBe(newStock);
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', async () => {
      const createProductDto = {
        name: 'Delete Product',
        sku: 'DELETE-001',
        description: 'Product to be deleted',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Delete Supplier',
      };

      // Create product
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      const productId = createResponse.body._id;

      // Delete product
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);

      // Verify product is deleted
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });

    it('should return 404 for non-existent product', () => {
      const fakeId = '507f1f77bcf86cd799439011';
      return request(app.getHttpServer())
        .delete(`/products/${fakeId}`)
        .expect(404);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate required fields', () => {
      const invalidProduct = {
        // Missing required fields
        price: 99.99,
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });

    it('should validate price is positive', () => {
      const invalidProduct = {
        name: 'Test Product',
        sku: 'PRICE-001',
        description: 'Test Description',
        price: -10, // Invalid negative price
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Test Supplier',
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });

    it('should validate stock is non-negative', () => {
      const invalidProduct = {
        name: 'Test Product',
        sku: 'STOCK-001',
        description: 'Test Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: -5, // Invalid negative stock
        minStock: 10,
        supplier: 'Test Supplier',
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(400);
    });
  });
});
