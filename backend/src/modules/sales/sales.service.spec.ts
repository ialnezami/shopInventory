import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { Sale } from './schemas/sale.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Model } from 'mongoose';

describe('SalesService', () => {
  let service: SalesService;
  let saleModel: Model<Sale>;
  let productModel: Model<Product>;

  const mockProduct = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    sku: 'TEST-001',
    price: 99.99,
    cost: 50.00,
    stock: 100,
    minStock: 10,
  };

  const mockSale = {
    _id: '507f1f77bcf86cd799439012',
    customer: '507f1f77bcf86cd799439013',
    items: [
      {
        product: '507f1f77bcf86cd799439011',
        quantity: 2,
        price: 99.99,
        total: 199.98,
      },
    ],
    total: 199.98,
    paymentMethod: 'cash',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSaleModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(Sale.name),
          useValue: mockSaleModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    saleModel = module.get<Model<Sale>>(getModelToken(Sale.name));
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new sale and update product stock', async () => {
      const createSaleDto: CreateSaleDto = {
        customer: '507f1f77bcf86cd799439013',
        items: [
          {
            product: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 99.99,
          },
        ],
        paymentMethod: 'cash',
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockProduct, stock: 98 }),
      });

      mockSaleModel.create.mockResolvedValue(mockSale);

      const result = await service.create(createSaleDto);

      expect(mockProductModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { stock: 98 },
        { new: true }
      );
      expect(mockSaleModel.create).toHaveBeenCalledWith({
        ...createSaleDto,
        total: 199.98,
        date: expect.any(Date),
        items: [
          {
            ...createSaleDto.items[0],
            total: 199.98,
          },
        ],
      });
      expect(result).toEqual(mockSale);
    });

    it('should throw error if product not found', async () => {
      const createSaleDto: CreateSaleDto = {
        customer: '507f1f77bcf86cd799439013',
        items: [
          {
            product: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 99.99,
          },
        ],
        paymentMethod: 'cash',
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createSaleDto)).rejects.toThrow('Product not found');
    });

    it('should throw error if insufficient stock', async () => {
      const createSaleDto: CreateSaleDto = {
        customer: '507f1f77bcf86cd799439013',
        items: [
          {
            product: '507f1f77bcf86cd799439011',
            quantity: 150, // More than available stock
            price: 99.99,
          },
        ],
        paymentMethod: 'cash',
      };

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      await expect(service.create(createSaleDto)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('findAll', () => {
    it('should return an array of sales', async () => {
      const mockSales = [mockSale];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockSales),
      };

      mockSaleModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(mockSaleModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockSales);
    });

    it('should return empty array when no sales exist', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue([]),
      };

      mockSaleModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a sale by id', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockSale),
      };

      mockSaleModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('507f1f77bcf86cd799439012');

      expect(mockSaleModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(result).toEqual(mockSale);
    });

    it('should return null when sale not found', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockSaleModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('507f1f77bcf86cd799439012');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a sale and restore product stock', async () => {
      mockSaleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSale),
      });

      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockProduct, stock: 98 }),
      });

      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockProduct, stock: 100 }),
      });

      mockSaleModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSale),
      });

      const result = await service.remove('507f1f77bcf86cd799439012');

      expect(mockSaleModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { stock: 100 },
        { new: true }
      );
      expect(mockSaleModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
      expect(result).toEqual(mockSale);
    });

    it('should return null when sale not found', async () => {
      mockSaleModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove('507f1f77bcf86cd799439012');

      expect(result).toBeNull();
    });
  });

  describe('getSalesByDateRange', () => {
    it('should return sales within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockSales = [mockSale];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockSales),
      };

      mockSaleModel.find.mockReturnValue(mockQuery);

      const result = await service.getSalesByDateRange(startDate, endDate);

      expect(mockSaleModel.find).toHaveBeenCalledWith({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      expect(result).toEqual(mockSales);
    });
  });

  describe('getTotalSales', () => {
    it('should return total sales amount', async () => {
      const mockSales = [mockSale, { ...mockSale, total: 150.00 }];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockSales),
      };

      mockSaleModel.find.mockReturnValue(mockQuery);

      const result = await service.getTotalSales();

      expect(mockSaleModel.find).toHaveBeenCalled();
      expect(result).toBe(349.98); // 199.98 + 150.00
    });
  });
});
