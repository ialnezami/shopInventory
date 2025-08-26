import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './schemas/sale.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale transaction (POS)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sale created successfully',
    type: Sale,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or insufficient stock',
  })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req): Promise<Sale> {
    return this.salesService.create(createSaleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales with filtering and pagination' })
  @ApiQuery({ name: 'customer', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'staff', required: false, description: 'Filter by staff ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by sale status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales retrieved successfully',
    type: [Sale],
  })
  findAll(@Query() query: any): Promise<Sale[]> {
    return this.salesService.findAll(query);
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily sales summary' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily sales summary retrieved successfully',
  })
  getDailySales(@Param('date') date: string): Promise<any> {
    return this.salesService.getDailySales(date);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get sales summary for date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date in YYYY-MM-DD format' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sales summary retrieved successfully',
  })
  getSalesSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.salesService.getSalesSummary(startDate, endDate);
  }

  @Get('transaction/:transactionNumber')
  @ApiOperation({ summary: 'Get sale by transaction number' })
  @ApiParam({ name: 'transactionNumber', description: 'Transaction number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sale retrieved successfully',
    type: Sale,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sale not found',
  })
  findByTransactionNumber(@Param('transactionNumber') transactionNumber: string): Promise<Sale> {
    return this.salesService.findByTransactionNumber(transactionNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sale retrieved successfully',
    type: Sale,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sale not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid sale ID',
  })
  findOne(@Param('id') id: string): Promise<Sale> {
    return this.salesService.findOne(id);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update sale status' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiQuery({ name: 'status', required: true, description: 'New status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sale status updated successfully',
    type: Sale,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status or sale ID',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sale not found',
  })
  updateStatus(
    @Param('id') id: string,
    @Query('status') status: string,
  ): Promise<Sale> {
    return this.salesService.updateStatus(id, status);
  }
}
