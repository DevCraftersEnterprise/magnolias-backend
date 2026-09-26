import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ClaimOrderDeliveryDto {
  @ApiProperty({
    description: 'Notes about the delivery, added by the driver taking it',
    example: 'Salgo en 10 minutos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
