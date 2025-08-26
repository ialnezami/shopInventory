import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsString()
  product: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class PaymentDto {
  @IsEnum(['cash', 'card', 'digital', 'bank_transfer'])
  method: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  cardLast4?: string;

  @IsString()
  @IsOptional()
  cardBrand?: string;
}

export class TotalsDto {
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  tax: number;

  @IsNumber()
  @Min(0)
  discount: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateSaleDto {
  @IsString()
  @IsOptional()
  customer?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @ValidateNested()
  @Type(() => TotalsDto)
  totals: TotalsDto;

  @IsEnum(['pending', 'completed', 'cancelled', 'refunded'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
