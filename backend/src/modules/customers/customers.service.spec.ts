import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { Customer } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Model } from 'mongoose';

describe('CustomersService', () => {
  let service: CustomersService;
  let model: Model<Customer>;

  const mockCustomer = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    company: 'Acme Corp',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getModelToken(Customer.name),
          useValue: mockCustomerModel,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    model = module.get<Model<Customer>>(getModelToken(Customer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        company: 'Acme Corp',
      };

      mockCustomerModel.create.mockResolvedValue(mockCustomer);

      const result = await service.create(createCustomerDto);

      expect(mockCustomerModel.create).toHaveBeenCalledWith({
        ...createCustomerDto,
        isActive: true,
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw an error if customer creation fails', async () => {
      const createCustomerDto: CreateCustomerDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        company: 'Acme Corp',
      };

      mockCustomerModel.create.mockRejectedValue(new Error('Creation failed'));

      await expect(service.create(createCustomerDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const mockCustomers = [mockCustomer];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomers),
      };

      mockCustomerModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(mockCustomerModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockCustomers);
    });

    it('should return empty array when no customers exist', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCustomerModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomer),
      };

      mockCustomerModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(mockCustomerModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when customer not found', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCustomerModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a customer by email', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomer),
      };

      mockCustomerModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail('john.doe@example.com');

      expect(mockCustomerModel.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when customer not found by email', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCustomerModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        firstName: 'Jane',
        phone: '+0987654321',
      };

      const updatedCustomer = { ...mockCustomer, ...updateCustomerDto };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedCustomer),
      };

      mockCustomerModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update('507f1f77bcf86cd799439011', updateCustomerDto);

      expect(mockCustomerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateCustomerDto,
        { new: true }
      );
      expect(result).toEqual(updatedCustomer);
    });

    it('should return null when updating non-existent customer', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        firstName: 'Jane',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCustomerModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update('507f1f77bcf86cd799439011', updateCustomerDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomer),
      };

      mockCustomerModel.findByIdAndDelete.mockReturnValue(mockQuery);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(mockCustomerModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when deleting non-existent customer', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockCustomerModel.findByIdAndDelete.mockReturnValue(mockQuery);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toBeNull();
    });
  });

  describe('deactivateCustomer', () => {
    it('should deactivate a customer', async () => {
      const deactivatedCustomer = { ...mockCustomer, isActive: false };
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(deactivatedCustomer),
      };

      mockCustomerModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.deactivateCustomer('507f1f77bcf86cd799439011');

      expect(mockCustomerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false },
        { new: true }
      );
      expect(result.isActive).toBe(false);
    });
  });

  describe('searchCustomers', () => {
    it('should search customers by query', async () => {
      const searchQuery = 'john';
      const mockCustomers = [mockCustomer];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomers),
      };

      mockCustomerModel.find.mockReturnValue(mockQuery);

      const result = await service.searchCustomers(searchQuery);

      expect(mockCustomerModel.find).toHaveBeenCalledWith({
        $or: [
          { firstName: { $regex: searchQuery, $options: 'i' } },
          { lastName: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { company: { $regex: searchQuery, $options: 'i' } },
        ],
      });
      expect(result).toEqual(mockCustomers);
    });

    it('should return empty array when no customers match search', async () => {
      const searchQuery = 'nonexistent';
      const mockQuery = {
        exec: jest.fn().mockResolvedValue([]),
      };

      mockCustomerModel.find.mockReturnValue(mockQuery);

      const result = await service.searchCustomers(searchQuery);

      expect(result).toEqual([]);
    });
  });

  describe('getActiveCustomers', () => {
    it('should return only active customers', async () => {
      const mockCustomers = [mockCustomer];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockCustomers),
      };

      mockCustomerModel.find.mockReturnValue(mockQuery);

      const result = await service.getActiveCustomers();

      expect(mockCustomerModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual(mockCustomers);
    });
  });
});
