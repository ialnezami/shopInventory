import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productModel.findOne({ 
      sku: createProductDto.sku 
    });
    
    if (existingProduct) {
      throw new BadRequestException('SKU already exists');
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(query: any = {}): Promise<Product[]> {
    const { 
      search, 
      category, 
      supplier, 
      minPrice, 
      maxPrice, 
      inStock,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = query;

    let filter: any = {};

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Supplier filter
    if (supplier) {
      filter.supplier = new Types.ObjectId(supplier);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter['price.selling'] = {};
      if (minPrice) filter['price.selling'].$gte = Number(minPrice);
      if (maxPrice) filter['price.selling'].$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    } else if (inStock === 'false') {
      filter['inventory.quantity'] = { $lte: 0 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await this.productModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('supplier', 'name email phone')
      .exec();

    return products;
  }

  async findOne(id: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel
      .findById(id)
      .populate('supplier', 'name email phone')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ sku })
      .populate('supplier', 'name email phone')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    // Check if SKU is being updated and if it already exists
    if (updateProductDto.sku) {
      const existingProduct = await this.productModel.findOne({ 
        sku: updateProductDto.sku,
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('supplier', 'name email phone')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' = 'subtract'): Promise<Product> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findById(id).exec();
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (operation === 'subtract' && product.inventory.quantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const newQuantity = operation === 'add' 
      ? product.inventory.quantity + quantity
      : product.inventory.quantity - quantity;

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id, 
        { 'inventory.quantity': newQuantity },
        { new: true }
      )
      .populate('supplier', 'name email phone')
      .exec();

    return updatedProduct;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel
      .find({
        $expr: {
          $lte: ['$inventory.quantity', '$inventory.minStock']
        }
      })
      .populate('supplier', 'name email phone')
      .exec();
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }

  async getSubcategories(category: string): Promise<string[]> {
    return this.productModel
      .distinct('subcategory')
      .where('category', category)
      .exec();
  }
}
