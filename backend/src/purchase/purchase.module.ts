import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CashRegisterModule } from '../cash-register/cash-register.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [PrismaModule, CashRegisterModule, WebhookModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
