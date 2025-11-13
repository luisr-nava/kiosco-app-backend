import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthClientModule } from './auth-client/auth-client.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopModule } from './shop/shop.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthClientModule, ShopModule, PrismaModule, EmployeeModule, ProductModule, SupplierModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
