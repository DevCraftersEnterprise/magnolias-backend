import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderDetailProductionStatus } from '../enums/order-detail-production-status.enum';

export class UpdateProductionStatusDto {
  @ApiProperty({
    description: 'New production status for this order detail line',
    enum: OrderDetailProductionStatus,
    example: OrderDetailProductionStatus.IN_PROCESS,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(OrderDetailProductionStatus, {
    message: 'Status must be a valid production status',
  })
  status: OrderDetailProductionStatus;
}
