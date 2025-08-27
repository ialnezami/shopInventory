import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './services/seed.service';
import { FileUploadService } from './services/file-upload.service';
import { SeedController } from './controllers/seed.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { Product, ProductSchema } from '../modules/products/schemas/product.schema';
import { User, UserSchema } from '../modules/auth/schemas/user.schema';
import { Sale, SaleSchema } from '../modules/sales/schemas/sale.schema';
import { Customer, CustomerSchema } from '../modules/customers/schemas/customer.schema';
import { Invoice, InvoiceSchema } from '../modules/invoices/schemas/invoice.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [SeedService, FileUploadService],
  controllers: [SeedController, FileUploadController],
  exports: [SeedService, FileUploadService],
})
export class CommonModule {}
