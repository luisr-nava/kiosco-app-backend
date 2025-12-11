import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class UpdateStockThresholdDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  lowStockThreshold: number;
}
