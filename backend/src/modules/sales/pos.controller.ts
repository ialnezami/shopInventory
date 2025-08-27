import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pos')
@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('sale')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Create a quick sale (POS)' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - insufficient stock or invalid data' })
  createQuickSale(@Body() saleData: any, @Request() req) {
    return this.posService.createQuickSale(saleData, req.user.id);
  }

  @Get('products/search')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Search products for sale' })
  @ApiResponse({ status: 200, description: 'Products found successfully' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term for product name or SKU' })
  searchProducts(@Query('query') query: string) {
    return this.posService.searchProductsForSale(query);
  }

  @Get('products/:id')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Get product details for sale' })
  @ApiResponse({ status: 200, description: 'Product details retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Product not available for sale' })
  getProductForSale(@Param('id') id: string) {
    return this.posService.getProductForSale(id);
  }

  @Get('customers/search')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Search customers for sale' })
  @ApiResponse({ status: 200, description: 'Customers found successfully' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term for customer name, email, or phone' })
  searchCustomers(@Query('query') query: string) {
    return this.posService.searchCustomersForSale(query);
  }

  @Get('customers/:id')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Get customer details for sale' })
  @ApiResponse({ status: 200, description: 'Customer details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerForSale(@Param('id') id: string) {
    return this.posService.getCustomerForSale(id);
  }

  @Get('summary/daily')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Get daily sales summary for POS' })
  @ApiResponse({ status: 200, description: 'Daily summary retrieved successfully' })
  getDailySummary() {
    return this.posService.getDailySummary();
  }

  @Get('sales/recent')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Get recent sales for POS' })
  @ApiResponse({ status: 200, description: 'Recent sales retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of recent sales to return' })
  getRecentSales(@Query('limit') limit: string) {
    return this.posService.getRecentSales(parseInt(limit) || 10);
  }
}
