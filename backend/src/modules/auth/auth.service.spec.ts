import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'admin',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    exec: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithHashedPassword),
      });

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(result).toEqual({
        _id: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithHashedPassword),
      });

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const inactiveUser = { ...mockUser, isActive: false };
      const hashedPassword = await bcrypt.hash('password123', 10);
      inactiveUser.password = hashedPassword;

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inactiveUser),
      });

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info when login is successful', async () => {
      const user = {
        _id: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      };

      const mockToken = 'jwt-token-123';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user._id,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      const email = 'test@example.com';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      const email = 'nonexistent@example.com';

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById(userId);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = { ...createUserDto, password: hashedPassword, _id: 'new-id' };

      mockUserModel.create.mockResolvedValue(newUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String), // Hashed password
        isActive: true,
      });
      expect(result).toEqual(newUser);
      expect(result.password).not.toBe(createUserDto.password);
    });

    it('should throw error if user creation fails', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
      };

      mockUserModel.create.mockRejectedValue(new Error('User creation failed'));

      await expect(service.createUser(createUserDto)).rejects.toThrow('User creation failed');
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateData = {
        firstName: 'Updated Name',
        lastName: 'Updated Last',
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.updateUser(userId, updateData);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const deactivatedUser = { ...mockUser, isActive: false };

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deactivatedUser),
      });

      const result = await service.deactivateUser(userId);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { isActive: false },
        { new: true }
      );
      expect(result.isActive).toBe(false);
    });
  });
});
