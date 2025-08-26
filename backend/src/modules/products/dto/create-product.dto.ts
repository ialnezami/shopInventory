import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PriceDto {
  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  selling: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class InventoryDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  minStock: number;

  @IsString()
  @IsOptional()
  location?: string;
}

export class VariantDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsNumber()
  @IsOptional()
  priceModifier?: number;
}

export class DimensionsDto {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ValidateNested()
  @Type(() => InventoryDto)
  inventory: InventoryDto;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  @IsOptional()
  variants?: VariantDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
