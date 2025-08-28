import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { ReportingService, ReportFilters } from '../services/reporting.service';
import { Sale, SaleDocument } from '../../modules/sales/schemas/sale.schema';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportingController {
  private readonly logger = new Logger(ReportingController.name);

  constructor(
    private readonly reportingService: ReportingService,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
  ) {}

  // ==================== SALES REPORTS ====================

  @Get('sales/daily')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiResponse({ status: 200, description: 'Daily sales summary retrieved successfully' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format (defaults to today)' })
  async getDailySalesSummary(@Query('date') date?: string) {
    return this.reportingService.getDailySalesSummary(date);
  }

  @Get('sales/period')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get sales report by period' })
  @ApiResponse({ status: 200, description: 'Sales report by period retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by product category' })
  @ApiQuery({ name: 'customer', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top items to return' })
  async getSalesByPeriod(@Query() filters: ReportFilters) {
    return this.reportingService.getSalesByPeriod(filters);
  }

  @Get('sales/top-products')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get top products report' })
  @ApiResponse({ status: 200, description: 'Top products report retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by product category' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top products to return' })
  async getTopProductsReport(@Query() filters: ReportFilters) {
    return this.reportingService.getTopProductsReport(filters);
  }

  @Get('sales/customers')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get customer sales report' })
  @ApiResponse({ status: 200, description: 'Customer sales report retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of top customers to return' })
  async getCustomerSalesReport(@Query() filters: ReportFilters) {
    return this.reportingService.getCustomerSalesReport(filters);
  }

  // ==================== INVENTORY REPORTS ====================

  @Get('inventory/stock-levels')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get stock level report' })
  @ApiResponse({ status: 200, description: 'Stock level report retrieved successfully' })
  async getStockLevelReport() {
    return this.reportingService.getStockLevelReport();
  }

  @Get('inventory/low-stock')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get low stock report' })
  @ApiResponse({ status: 200, description: 'Low stock report retrieved successfully' })
  async getLowStockReport() {
    return this.reportingService.getLowStockReport();
  }

  @Get('inventory/valuation')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get inventory valuation report' })
  @ApiResponse({ status: 200, description: 'Inventory valuation report retrieved successfully' })
  async getInventoryValuationReport() {
    return this.reportingService.getInventoryValuationReport();
  }

  @Get('inventory/movements')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get stock movement report' })
  @ApiResponse({ status: 200, description: 'Stock movement report retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'product', required: false, description: 'Filter by product ID' })
  async getStockMovementReport(@Query() filters: ReportFilters) {
    return this.reportingService.getStockMovementReport(filters);
  }

  // ==================== COMBINED REPORTS ====================

  @Get('dashboard')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get comprehensive dashboard report' })
  @ApiResponse({ status: 200, description: 'Dashboard report retrieved successfully' })
  async getDashboardReport() {
    try {
      const [
        dailySales,
        stockLevels,
        lowStock,
        topProducts,
        customerSales,
      ] = await Promise.all([
        this.reportingService.getDailySalesSummary(),
        this.reportingService.getStockLevelReport(),
        this.reportingService.getLowStockReport(),
        this.reportingService.getTopProductsReport({ limit: 5 }),
        this.reportingService.getCustomerSalesReport({ limit: 5 }),
      ]);

      return {
        timestamp: new Date().toISOString(),
        summary: {
          todaySales: dailySales.summary.totalSales,
          todayOrders: dailySales.summary.totalOrders,
          totalProducts: stockLevels.summary.totalProducts,
          lowStockItems: lowStock.summary.totalLowStockItems,
          criticalItems: lowStock.summary.criticalItems,
          inventoryValue: stockLevels.summary.totalValue,
        },
        sales: {
          daily: dailySales,
          topProducts: topProducts.topProducts.slice(0, 5),
          topCustomers: customerSales.customerSales.slice(0, 5),
        },
        inventory: {
          stockLevels: stockLevels.summary,
          lowStock: lowStock.summary,
          recommendations: [
            ...stockLevels.recommendations,
            ...lowStock.recommendations,
          ],
        },
        alerts: this.generateDashboardAlerts(dailySales, lowStock, stockLevels),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('summary')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get business summary report' })
  @ApiResponse({ status: 200, description: 'Business summary report retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, description: 'Period: daily, weekly, monthly (defaults to monthly)' })
  async getBusinessSummary(@Query('period') period: string = 'monthly') {
    try {
      let startDate: string;
      let endDate: string;

      switch (period) {
        case 'daily':
          startDate = moment().startOf('day').format('YYYY-MM-DD');
          endDate = moment().endOf('day').format('YYYY-MM-DD');
          break;
        case 'weekly':
          startDate = moment().startOf('week').format('YYYY-MM-DD');
          endDate = moment().endOf('week').format('YYYY-MM-DD');
          break;
        case 'monthly':
        default:
          startDate = moment().startOf('month').format('YYYY-MM-DD');
          endDate = moment().endOf('month').format('YYYY-MM-DD');
          break;
      }

      const [salesReport, stockLevels, lowStock] = await Promise.all([
        this.reportingService.getSalesByPeriod({ startDate, endDate }),
        this.reportingService.getStockLevelReport(),
        this.reportingService.getLowStockReport(),
      ]);

      return {
        period,
        dateRange: { startDate, endDate },
        businessMetrics: {
          sales: {
            total: salesReport.totalSales,
            orders: salesReport.totalOrders,
            averageOrder: salesReport.averageOrderValue,
            growth: salesReport.trends.growth,
            trend: salesReport.trends.trend,
          },
          inventory: {
            totalProducts: stockLevels.summary.totalProducts,
            totalValue: stockLevels.summary.totalValue,
            lowStockItems: lowStock.summary.totalLowStockItems,
            criticalItems: lowStock.summary.criticalItems,
            utilization: stockLevels.summary.averageUtilization,
          },
          customers: {
            total: salesReport.topCustomers.length,
            topSpenders: salesReport.topCustomers.slice(0, 3),
          },
        },
        topPerformers: {
          products: salesReport.topProducts.slice(0, 3),
          categories: await this.getTopCategories(startDate, endDate),
        },
        recommendations: [
          ...salesReport.trends.trend === 'decreasing' ? ['Review sales strategies and promotions'] : [],
          ...lowStock.recommendations,
          ...stockLevels.recommendations,
        ],
      };
    } catch (error) {
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private generateDashboardAlerts(dailySales: any, lowStock: any, stockLevels: any): any[] {
    const alerts: any[] = [];

    // Sales alerts
    if (dailySales.summary.totalSales === 0) {
      alerts.push({
        type: 'warning',
        message: 'No sales recorded today',
        priority: 'medium',
      });
    }

    // Low stock alerts
    if (lowStock.summary.criticalItems > 0) {
      alerts.push({
        type: 'critical',
        message: `${lowStock.summary.criticalItems} items are critically low on stock`,
        priority: 'high',
        action: 'Review low stock report immediately',
      });
    }

    if (lowStock.summary.highPriorityItems > 0) {
      alerts.push({
        type: 'warning',
        message: `${lowStock.summary.highPriorityItems} items need reordering soon`,
        priority: 'medium',
        action: 'Plan reorders for high priority items',
      });
    }

    // Inventory alerts
    if (stockLevels.summary.lowStockCount > stockLevels.summary.totalProducts * 0.2) {
      alerts.push({
        type: 'warning',
        message: 'High percentage of items are low on stock',
        priority: 'medium',
        action: 'Review inventory management strategy',
      });
    }

    if (stockLevels.summary.overstockedCount > stockLevels.summary.totalProducts * 0.1) {
      alerts.push({
        type: 'info',
        message: `${stockLevels.summary.overstockedCount} items are overstocked`,
        priority: 'low',
        action: 'Consider promotions or discounts',
      });
    }

    return alerts;
  }

  private async getTopCategories(startDate: string, endDate: string): Promise<any[]> {
    try {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();

      const categorySales = await this.saleModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'completed',
          },
        },
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
            _id: { $arrayElemAt: ['$productDetails.category', 0] },
            totalSales: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
            totalQuantity: { $sum: '$items.quantity' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
      ]);

      return categorySales.map(cat => ({
        category: cat._id || 'Uncategorized',
        totalSales: Math.round(cat.totalSales * 100) / 100,
        totalQuantity: cat.totalQuantity,
        orderCount: cat.orderCount,
      }));
    } catch (error) {
      this.logger.error('Failed to get top categories:', error);
      return [];
    }
  }
}
