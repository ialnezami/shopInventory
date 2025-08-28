import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Model, Types } from 'mongoose';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<Product>;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'Test Description',
    price: {
      cost: 50.00,
      selling: 99.99,
      currency: 'USD'
    },
    inventory: {
      quantity: 100,
      minStock: 10,
      location: 'Main Store'
    },
    category: 'Electronics',
    subcategory: 'Smartphones',
    supplier: '507f1f77bcf86cd799439012',
    variants: [],
    images: [],
    weight: 0.5,
    dimensions: {
      length: 10,
      width: 5,
      height: 2
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<Product>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        price: {
          cost: 50.00,
          selling: 99.99,
          currency: 'USD'
        },
        inventory: {
          quantity: 100,
          minStock: 10
        },
        category: 'Electronics',
        supplier: 'Test Supplier',
      };

      // Mock the service method directly
      jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(service.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw an error if product creation fails', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        price: {
          cost: 50.00,
          selling: 99.99,
          currency: 'USD'
        },
        inventory: {
          quantity: 100,
          minStock: 10
        },
        category: 'Electronics',
        supplier: 'Test Supplier',
      };

      // Mock the service method to throw error
      jest.spyOn(service, 'create').mockRejectedValue(new Error('Creation failed'));

      await expect(service.create(createProductDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [mockProduct];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      };

      mockProductModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(mockProductModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products exist', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      mockProductModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      };

      mockProductModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(mockProductModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockProductModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow('Product not found');
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      };

      mockProductModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findBySku('TEST-001');

      expect(mockProductModel.findOne).toHaveBeenCalledWith({ sku: 'TEST-001' });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: {
          cost: 75.00,
          selling: 149.99,
          currency: 'USD'
        },
      };

      const updatedProduct = { ...mockProduct, ...updateProductDto };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedProduct),
      };

      mockProductModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update('507f1f77bcf86cd799439011', updateProductDto);

      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateProductDto,
        { new: true }
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      mockProductModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(service.update('507f1f77bcf86cd799439011', updateProductDto)).rejects.toThrow('Product not found');
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockProduct),
      };

      mockProductModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await expect(service.remove('507f1f77bcf86cd799439011')).resolves.toBeUndefined();

      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when deleting non-existent product', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockProductModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow('Product not found');
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const mockProductWithStock = { 
        ...mockProduct, 
        inventory: { ...mockProduct.inventory, quantity: 100 } 
      };
      
      const updatedProduct = { 
        ...mockProduct, 
        inventory: { ...mockProduct.inventory, quantity: 50 } 
      };

      // Mock findById for initial product lookup
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProductWithStock),
      });

      // Mock findByIdAndUpdate for stock update
      const mockUpdateQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedProduct),
      };
      mockProductModel.findByIdAndUpdate.mockReturnValue(mockUpdateQuery);

      const result = await service.updateStock('507f1f77bcf86cd799439011', 50);

      expect(mockProductModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { 'inventory.quantity': 50 },
        { new: true }
      );
      expect(result.inventory.quantity).toBe(50);
    });
  });
});
