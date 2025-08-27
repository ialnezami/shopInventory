import { Controller, Post, Delete, UseGuards } from '@nestjs/common';
import { SeedService } from '../services/seed.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @Roles('admin')
  async seedDatabase() {
    await this.seedService.seedAll();
    return { message: 'Database seeded successfully' };
  }

  @Delete()
  @Roles('admin')
  async clearDatabase() {
    await this.seedService.clearAll();
    return { message: 'Database cleared successfully' };
  }
}
