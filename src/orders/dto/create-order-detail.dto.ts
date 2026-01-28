import { IsOptional, IsUUID, Min } from 'class-validator';

export class CreateOrderDetailDto {
  @Min(1)
  price: number;

  @Min(1)
  quantity: number;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;

  @IsOptional()
  notes?: string;
}
