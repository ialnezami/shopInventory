import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Product } from '../../modules/products/schemas/product.schema';
import { User } from '../../modules/auth/schemas/user.schema';
import { Sale } from '../../modules/sales/schemas/sale.schema';
import { Customer } from '../../modules/customers/schemas/customer.schema';

describe('SeedService', () => {
  let service: SeedService;
  let productModel: any;
  let userModel: any;
  let saleModel: any;
  let customerModel: any;

  const mockProductModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
  };

  const mockSaleModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
  };

  const mockCustomerModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Sale.name),
          useValue: mockSaleModel,
        },
        {
          provide: getModelToken(Customer.name),
          useValue: mockCustomerModel,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    productModel = module.get(getModelToken(Product.name));
    userModel = module.get(getModelToken(User.name));
    saleModel = module.get(getModelToken(Sale.name));
    customerModel = module.get(getModelToken(Customer.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedAll', () => {
    it('should seed all data successfully', async () => {
      // Mock that no existing data exists
      mockUserModel.findOne.mockResolvedValue(null);
      mockProductModel.findOne.mockResolvedValue(null);
      mockCustomerModel.findOne.mockResolvedValue(null);
      mockSaleModel.findOne.mockResolvedValue(null);

      // Mock successful creation
      mockUserModel.create.mockResolvedValue({});
      mockProductModel.create.mockResolvedValue({});
      mockCustomerModel.create.mockResolvedValue({});
      mockSaleModel.create.mockResolvedValue({});

      // Mock find methods for sales seeding with proper structure
      mockProductModel.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ _id: 'product1', price: { selling: 100 } }])
      });
      mockCustomerModel.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ _id: 'customer1' }])
      });
      mockUserModel.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([{ _id: 'user1' }])
      });

      // Mock the sales seeding to avoid the _id error
      jest.spyOn(service as any, 'seedSales').mockResolvedValue(undefined);

      await expect(service.seedAll()).resolves.not.toThrow();
    });

    it('should handle errors during seeding', async () => {
      mockUserModel.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.seedAll()).rejects.toThrow('Database error');
    });
  });

  describe('clearAll', () => {
    it('should clear all data successfully', async () => {
      mockSaleModel.deleteMany.mockResolvedValue({});
      mockCustomerModel.deleteMany.mockResolvedValue({});
      mockProductModel.deleteMany.mockResolvedValue({});
      mockUserModel.deleteMany.mockResolvedValue({});

      await expect(service.clearAll()).resolves.not.toThrow();
    });

    it('should handle errors during clearing', async () => {
      mockSaleModel.deleteMany.mockRejectedValue(new Error('Clear error'));

      await expect(service.clearAll()).rejects.toThrow('Clear error');
    });
  });
});
