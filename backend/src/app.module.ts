import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './modules/products/products.module';
import { AuthModule } from './modules/auth/auth.module';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ProductionModule } from './modules/production/production.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { databaseConfig } from './config/database.config';
import { StaticFilesMiddleware } from './common/middleware/static-files.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => databaseConfig,
    }),
    CommonModule,
    ProductsModule,
    AuthModule,
    SalesModule,
    CustomersModule,
    InvoicesModule,
    ProductionModule,
    ReportingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: any) {
    consumer.apply(StaticFilesMiddleware).forRoutes('*');
  }
}
