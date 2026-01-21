import { IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^\d+$/, { message: 'userkey must contain only numbers' })
  userkey: string;
}
