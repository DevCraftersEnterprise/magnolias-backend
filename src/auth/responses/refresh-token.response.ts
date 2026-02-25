import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class RefreshTokenResponse {
  @ApiProperty({
    description: 'The refreshed user information',
    type: () => User,
  })
  user: Partial<User>;

  @ApiProperty({
    description: 'The new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The new refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
