import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';

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

  @ApiPropertyOptional({
    description:
      'Short-lived token obtained from POST /branch-employees/verify-pin, required when the current session is a shared branch EMPLOYEE account',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString({ message: 'Employee action token must be a string' })
  employeeActionToken?: string;
}
