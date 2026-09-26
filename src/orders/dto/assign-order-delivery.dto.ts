import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AssignOrderDeliveryDto {
  @ApiProperty({
    description: 'ID of the driver to assign to this order',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty({ message: 'Driver ID is required' })
  @IsUUID('4', { message: 'Driver ID must be a valid UUID' })
  driverId: string;

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
    description: 'Notes about the delivery assignment',
    example: 'Entregar antes de las 5pm',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}
