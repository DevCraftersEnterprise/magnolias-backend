import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class VerifyDiscountAuthorizationDto {
  @ApiProperty({
    description: 'Username of the admin/super authorizing the discount',
    example: 'admin_user',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The userkey (password) of the admin/super (numeric only)',
    example: '12345',
    minLength: 5,
  })
  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^\d+$/, { message: 'userkey must contain only numbers' })
  userkey: string;
}
