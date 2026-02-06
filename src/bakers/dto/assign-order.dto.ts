import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AssignOrderDto {
  @ApiProperty({
    description: 'ID of the order to assign',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  orderId: string;

  @ApiProperty({
    description: 'Assignment date',
    example: '2023-01-01T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Assigned date must be a valid date' })
  assignedDate?: Date;

  @ApiProperty({
    description: 'Notes about the assignment',
    example: 'Prioridad alta - entrega mañana',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
