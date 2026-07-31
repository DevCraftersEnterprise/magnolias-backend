import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateBranchEmployeeDto {
  @ApiPropertyOptional({
    description: 'First name of the employee',
    example: 'María',
  })
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Last name of the employee',
    example: 'García',
  })
  @IsOptional()
  @MaxLength(100)
  lastname?: string;

  @ApiPropertyOptional({
    description: 'New numeric PIN for the employee',
    example: '4821',
  })
  @IsOptional()
  @Matches(/^\d{4,6}$/, {
    message: 'pin must be a 4 to 6 digit number',
  })
  pin?: string;

  @ApiPropertyOptional({
    description: 'Whether the employee is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
