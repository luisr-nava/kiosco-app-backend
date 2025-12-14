import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { StripeCoreModule } from './stripe-core.module';

@Module({
  imports: [AuthClientModule, StripeCoreModule],
  controllers: [BillingController],
})
export class StripeModule {}
