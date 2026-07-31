import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateBranchEmployeeDto {
  @ApiProperty({
    description: 'First name of the employee',
    example: 'María',
  })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Last name of the employee',
    example: 'García',
  })
  @IsNotEmpty()
  @MaxLength(100)
  lastname: string;

  @ApiProperty({
    description: 'Numeric PIN used by the employee to sign order actions',
    example: '4821',
    minLength: 4,
    maxLength: 6,
  })
  @IsNotEmpty()
  @Matches(/^\d{4,6}$/, {
    message: 'pin must be a 4 to 6 digit number',
  })
  pin: string;

  @ApiProperty({
    description: 'ID of the branch this employee belongs to',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
  branchId: string;
}
