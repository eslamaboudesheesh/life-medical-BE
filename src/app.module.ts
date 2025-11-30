/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { BrandsModule } from './brands/brands.module';
import { CompanyModule } from './company/company.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { BillingModule } from './billing/billing.module';
import { PaymobModule } from './paymob/paymob.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CloudinaryModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    BrandsModule,
    CompanyModule,
    BillingModule,
    PaymobModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
