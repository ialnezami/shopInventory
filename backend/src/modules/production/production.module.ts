import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthService } from '../../common/services/health.service';
import { HealthController } from '../../common/controllers/health.controller';
import { MonitoringService } from '../../common/services/monitoring.service';
import { MonitoringController } from '../../common/controllers/monitoring.controller';

@Module({
  imports: [
    TerminusModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController, MonitoringController],
  providers: [HealthService, MonitoringService],
  exports: [HealthService, MonitoringService],
})
export class ProductionModule {}
