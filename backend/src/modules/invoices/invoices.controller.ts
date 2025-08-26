import { Controller } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}
  
  // Basic invoices controller implementation
  // Will be expanded in future versions
}
