import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CashRegisterModule } from '../cash-register/cash-register.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [PrismaModule, CashRegisterModule, WebhookModule],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
