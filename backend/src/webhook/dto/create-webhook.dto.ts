import {
  IsString,
  IsUrl,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export enum WebhookEvent {
  LOW_STOCK = 'LOW_STOCK',
  STOCK_OUT = 'STOCK_OUT',
  SALE_CREATED = 'SALE_CREATED',
  PURCHASE_CREATED = 'PURCHASE_CREATED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
}

export class CreateWebhookDto {
  @IsUUID()
  @IsNotEmpty()
  shopId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(WebhookEvent)
  @IsNotEmpty()
  event: WebhookEvent;

  @IsString()
  @IsOptional()
  secret?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  retryAttempts?: number = 3;

  @IsInt()
  @Min(1000)
  @Max(30000)
  @IsOptional()
  timeoutMs?: number = 5000;
}
