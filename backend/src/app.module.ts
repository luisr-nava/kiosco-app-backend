import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthClientModule } from './auth-client/auth-client.module';
import { ConfigModule } from '@nestjs/config';
import { ShopModule } from './shop/shop.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeeModule } from './employee/employee.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { PurchaseModule } from './purchase/purchase.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { SupplierCategoryModule } from './supplier-category/supplier-category.module';
import { IncomeModule } from './income/income.module';
import { ExpenseModule } from './expense/expense.module';
import { SaleReturnModule } from './sale-return/sale-return.module';
import { PurchaseReturnModule } from './purchase-return/purchase-return.module';
import { CustomerModule } from './customer/customer.module';
import { SaleModule } from './sale/sale.module';
import { ReportsModule } from './reports/reports.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/logger/logger.module';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { CashRegisterModule } from './cash-register/cash-register.module';
import { WebhookModule } from './webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MeasurementUnitModule } from './measurement-unit/measurement-unit.module';
import { SubscriptionInterceptor } from './common/authorization/subscription.interceptor';
import { PlanValidationService } from './common/authorization/plan-validation.service';
import { JwtAuthGuard } from './auth-client/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule, // Logger global
    // Rate limiting: máximo 10 requests por minuto
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requests
      },
    ]),
    ScheduleModule.forRoot(),
    AuthClientModule,
    ShopModule,
    PrismaModule,
    EmployeeModule,
    ProductModule,
    SupplierModule,
    PurchaseModule,
    ProductCategoryModule,
    SupplierCategoryModule,
    IncomeModule,
    ExpenseModule,
    SaleReturnModule,
    PurchaseReturnModule,
    CustomerModule,
    SaleModule,
    ReportsModule,
    PaymentMethodModule,
    CashRegisterModule,
    WebhookModule,
    MeasurementUnitModule,
  ],
  controllers: [AppController],
  providers: [
    PlanValidationService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SubscriptionInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar middleware a todas las rutas evitando comodines legacy
    consumer
      .apply(SecurityHeadersMiddleware)
      .forRoutes({ path: '(.*)', method: RequestMethod.ALL });
  }
}
