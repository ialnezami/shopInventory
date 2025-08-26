import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or SKU already exists',
  })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name and description' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'supplier', required: false, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum selling price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum selling price' })
  @ApiQuery({ name: 'inStock', required: false, description: 'Filter by stock availability' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: [Product],
  })
  findAll(@Query() query: any): Promise<Product[]> {
    return this.productsService.findAll(query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Low stock products retrieved successfully',
    type: [Product],
  })
  getLowStockProducts(): Promise<Product[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: [String],
  })
  getCategories(): Promise<string[]> {
    return this.productsService.getCategories();
  }

  @Get('categories/:category/subcategories')
  @ApiOperation({ summary: 'Get subcategories for a specific category' })
  @ApiParam({ name: 'category', description: 'Category name' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subcategories retrieved successfully',
    type: [String],
  })
  getSubcategories(@Param('category') category: string): Promise<string[]> {
    return this.productsService.getSubcategories(category);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiParam({ name: 'sku', description: 'Product SKU' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  findBySku(@Param('sku') sku: string): Promise<Product> {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product ID',
  })
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or SKU already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiQuery({ name: 'quantity', required: true, description: 'Quantity to add/subtract' })
  @ApiQuery({ name: 'operation', required: false, description: 'Operation: add or subtract (default: subtract)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or insufficient stock',
  })
  updateStock(
    @Param('id') id: string,
    @Query('quantity') quantity: number,
    @Query('operation') operation: 'add' | 'subtract' = 'subtract',
  ): Promise<Product> {
    return this.productsService.updateStock(id, quantity, operation);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid product ID',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
