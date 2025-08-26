import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto, staffId: string): Promise<Sale> {
    // Generate unique transaction number
    const transactionNumber = await this.generateTransactionNumber();
    
    // Validate products and check stock
    await this.validateSaleItems(createSaleDto.items);
    
    // Create the sale
    const sale = new this.saleModel({
      ...createSaleDto,
      transactionNumber,
      staff: new Types.ObjectId(staffId),
      status: createSaleDto.status || 'completed',
    });

    const savedSale = await sale.save();
    
    // Update inventory for each product
    await this.updateInventoryAfterSale(createSaleDto.items);
    
    return savedSale.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'staff', select: 'name email' },
      { path: 'items.product', select: 'name sku price' }
    ]);
  }

  async findAll(query: any = {}): Promise<Sale[]> {
    const { 
      customer, 
      staff, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    let filter: any = {};

    // Customer filter
    if (customer) {
      filter.customer = new Types.ObjectId(customer);
    }

    // Staff filter
    if (staff) {
      filter.staff = new Types.ObjectId(staff);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.saleModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name email' },
        { path: 'items.product', select: 'name sku price' }
      ])
      .exec();
  }

  async findOne(id: string): Promise<Sale> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sale ID');
    }

    const sale = await this.saleModel
      .findById(id)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name email' },
        { path: 'items.product', select: 'name sku price' }
      ])
      .exec();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async findByTransactionNumber(transactionNumber: string): Promise<Sale> {
    const sale = await this.saleModel
      .findOne({ transactionNumber })
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name email' },
        { path: 'items.product', select: 'name sku price' }
      ])
      .exec();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async updateStatus(id: string, status: string): Promise<Sale> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid sale ID');
    }

    const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const sale = await this.saleModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'staff', select: 'name email' },
        { path: 'items.product', select: 'name sku price' }
      ])
      .exec();

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async getDailySales(date: string): Promise<any> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await this.saleModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      })
      .populate('items.product', 'name sku')
      .exec();

    const totalSales = sales.reduce((sum, sale) => sum + sale.totals.total, 0);
    const totalTransactions = sales.length;
    const topProducts = this.getTopProducts(sales);

    return {
      date,
      totalSales,
      totalTransactions,
      topProducts,
      sales
    };
  }

  async getSalesSummary(startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const sales = await this.saleModel
      .find({
        createdAt: { $gte: start, $lte: end },
        status: 'completed'
      })
      .exec();

    const totalSales = sales.reduce((sum, sale) => sum + sale.totals.total, 0);
    const totalTransactions = sales.length;
    const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Payment method breakdown
    const paymentMethods = {};
    sales.forEach(sale => {
      const method = sale.payment.method;
      paymentMethods[method] = (paymentMethods[method] || 0) + sale.totals.total;
    });

    return {
      startDate,
      endDate,
      totalSales,
      totalTransactions,
      averageTransactionValue,
      paymentMethods
    };
  }

  private async generateTransactionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of sales for today
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaySalesCount = await this.saleModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    return `TXN${dateStr}${(todaySalesCount + 1).toString().padStart(4, '0')}`;
  }

  private async validateSaleItems(items: any[]): Promise<void> {
    for (const item of items) {
      const product = await this.productsService.findOne(item.product);
      
      if (product.inventory.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.inventory.quantity}, Requested: ${item.quantity}`
        );
      }
    }
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

  private getTopProducts(sales: Sale[]): any[] {
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productSales[productId].totalQuantity += item.quantity;
        productSales[productId].totalRevenue += item.total;
      });
    });

    return Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }
}
