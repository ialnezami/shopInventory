import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  
  // Basic inventory controller implementation
  // Will be expanded in future versions
}
