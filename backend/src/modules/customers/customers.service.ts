import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string): Promise<Customer> {
    // Check if customer with email or phone already exists
    const existingCustomer = await this.customerModel.findOne({
      $or: [
        { email: createCustomerDto.email },
        { phone: createCustomerDto.phone }
      ]
    });

    if (existingCustomer) {
      throw new BadRequestException('Customer with this email or phone already exists');
    }

    const createdCustomer = new this.customerModel({
      ...createCustomerDto,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return createdCustomer.save();
  }

  async findAll(query: any = {}): Promise<Customer[]> {
    const {
      search,
      tier,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    let filter: any = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'businessInfo.companyName': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by loyalty tier
    if (tier) {
      filter['loyalty.tier'] = tier;
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const customers = await this.customerModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .exec();

    return customers;
  }

  async findOne(id: string): Promise<Customer> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerModel
      .findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerModel.findOne({ email }).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async findByPhone(phone: string): Promise<Customer> {
    const customer = await this.customerModel.findOne({ phone }).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string): Promise<Customer> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid customer ID');
    }

    // Check if email or phone is being updated and if it conflicts with existing customers
    if (updateCustomerDto.email || updateCustomerDto.phone) {
      const existingCustomer = await this.customerModel.findOne({
        $and: [
          { _id: { $ne: new Types.ObjectId(id) } },
          {
            $or: [
              ...(updateCustomerDto.email ? [{ email: updateCustomerDto.email }] : []),
              ...(updateCustomerDto.phone ? [{ phone: updateCustomerDto.phone }] : [])
            ]
          }
        ]
      });

      if (existingCustomer) {
        throw new BadRequestException('Email or phone already exists for another customer');
      }
    }

    const updatedCustomer = await this.customerModel
      .findByIdAndUpdate(
        id,
        {
          ...updateCustomerDto,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, runValidators: true }
      )
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName')
      .exec();

    if (!updatedCustomer) {
      throw new NotFoundException('Customer not found');
    }

    return updatedCustomer;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const result = await this.customerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
  }

  async updateStatistics(id: string, orderTotal: number): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const currentStats = customer.statistics || {
      totalSpent: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };

    const newTotalSpent = currentStats.totalSpent + orderTotal;
    const newTotalOrders = currentStats.totalOrders + 1;
    const newAverageOrderValue = newTotalSpent / newTotalOrders;

    await this.customerModel.findByIdAndUpdate(id, {
      'statistics.totalSpent': newTotalSpent,
      'statistics.totalOrders': newTotalOrders,
      'statistics.averageOrderValue': newAverageOrderValue,
      'statistics.lastPurchaseDate': new Date(),
      'loyalty.loyaltyPoints': Math.floor(orderTotal * 0.1), // 10% of order value as loyalty points
    }).exec();
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    return this.customerModel
      .find({ isActive: true })
      .sort({ 'statistics.totalSpent': -1 })
      .limit(limit)
      .populate('createdBy', 'username firstName lastName')
      .exec();
  }

  async getCustomerCount(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active] = await Promise.all([
      this.customerModel.countDocuments(),
      this.customerModel.countDocuments({ isActive: true })
    ]);

    return {
      total,
      active,
      inactive: total - active
    };
  }
}
