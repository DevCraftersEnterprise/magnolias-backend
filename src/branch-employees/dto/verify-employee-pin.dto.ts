import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class VerifyEmployeePinDto {
  @ApiProperty({
    description: 'Numeric PIN of the employee performing the action',
    example: '4821',
  })
  @IsNotEmpty()
  @Matches(/^\d{4,6}$/, {
    message: 'pin must be a 4 to 6 digit number',
  })
  pin: string;
}
