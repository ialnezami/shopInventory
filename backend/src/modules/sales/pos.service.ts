import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class PosService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private productsService: ProductsService,
    private customersService: CustomersService,
  ) {}

  async createQuickSale(saleData: any, staffId: string): Promise<Sale> {
    // Validate and process sale data
    const processedSale = await this.processSaleData(saleData);
    
    // Create the sale
    const sale = new this.saleModel({
      ...processedSale,
      staff: new Types.ObjectId(staffId),
      status: 'completed',
      createdAt: new Date(),
    });

    const savedSale = await sale.save();
    
    // Update inventory
    await this.updateInventoryAfterSale(processedSale.items);
    
    // Update customer statistics if customer exists
    if (processedSale.customer) {
      await this.customersService.updateStatistics(
        processedSale.customer.toString(),
        processedSale.totals.total
      );
    }

    return savedSale.populate([
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'staff', select: 'username firstName lastName' },
      { path: 'items.product', select: 'name sku price inventory' }
    ]);
  }

  async getProductForSale(productId: string): Promise<any> {
    const product = await this.productsService.findOne(productId);
    
    if (!product.isActive) {
      throw new BadRequestException('Product is not active');
    }

    if (product.inventory.quantity <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    return {
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price.selling,
      availableQuantity: product.inventory.quantity,
      category: product.category,
      image: product.images?.[0] || null,
    };
  }

  async searchProductsForSale(query: string): Promise<any[]> {
    const products = await this.productsService.search({
      search: query,
      inStock: true,
      limit: 10
    });

    return products.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.price.selling,
      availableQuantity: product.inventory.quantity,
      category: product.category,
      image: product.images?.[0] || null,
    }));
  }

  async getCustomerForSale(customerId: string): Promise<any> {
    const customer = await this.customersService.findOne(customerId);
    
    return {
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      loyaltyTier: customer.loyalty?.tier || 'bronze',
      loyaltyPoints: customer.loyalty?.loyaltyPoints || 0,
    };
  }

  async searchCustomersForSale(query: string): Promise<any[]> {
    const customers = await this.customersService.findAll({
      search: query,
      isActive: true,
      limit: 10
    });

    return customers.map(customer => ({
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      loyaltyTier: customer.loyalty?.tier || 'bronze',
      loyaltyPoints: customer.loyalty?.loyaltyPoints || 0,
    }));
  }

  async getDailySummary(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await this.saleModel
      .find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: 'completed'
      })
      .exec();

    const totalSales = todaySales.reduce((sum, sale) => sum + sale.totals.total, 0);
    const totalTransactions = todaySales.length;
    const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Payment method breakdown
    const paymentMethods = {};
    todaySales.forEach(sale => {
      const method = sale.payment.method;
      paymentMethods[method] = (paymentMethods[method] || 0) + sale.totals.total;
    });

    // Hourly breakdown
    const hourlySales = new Array(24).fill(0);
    todaySales.forEach(sale => {
      const hour = sale.createdAt.getHours();
      hourlySales[hour] += sale.totals.total;
    });

    return {
      date: today.toISOString().split('T')[0],
      totalSales,
      totalTransactions,
      averageTransactionValue,
      paymentMethods,
      hourlySales,
    };
  }

  async getRecentSales(limit: number = 10): Promise<Sale[]> {
    return this.saleModel
      .find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate([
        { path: 'customer', select: 'firstName lastName' },
        { path: 'staff', select: 'username firstName lastName' },
        { path: 'items.product', select: 'name sku' }
      ])
      .exec();
  }

  private async processSaleData(saleData: any): Promise<any> {
    const { items, customer, paymentMethod, notes } = saleData;

    if (!items || items.length === 0) {
      throw new BadRequestException('Sale must contain at least one item');
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const product = await this.productsService.findOne(item.product);
      
      if (product.inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`
        );
      }

      const itemTotal = item.quantity * product.price.selling;
      const itemDiscount = item.discount || 0;
      
      subtotal += itemTotal;
      totalDiscount += itemDiscount;

      // Update item with calculated values
      item.unitPrice = product.price.selling;
      item.total = itemTotal - itemDiscount;
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - totalDiscount;

    // Generate transaction number
    const transactionNumber = await this.generateTransactionNumber();

    return {
      transactionNumber,
      customer: customer ? new Types.ObjectId(customer) : undefined,
      items,
      payment: {
        method: paymentMethod || 'cash',
        amount: total,
        status: 'completed',
      },
      totals: {
        subtotal,
        tax,
        discount: totalDiscount,
        total,
      },
      notes,
    };
  }

  private async generateTransactionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaySalesCount = await this.saleModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    return `POS${dateStr}${(todaySalesCount + 1).toString().padStart(4, '0')}`;
  }

  private async updateInventoryAfterSale(items: any[]): Promise<void> {
    for (const item of items) {
      await this.productsService.updateStock(
        item.product,
        item.quantity,
        'subtract'
      );
    }
  }
}
