import { Test, TestingModule } from '@nestjs/testing';
import { SeedController } from './seed.controller';
import { SeedService } from '../services/seed.service';

describe('SeedController', () => {
  let controller: SeedController;
  let seedService: SeedService;

  const mockSeedService = {
    seedAll: jest.fn(),
    clearAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedController],
      providers: [
        {
          provide: SeedService,
          useValue: mockSeedService,
        },
      ],
    }).compile();

    controller = module.get<SeedController>(SeedController);
    seedService = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('seedDatabase', () => {
    it('should seed database successfully', async () => {
      mockSeedService.seedAll.mockResolvedValue(undefined);

      const result = await controller.seedDatabase();

      expect(result).toEqual({ message: 'Database seeded successfully' });
      expect(seedService.seedAll).toHaveBeenCalled();
    });

    it('should handle seeding errors', async () => {
      const error = new Error('Seeding failed');
      mockSeedService.seedAll.mockRejectedValue(error);

      await expect(controller.seedDatabase()).rejects.toThrow('Seeding failed');
    });
  });

  describe('clearDatabase', () => {
    it('should clear database successfully', async () => {
      mockSeedService.clearAll.mockResolvedValue(undefined);

      const result = await controller.clearDatabase();

      expect(result).toEqual({ message: 'Database cleared successfully' });
      expect(seedService.clearAll).toHaveBeenCalled();
    });

    it('should handle clearing errors', async () => {
      const error = new Error('Clearing failed');
      mockSeedService.clearAll.mockRejectedValue(error);

      await expect(controller.clearDatabase()).rejects.toThrow('Clearing failed');
    });
  });
});
