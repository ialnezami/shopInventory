import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    sku: 'TEST-001',
    description: 'Test Description',
    price: 99.99,
    cost: 50.00,
    category: 'Electronics',
    stock: 100,
    minStock: 10,
    supplier: 'Test Supplier',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySku: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'Test Description',
        price: 99.99,
        cost: 50.00,
        category: 'Electronics',
        stock: 100,
        minStock: 10,
        supplier: 'Test Supplier',
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(service.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        name: '', // Invalid: empty name
        sku: 'TEST-001',
      };

      mockProductsService.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(mockProducts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products exist', async () => {
      mockProductsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product not found', async () => {
      mockProductsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      mockProductsService.findBySku.mockResolvedValue(mockProduct);

      const result = await controller.findBySku('TEST-001');

      expect(service.findBySku).toHaveBeenCalledWith('TEST-001');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };

      const updatedProduct = { ...mockProduct, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update('507f1f77bcf86cd799439011', updateProductDto);

      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateProductDto);
      expect(result).toEqual(updatedProduct);
    });

    it('should return null when updating non-existent product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      mockProductsService.update.mockResolvedValue(null);

      const result = await controller.update('507f1f77bcf86cd799439011', updateProductDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockProductsService.remove.mockResolvedValue(mockProduct);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProduct);
    });

    it('should return null when deleting non-existent product', async () => {
      mockProductsService.remove.mockResolvedValue(null);

      const result = await controller.remove('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const updatedProduct = { ...mockProduct, stock: 150 };
      mockProductsService.updateStock.mockResolvedValue(updatedProduct);

      const result = await controller.updateStock('507f1f77bcf86cd799439011', 150);

      expect(service.updateStock).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 150);
      expect(result.stock).toBe(150);
    });
  });
});
