import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService], // Exportar para usar en otros módulos
})
export class WebhookModule {}
