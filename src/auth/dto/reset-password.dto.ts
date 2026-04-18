import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'sergiobg',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'New password',
    example: '1234567',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^\d+$/, { message: 'userkey must contain only numbers' })
  newPassword: string;
}
