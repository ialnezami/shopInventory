import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../modules/products/schemas/product.schema';
import { User, UserDocument } from '../../modules/auth/schemas/user.schema';
import { Sale, SaleDocument } from '../../modules/sales/schemas/sale.schema';
import { Customer, CustomerDocument } from '../../modules/customers/schemas/customer.schema';
import { Invoice, InvoiceDocument } from '../../modules/invoices/schemas/invoice.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async seedAll() {
    try {
      this.logger.log('🌱 Starting database seeding...');
      
      await this.seedUsers();
      await this.seedProducts();
      await this.seedCustomers();
      await this.seedSales();
      await this.seedInvoices();
      
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
        description: 'Premium Android smartphone with AI features',
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
          { name: 'Color', value: 'Phantom Black', priceModifier: 0 },
          { name: 'Storage', value: '256GB', priceModifier: 50 },
        ],
        images: [],
        weight: 0.168,
        dimensions: { length: 14.7, width: 7.0, height: 0.7 },
        isActive: true,
      },
      {
        name: 'MacBook Pro 14"',
        sku: 'MBP14-M2',
        description: 'Professional laptop with M2 chip',
        category: 'Electronics',
        subcategory: 'Laptops',
        price: {
          cost: 1800,
          selling: 2199,
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
        weight: 1.6,
        dimensions: { length: 31.3, width: 22.1, height: 1.6 },
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

  private async seedCustomers() {
    const customers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0101',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        businessInfo: {
          type: 'individual',
        },
        statistics: {
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        loyalty: {
          loyaltyPoints: 0,
          tier: 'bronze',
          memberSince: new Date(),
        },
        metadata: {
          preferences: ['Electronics', 'Gaming'],
          notes: 'Regular customer, prefers premium products',
          tags: ['premium', 'tech-savvy'],
        },
        isActive: true,
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        address: {
          street: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
        },
        businessInfo: {
          type: 'business',
          companyName: 'Tech Solutions Inc.',
          taxId: 'TAX123456',
          website: 'www.techsolutions.com',
        },
        statistics: {
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        loyalty: {
          loyaltyPoints: 0,
          tier: 'bronze',
          memberSince: new Date(),
        },
        metadata: {
          preferences: ['Business Software', 'Hardware'],
          notes: 'Business customer, bulk orders',
          tags: ['business', 'bulk-orders'],
        },
        isActive: true,
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1-555-0103',
        address: {
          street: '789 Pine Road',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        businessInfo: {
          type: 'individual',
        },
        statistics: {
          totalSpent: 0,
          totalOrders: 0,
          averageOrderValue: 0,
        },
        loyalty: {
          loyaltyPoints: 0,
          tier: 'bronze',
          memberSince: new Date(),
        },
        metadata: {
          preferences: ['Mobile Accessories', 'Audio'],
          notes: 'Student customer, budget-conscious',
          tags: ['student', 'budget'],
        },
        isActive: true,
      },
    ];

    for (const customerData of customers) {
      const existingCustomer = await this.customerModel.findOne({ email: customerData.email });
      if (!existingCustomer) {
        await this.customerModel.create(customerData);
        this.logger.log(`👥 Created customer: ${customerData.firstName} ${customerData.lastName}`);
      }
    }
  }

  private async seedSales() {
    // Get sample products and customers for sales
    const products = await this.productModel.find().limit(3);
    const customers = await this.customerModel.find().limit(2);
    const users = await this.userModel.find({ role: { $in: ['manager', 'cashier'] } }).limit(2);

    if (products.length === 0 || customers.length === 0 || users.length === 0) {
      this.logger.warn('⚠️ Skipping sales seeding - insufficient products, customers, or users');
      return;
    }

    const sales = [
      {
        transactionNumber: 'TXN20250101001',
        customer: customers[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            unitPrice: products[0].price.selling,
            discount: 0,
            total: products[0].price.selling,
          },
        ],
        payment: {
          method: 'card',
          amount: products[0].price.selling,
          status: 'completed',
          reference: 'CARD123456',
          cardLast4: '1234',
          cardBrand: 'Visa',
        },
        totals: {
          subtotal: products[0].price.selling,
          tax: products[0].price.selling * 0.1,
          discount: 0,
          total: products[0].price.selling * 1.1,
        },
        status: 'completed',
        staff: users[0]._id,
        notes: 'First sale of the day',
        invoiceNumber: 'INV001',
        isInvoiceGenerated: false,
      },
      {
        transactionNumber: 'TXN20250101002',
        customer: customers[1]._id,
        items: [
          {
            product: products[1]._id,
            quantity: 2,
            unitPrice: products[1].price.selling,
            discount: 50,
            total: (products[1].price.selling * 2) - 50,
          },
        ],
        payment: {
          method: 'cash',
          amount: (products[1].price.selling * 2) - 50,
          status: 'completed',
        },
        totals: {
          subtotal: products[1].price.selling * 2,
          tax: (products[1].price.selling * 2) * 0.1,
          discount: 50,
          total: ((products[1].price.selling * 2) * 1.1) - 50,
        },
        status: 'completed',
        staff: users[1]._id,
        notes: 'Bulk order with discount',
        invoiceNumber: 'INV002',
        isInvoiceGenerated: false,
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

  private async seedInvoices() {
    // Get sample sales and users for invoices
    const sales = await this.saleModel.find().limit(2);
    const users = await this.userModel.find({ role: { $in: ['admin', 'manager'] } }).limit(1);

    if (sales.length === 0 || users.length === 0) {
      this.logger.warn('⚠️ Skipping invoice seeding - insufficient sales or users');
      return;
    }

    const invoices = [
      {
        invoiceNumber: 'INV-202501-001',
        sale: sales[0]._id,
        customer: sales[0].customer,
        issuedBy: users[0]._id,
        items: [
          {
            product: sales[0].items[0].product,
            quantity: sales[0].items[0].quantity,
            unitPrice: sales[0].items[0].unitPrice,
            discount: sales[0].items[0].discount,
            total: sales[0].items[0].total,
            description: 'iPhone 15 Pro - 128GB',
          },
        ],
        totals: {
          subtotal: sales[0].totals.subtotal,
          tax: sales[0].totals.tax,
          discount: sales[0].totals.discount,
          total: sales[0].totals.total,
          taxRate: 0.1,
        },
        payment: {
          method: sales[0].payment.method,
          status: 'paid',
          paidAmount: sales[0].payment.amount,
          paidDate: new Date(),
          reference: sales[0].payment.reference,
        },
        dates: {
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          issueDate: new Date(),
          terms: 'Net 30',
        },
        company: {
          companyName: 'TechStore Pro',
          address: {
            street: '123 Tech Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA',
          },
          phone: '+1-555-TECH',
          email: 'info@techstorepro.com',
          website: 'www.techstorepro.com',
          logo: '',
        },
        addresses: {
          billingAddress: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
          },
        },
        notes: 'Thank you for your purchase!',
        terms: 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
        status: 'generated',
        pdfPath: '',
        isEmailSent: false,
      },
    ];

    for (const invoiceData of invoices) {
      const existingInvoice = await this.invoiceModel.findOne({ invoiceNumber: invoiceData.invoiceNumber });
      if (!existingInvoice) {
        await this.invoiceModel.create(invoiceData);
        this.logger.log(`📄 Created invoice: ${invoiceData.invoiceNumber}`);
      }
    }
  }

  async clearAll() {
    try {
      this.logger.log('🧹 Starting database clearing...');
      
      await this.invoiceModel.deleteMany({});
      await this.saleModel.deleteMany({});
      await this.customerModel.deleteMany({});
      await this.productModel.deleteMany({});
      await this.userModel.deleteMany({});
      
      this.logger.log('✅ Database clearing completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database clearing failed:', error);
      throw error;
    }
  }
}
