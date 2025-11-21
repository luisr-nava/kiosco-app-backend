import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  shopIds?: string[];
}
