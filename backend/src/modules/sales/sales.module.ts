import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema }
    ]),
    ProductsModule,
    CustomersModule
  ],
  controllers: [SalesController, PosController],
  providers: [SalesService, PosService],
  exports: [SalesService, PosService],
})
export class SalesModule {}
