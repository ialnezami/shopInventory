import { Controller } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  
  // Basic reports controller implementation
  // Will be expanded in future versions
}
