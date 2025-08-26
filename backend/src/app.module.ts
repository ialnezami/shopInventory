import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop-inventory'),
    AuthModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    InvoicesModule,
    CustomersModule,
    ReportsModule,
  ],
})
export class AppModule {}
