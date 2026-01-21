import { User } from '../../users/entities/user.entity';

export interface RefreshTokenResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}
