import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthService } from '../../common/services/health.service';
import { HealthController } from '../../common/controllers/health.controller';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class ProductionModule {}
