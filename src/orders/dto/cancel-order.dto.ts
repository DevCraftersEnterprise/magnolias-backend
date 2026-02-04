import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({
    description: 'Unique identifier of the order to be canceled',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Reason for canceling the order',
    example: 'Customer requested cancellation',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
