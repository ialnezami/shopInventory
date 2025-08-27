import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../modules/products/schemas/product.schema';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';
import { Sale, SaleDocument } from '../../modules/sales/schemas/sale.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
  ) {}

  async seedAll() {
    try {
      this.logger.log('🌱 Starting database seeding...');
      
      await this.seedUsers();
      await this.seedProducts();
      await this.seedSales();
      
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedUsers() {
    const users = [
      {
        username: 'admin',
        email: 'admin@shopinventory.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vKzKqKq', // password: admin123
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
      {
        username: 'manager',
        email: 'manager@shopinventory.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vKzKqKq', // password: manager123
        role: 'manager',
        firstName: 'Store',
        lastName: 'Manager',
        isActive: true,
      },
      {
        username: 'cashier',
        email: 'cashier@shopinventory.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/vKzKqKq', // password: cashier123
        role: 'cashier',
        firstName: 'Cashier',
        lastName: 'User',
        isActive: true,
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userModel.findOne({ email: userData.email });
      if (!existingUser) {
        await this.userModel.create(userData);
        this.logger.log(`👤 Created user: ${userData.username}`);
      }
    }
  }

  private async seedProducts() {
    const products = [
      {
        name: 'iPhone 15 Pro',
        sku: 'IPH15PRO-128',
        description: 'Latest iPhone with advanced camera system',
        category: 'Electronics',
        subcategory: 'Smartphones',
        price: {
          cost: 800,
          selling: 999,
          currency: 'USD',
        },
        inventory: {
          quantity: 25,
          minStock: 5,
          location: 'Main Store',
        },
        variants: [
          { name: 'Color', value: 'Titanium', priceModifier: 0 },
          { name: 'Storage', value: '128GB', priceModifier: 0 },
        ],
        images: [],
        weight: 0.187,
        dimensions: { length: 14.6, width: 7.1, height: 0.8 },
        isActive: true,
      },
      {
        name: 'Samsung Galaxy S24',
        sku: 'SAMS24-256',
        description: 'Android flagship with AI features',
        category: 'Electronics',
        subcategory: 'Smartphones',
        price: {
          cost: 700,
          selling: 899,
          currency: 'USD',
        },
        inventory: {
          quantity: 20,
          minStock: 5,
          location: 'Main Store',
        },
        variants: [
          { name: 'Color', value: 'Black', priceModifier: 0 },
          { name: 'Storage', value: '256GB', priceModifier: 50 },
        ],
        images: [],
        weight: 0.168,
        dimensions: { length: 14.7, width: 7.1, height: 0.8 },
        isActive: true,
      },
      {
        name: 'MacBook Air M2',
        sku: 'MBA-M2-512',
        description: 'Lightweight laptop with M2 chip',
        category: 'Electronics',
        subcategory: 'Laptops',
        price: {
          cost: 1000,
          selling: 1299,
          currency: 'USD',
        },
        inventory: {
          quantity: 15,
          minStock: 3,
          location: 'Main Store',
        },
        variants: [
          { name: 'Color', value: 'Space Gray', priceModifier: 0 },
          { name: 'Storage', value: '512GB', priceModifier: 200 },
        ],
        images: [],
        weight: 1.24,
        dimensions: { length: 30.4, width: 21.5, height: 1.1 },
        isActive: true,
      },
    ];

    for (const productData of products) {
      const existingProduct = await this.productModel.findOne({ sku: productData.sku });
      if (!existingProduct) {
        await this.productModel.create(productData);
        this.logger.log(`📱 Created product: ${productData.name}`);
      }
    }
  }

  private async seedSales() {
    // Get sample products and users for sales
    const products = await this.productModel.find().limit(3);
    const users = await this.userModel.find({ role: 'cashier' }).limit(1);
    
    if (products.length === 0 || users.length === 0) {
      this.logger.warn('⚠️ No products or users found for sales seeding');
      return;
    }

    const sales = [
      {
        transactionNumber: 'SALE-001',
        customer: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1234567890',
        },
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            unitPrice: products[0].price.selling,
            totalPrice: products[0].price.selling,
          },
        ],
        subtotal: products[0].price.selling,
        tax: products[0].price.selling * 0.08,
        total: products[0].price.selling * 1.08,
        paymentMethod: 'credit_card',
        status: 'completed',
        cashier: users[0]._id,
        notes: 'First sale of the day',
      },
    ];

    for (const saleData of sales) {
      const existingSale = await this.saleModel.findOne({ transactionNumber: saleData.transactionNumber });
      if (!existingSale) {
        await this.saleModel.create(saleData);
        this.logger.log(`💰 Created sale: ${saleData.transactionNumber}`);
      }
    }
  }

  async clearAll() {
    try {
      this.logger.log('🗑️ Clearing all data...');
      
      await this.saleModel.deleteMany({});
      await this.productModel.deleteMany({});
      await this.userModel.deleteMany({});
      
      this.logger.log('✅ All data cleared successfully!');
    } catch (error) {
      this.logger.error('❌ Data clearing failed:', error);
      throw error;
    }
  }
}
