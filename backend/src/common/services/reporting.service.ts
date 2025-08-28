import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { Sale, SaleDocument } from '../../modules/sales/schemas/sale.schema';
import { Product, ProductDocument } from '../../modules/products/schemas/product.schema';
import { Customer, CustomerDocument } from '../../modules/customers/schemas/customer.schema';
import { Invoice, InvoiceDocument } from '../../modules/invoices/schemas/invoice.schema';

export interface SalesReport {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: string;
    quantity: number;
    revenue: number;
    percentage: number;
  }>;
  topCustomers: Array<{
    customer: string;
    orders: number;
    totalSpent: number;
    percentage: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  paymentMethods: Record<string, number>;
  trends: {
    growth: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Array<{
    product: string;
    currentStock: number;
    minStock: number;
    daysUntilStockout: number;
    value: number;
  }>;
  stockLevels: Array<{
    product: string;
    currentStock: number;
    maxStock: number;
    utilization: number;
    value: number;
  }>;
  stockMovements: Array<{
    product: string;
    type: 'in' | 'out';
    quantity: number;
    date: string;
    reason: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  recommendations: string[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  customer?: string;
  product?: string;
  limit?: number;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  // ==================== SALES REPORTS ====================

  async getDailySalesSummary(date?: string): Promise<any> {
    try {
      const targetDate = date ? moment(date) : moment();
      const startOfDay = targetDate.startOf('day').toDate();
      const endOfDay = targetDate.endOf('day').toDate();

      const dailySales = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totals.total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$totals.total' },
            totalItems: { $sum: { $sum: '$items.quantity' } },
          },
        },
      ]);

      const salesByHour = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            sales: { $sum: '$totals.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const topProducts = await this.getTopProductsByPeriod(startOfDay, endOfDay, 5);
      const topCustomers = await this.getTopCustomersByPeriod(startOfDay, endOfDay, 5);

      return {
        date: targetDate.format('YYYY-MM-DD'),
        summary: dailySales[0] || {
          totalSales: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalItems: 0,
        },
        salesByHour,
        topProducts,
        topCustomers,
        comparison: await this.getDailyComparison(targetDate),
      };
    } catch (error) {
      this.logger.error('Failed to generate daily sales summary:', error);
      throw error;
    }
  }

  async getSalesByPeriod(filters: ReportFilters): Promise<SalesReport> {
    try {
      const { startDate, endDate, category, customer, limit = 10 } = filters;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      // Build match conditions
      const matchConditions: any = {
        createdAt: { $gte: start, $lte: end },
        status: 'completed',
      };

      if (customer) {
        matchConditions.customer = customer;
      }

      // Get sales data
      const salesData = await this.saleModel.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $lookup: {
            from: 'customers',
            localField: 'customer',
            foreignField: '_id',
            as: 'customerDetails',
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totals.total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$totals.total' },
            totalItems: { $sum: { $sum: '$items.quantity' } },
            paymentMethods: { $addToSet: '$payment.method' },
          },
        },
      ]);

      // Get top products
      const topProducts = await this.getTopProductsByPeriod(start, end, limit, category);

      // Get top customers
      const topCustomers = await this.getTopCustomersByPeriod(start, end, limit);

      // Get sales by day
      const salesByDay = await this.saleModel.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totals.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get payment method breakdown
      const paymentMethods = await this.saleModel.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: '$payment.method',
            total: { $sum: '$totals.total' },
            count: { $sum: 1 },
          },
        },
      ]);

      // Calculate trends
      const trends = await this.calculateSalesTrends(start, end);

      const result = salesData[0] || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0,
      };

      return {
        period: `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
        totalSales: result.totalSales,
        totalOrders: result.totalOrders,
        averageOrderValue: Math.round(result.averageOrderValue * 100) / 100,
        topProducts,
        topCustomers,
        salesByDay,
        paymentMethods: this.formatPaymentMethods(paymentMethods),
        trends,
      };
    } catch (error) {
      this.logger.error('Failed to generate sales report by period:', error);
      throw error;
    }
  }

  async getTopProductsReport(filters: ReportFilters): Promise<any> {
    try {
      const { startDate, endDate, category, limit = 20 } = filters;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      const matchConditions: any = {
        createdAt: { $gte: start, $lte: end },
        status: 'completed',
      };

      const topProducts = await this.saleModel.aggregate([
        { $match: matchConditions },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $group: {
            _id: '$items.product',
            productName: { $first: { $arrayElemAt: ['$productDetails.name', 0] } },
            category: { $first: { $arrayElemAt: ['$productDetails.category', 0] } },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
            averagePrice: { $avg: '$items.unitPrice' },
            orderCount: { $sum: 1 },
          },
        },
        {
          $match: category ? { category } : {},
        },
        {
          $addFields: {
            revenuePercentage: { $multiply: [{ $divide: ['$totalRevenue', 100] }, 100] },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
      ]);

      // Calculate total revenue for percentage calculation
      const totalRevenue = topProducts.reduce((sum, product) => sum + product.totalRevenue, 0);

      return {
        period: `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
        totalRevenue,
        topProducts: topProducts.map(product => ({
          ...product,
          revenuePercentage: Math.round((product.totalRevenue / totalRevenue) * 100 * 100) / 100,
        })),
        category: category || 'All Categories',
      };
    } catch (error) {
      this.logger.error('Failed to generate top products report:', error);
      throw error;
    }
  }

  async getCustomerSalesReport(filters: ReportFilters): Promise<any> {
    try {
      const { startDate, endDate, limit = 20 } = filters;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      const customerSales = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'completed',
            customer: { $exists: true, $ne: null },
          },
        },
        {
          $lookup: {
            from: 'customers',
            localField: 'customer',
            foreignField: '_id',
            as: 'customerDetails',
          },
        },
        {
          $group: {
            _id: '$customer',
            customerName: { $first: { $concat: ['$customerDetails.firstName', ' ', '$customerDetails.lastName'] } },
            email: { $first: { $arrayElemAt: ['$customerDetails.email', 0] } },
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$totals.total' },
            averageOrderValue: { $avg: '$totals.total' },
            totalItems: { $sum: { $sum: '$items.quantity' } },
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' },
          },
        },
        {
          $addFields: {
            customerLifetime: {
              $divide: [
                { $subtract: ['$lastOrder', '$firstOrder'] },
                1000 * 60 * 60 * 24, // Convert to days
              ],
            },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: limit },
      ]);

      // Calculate customer segments
      const segments = this.calculateCustomerSegments(customerSales);

      return {
        period: `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
        totalCustomers: customerSales.length,
        totalRevenue: customerSales.reduce((sum, customer) => sum + customer.totalSpent, 0),
        customerSales,
        segments,
        averageCustomerValue: Math.round(
          customerSales.reduce((sum, customer) => sum + customer.totalSpent, 0) / customerSales.length * 100
        ) / 100,
      };
    } catch (error) {
      this.logger.error('Failed to generate customer sales report:', error);
      throw error;
    }
  }

  // ==================== INVENTORY REPORTS ====================

  async getStockLevelReport(): Promise<any> {
    try {
      const stockLevels = await this.productModel.aggregate([
        {
          $addFields: {
            utilization: {
              $multiply: [
                { $divide: ['$inventory.quantity', '$inventory.maxStock'] },
                100,
              ],
            },
            stockValue: { $multiply: ['$inventory.quantity', '$price.cost'] },
          },
        },
        {
          $project: {
            name: 1,
            sku: 1,
            category: 1,
            currentStock: '$inventory.quantity',
            maxStock: '$inventory.maxStock',
            minStock: '$inventory.minStock',
            utilization: { $round: ['$utilization', 2] },
            stockValue: { $round: ['$stockValue', 2] },
            status: {
              $cond: {
                if: { $lte: ['$inventory.quantity', '$inventory.minStock'] },
                then: 'Low Stock',
                else: {
                  $cond: {
                    if: { $gte: ['$inventory.quantity', '$inventory.maxStock'] },
                    then: 'Overstocked',
                    else: 'Normal',
                  },
                },
              },
            },
          },
        },
        { $sort: { utilization: -1 } },
      ]);

      const summary = {
        totalProducts: stockLevels.length,
        lowStockCount: stockLevels.filter(p => p.status === 'Low Stock').length,
        overstockedCount: stockLevels.filter(p => p.status === 'Overstocked').length,
        normalCount: stockLevels.filter(p => p.status === 'Normal').length,
        totalValue: Math.round(stockLevels.reduce((sum, p) => sum + p.stockValue, 0) * 100) / 100,
        averageUtilization: Math.round(
          stockLevels.reduce((sum, p) => sum + p.utilization, 0) / stockLevels.length * 100
        ) / 100,
      };

      return {
        summary,
        stockLevels,
        recommendations: this.generateStockRecommendations(stockLevels),
      };
    } catch (error) {
      this.logger.error('Failed to generate stock level report:', error);
      throw error;
    }
  }

  async getLowStockReport(): Promise<any> {
    try {
      const lowStockItems = await this.productModel.aggregate([
        {
          $match: {
            'inventory.quantity': { $lte: '$inventory.minStock' },
          },
        },
        {
          $addFields: {
            daysUntilStockout: {
              $divide: ['$inventory.quantity', { $ifNull: ['$inventory.dailyUsage', 1] }],
            },
            stockValue: { $multiply: ['$inventory.quantity', '$price.cost'] },
            reorderQuantity: {
              $subtract: ['$inventory.maxStock', '$inventory.quantity'],
            },
          },
        },
        {
          $project: {
            name: 1,
            sku: 1,
            category: 1,
            currentStock: '$inventory.quantity',
            minStock: '$inventory.minStock',
            maxStock: '$inventory.maxStock',
            daysUntilStockout: { $round: ['$daysUntilStockout', 1] },
            stockValue: { $round: ['$stockValue', 2] },
            reorderQuantity: 1,
            urgency: {
              $cond: {
                if: { $lte: ['$daysUntilStockout', 7] },
                then: 'Critical',
                else: {
                  $cond: {
                    if: { $lte: ['$daysUntilStockout', 14] },
                    then: 'High',
                    else: 'Medium',
                  },
                },
              },
            },
          },
        },
        { $sort: { daysUntilStockout: 1 } },
      ]);

      const summary = {
        totalLowStockItems: lowStockItems.length,
        criticalItems: lowStockItems.filter(item => item.urgency === 'Critical').length,
        highPriorityItems: lowStockItems.filter(item => item.urgency === 'High').length,
        mediumPriorityItems: lowStockItems.filter(item => item.urgency === 'Medium').length,
        totalValue: Math.round(lowStockItems.reduce((sum, item) => sum + item.stockValue, 0) * 100) / 100,
      };

      return {
        summary,
        lowStockItems,
        recommendations: this.generateLowStockRecommendations(lowStockItems),
      };
    } catch (error) {
      this.logger.error('Failed to generate low stock report:', error);
      throw error;
    }
  }

  async getInventoryValuationReport(): Promise<any> {
    try {
      const valuation = await this.productModel.aggregate([
        {
          $addFields: {
            stockValue: { $multiply: ['$inventory.quantity', '$price.cost'] },
            retailValue: { $multiply: ['$inventory.quantity', '$price.selling'] },
            profitMargin: {
              $multiply: [
                { $divide: [{ $subtract: ['$price.selling', '$price.cost'] }, '$price.selling'] },
                100,
              ],
            },
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalCost: { $sum: '$stockValue' },
            totalRetail: { $sum: '$retailValue' },
            averageMargin: { $avg: '$profitMargin' },
            items: {
              $push: {
                name: '$name',
                sku: '$sku',
                quantity: '$inventory.quantity',
                costPrice: '$price.cost',
                sellingPrice: '$price.selling',
                stockValue: { $round: ['$stockValue', 2] },
                retailValue: { $round: ['$retailValue', 2] },
                profitMargin: { $round: ['$profitMargin', 2] },
              },
            },
          },
        },
        {
          $addFields: {
            totalProfit: { $subtract: ['$totalRetail', '$totalCost'] },
            profitPercentage: {
              $multiply: [
                { $divide: [{ $subtract: ['$totalRetail', '$totalCost'] }, '$totalRetail'] },
                100,
              ],
            },
          },
        },
        { $sort: { totalCost: -1 } },
      ]);

      const totalSummary = {
        totalProducts: valuation.reduce((sum, cat) => sum + cat.count, 0),
        totalCost: Math.round(valuation.reduce((sum, cat) => sum + cat.totalCost, 0) * 100) / 100,
        totalRetail: Math.round(valuation.reduce((sum, cat) => sum + cat.totalRetail, 0) * 100) / 100,
        totalProfit: Math.round(valuation.reduce((sum, cat) => sum + cat.totalProfit, 0) * 100) / 100,
        averageMargin: Math.round(
          valuation.reduce((sum, cat) => sum + cat.averageMargin, 0) / valuation.length * 100
        ) / 100,
      };

      return {
        summary: totalSummary,
        categories: valuation,
        recommendations: this.generateValuationRecommendations(valuation),
      };
    } catch (error) {
      this.logger.error('Failed to generate inventory valuation report:', error);
      throw error;
    }
  }

  async getStockMovementReport(filters: ReportFilters): Promise<any> {
    try {
      const { startDate, endDate, product } = filters;
      
      const start = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

      const matchConditions: any = {
        createdAt: { $gte: start, $lte: end },
      };

      if (product) {
        matchConditions['items.product'] = product;
      }

      // Get sales (stock out)
      const stockOut = await this.saleModel.aggregate([
        { $match: { ...matchConditions, status: 'completed' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        {
          $group: {
            _id: {
              product: '$items.product',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            },
            productName: { $first: { $arrayElemAt: ['$productDetails.name', 0] } },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
            type: { $first: 'out' },
            reason: { $first: 'Sale' },
          },
        },
      ]);

      // For now, we'll simulate stock in movements
      // In a real system, you'd have purchase orders or stock receipts
      const stockIn = stockOut.map(item => ({
        ...item,
        _id: { ...item._id, type: 'in' },
        quantity: Math.floor(item.quantity * 0.8), // Simulate restocking
        type: 'in',
        reason: 'Restock',
      }));

      const movements = [...stockOut, ...stockIn].sort((a, b) => 
        moment(a._id.date).diff(moment(b._id.date))
      );

      const summary = {
        period: `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
        totalMovements: movements.length,
        stockIn: stockIn.reduce((sum, item) => sum + item.quantity, 0),
        stockOut: stockOut.reduce((sum, item) => sum + item.quantity, 0),
        netMovement: stockIn.reduce((sum, item) => sum + item.quantity, 0) - 
                    stockOut.reduce((sum, item) => sum + item.quantity, 0),
      };

      return {
        summary,
        movements,
        recommendations: this.generateMovementRecommendations(movements),
      };
    } catch (error) {
      this.logger.error('Failed to generate stock movement report:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async getTopProductsByPeriod(start: Date, end: Date, limit: number, category?: string): Promise<any[]> {
    const matchConditions: any = {
      createdAt: { $gte: start, $lte: end },
      status: 'completed',
    };

    if (category) {
      matchConditions['productDetails.category'] = category;
    }

    return this.saleModel.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $group: {
          _id: '$items.product',
          product: { $first: { $arrayElemAt: ['$productDetails.name', 0] } },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);
  }

  private async getTopCustomersByPeriod(start: Date, end: Date, limit: number): Promise<any[]> {
    return this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: 'completed',
          customer: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $group: {
          _id: '$customer',
          customer: { $first: { $concat: ['$customerDetails.firstName', ' ', '$customerDetails.lastName'] } },
          orders: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
    ]);
  }

  private async calculateSalesTrends(start: Date, end: Date): Promise<any> {
    const midPoint = new Date((start.getTime() + end.getTime()) / 2);
    
    const firstHalf = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: midPoint },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totals.total' },
        },
      },
    ]);

    const secondHalf = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: { $gte: midPoint, $lte: end },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totals.total' },
        },
      },
    ]);

    const firstTotal = firstHalf[0]?.total || 0;
    const secondTotal = secondHalf[0]?.total || 0;
    
    const growth = firstTotal > 0 ? ((secondTotal - firstTotal) / firstTotal) * 100 : 0;
    
    return {
      growth: Math.round(growth * 100) / 100,
      trend: growth > 5 ? 'increasing' : growth < -5 ? 'decreasing' : 'stable',
    };
  }

  private async getDailyComparison(targetDate: moment.Moment): Promise<any> {
    const yesterday = targetDate.clone().subtract(1, 'day');
    const lastWeek = targetDate.clone().subtract(7, 'days');
    
    const todaySales = await this.getDailySalesSummary(targetDate.format('YYYY-MM-DD'));
    const yesterdaySales = await this.getDailySalesSummary(yesterday.format('YYYY-MM-DD'));
    const lastWeekSales = await this.getDailySalesSummary(lastWeek.format('YYYY-MM-DD'));

    return {
      vsYesterday: {
        sales: todaySales.summary.totalSales - yesterdaySales.summary.totalSales,
        orders: todaySales.summary.totalOrders - yesterdaySales.summary.totalOrders,
        percentage: yesterdaySales.summary.totalSales > 0 ? 
          ((todaySales.summary.totalSales - yesterdaySales.summary.totalSales) / yesterdaySales.summary.totalSales) * 100 : 0,
      },
      vsLastWeek: {
        sales: todaySales.summary.totalSales - lastWeekSales.summary.totalSales,
        orders: todaySales.summary.totalOrders - lastWeekSales.summary.totalOrders,
        percentage: lastWeekSales.summary.totalSales > 0 ? 
          ((todaySales.summary.totalSales - lastWeekSales.summary.totalSales) / lastWeekSales.summary.totalSales) * 100 : 0,
      },
    };
  }

  private formatPaymentMethods(paymentMethods: any[]): Record<string, number> {
    const result: Record<string, number> = {};
    paymentMethods.forEach(pm => {
      result[pm._id] = pm.total;
    });
    return result;
  }

  private calculateCustomerSegments(customers: any[]): any {
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    
    return {
      vip: customers.filter(c => c.totalSpent > totalRevenue * 0.1).length,
      regular: customers.filter(c => c.totalSpent > totalRevenue * 0.05 && c.totalSpent <= totalRevenue * 0.1).length,
      occasional: customers.filter(c => c.totalSpent <= totalRevenue * 0.05).length,
    };
  }

  private generateStockRecommendations(stockLevels: any[]): string[] {
    const recommendations: string[] = [];
    
    const lowStock = stockLevels.filter(p => p.status === 'Low Stock').length;
    const overstocked = stockLevels.filter(p => p.status === 'Overstocked').length;
    
    if (lowStock > 0) {
      recommendations.push(`Review ${lowStock} low stock items and consider reordering`);
    }
    
    if (overstocked > 0) {
      recommendations.push(`Consider promotions for ${overstocked} overstocked items`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Stock levels are well balanced');
    }
    
    return recommendations;
  }

  private generateLowStockRecommendations(lowStockItems: any[]): string[] {
    const recommendations: string[] = [];
    
    const critical = lowStockItems.filter(item => item.urgency === 'Critical').length;
    const high = lowStockItems.filter(item => item.urgency === 'High').length;
    
    if (critical > 0) {
      recommendations.push(`Immediate action required for ${critical} critical items`);
    }
    
    if (high > 0) {
      recommendations.push(`Plan reorders for ${high} high priority items`);
    }
    
    recommendations.push('Review supplier lead times and safety stock levels');
    
    return recommendations;
  }

  private generateValuationRecommendations(valuation: any[]): string[] {
    const recommendations: string[] = [];
    
    const lowMarginCategories = valuation.filter(cat => cat.averageMargin < 20);
    if (lowMarginCategories.length > 0) {
      recommendations.push(`Review pricing for ${lowMarginCategories.length} low margin categories`);
    }
    
    const highValueCategories = valuation.filter(cat => cat.totalCost > 10000);
    if (highValueCategories.length > 0) {
      recommendations.push(`Focus on high-value categories for inventory optimization`);
    }
    
    recommendations.push('Consider implementing ABC analysis for inventory management');
    
    return recommendations;
  }

  private generateMovementRecommendations(movements: any[]): string[] {
    const recommendations: string[] = [];
    
    const stockOut = movements.filter(m => m.type === 'out').length;
    const stockIn = movements.filter(m => m.type === 'in').length;
    
    if (stockOut > stockIn * 1.5) {
      recommendations.push('Stock out rate is high - review reorder points');
    }
    
    if (stockIn > stockOut * 1.5) {
      recommendations.push('Stock in rate is high - review ordering quantities');
    }
    
    recommendations.push('Implement automated reorder notifications');
    
    return recommendations;
  }
}
