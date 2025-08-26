import { Controller } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}
  
  // Basic customers controller implementation
  // Will be expanded in future versions
}
