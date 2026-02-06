import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SetPickupPersonDto {
  @ApiProperty({
    description: 'Name of the person who will pick up the order',
    example: 'María García',
  })
  @IsNotEmpty({ message: 'Pickup person name is required' })
  @IsString({ message: 'Pickup person name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  pickupPersonName: string;

  @ApiProperty({
    description: 'Phone number of the person who will pick up',
    example: '+52 123 456 7890',
  })
  @IsNotEmpty({ message: 'Pickup person phone is required' })
  @IsString({ message: 'Pickup person phone must be a string' })
  @MinLength(10, { message: 'Phone must be at least 10 characters' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  pickupPersonPhone: string;
}
