import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenResponse } from '../../auth/responses/refresh-token.response';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { sanitizeUser } from '../../users/utils/sanitized-user.util';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    oldRefreshToken: string,
    currentUser: User,
  ): Promise<RefreshTokenResponse> {
    const refreshStart = Date.now();

    const payload = this.jwtService.verify(oldRefreshToken);

    if (payload.type !== 'refresh')
      this.throwRefreshTokenAttempt('Invalid token type');
    if (payload.id !== currentUser.id)
      this.throwRefreshTokenAttempt('Token does not match user');
    if (!currentUser.isActive)
      this.throwRefreshTokenAttempt('User is not active');

    const user = await this.usersService.findUserByTerm(payload.id);

    if (!user) this.throwRefreshTokenAttempt('User not found');
    if (!user.isActive) this.throwRefreshTokenAttempt('User is not active');

    const accessPayload = { id: user.id, type: 'access' };
    const refreshPayload = { id: user.id, type: 'refresh' };

    const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRY');

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: refreshTokenExpiry,
    });

    const refreshTime = Date.now() - refreshStart;

    this.logger.log(
      `Successful token refresh for user: ${user.username} (${user.role}) (${refreshTime}ms)`,
    );

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  private throwRefreshTokenAttempt(exceptionMessage: string) {
    this.logger.warn(`Failed token refresh attempt`);
    throw new BadRequestException(exceptionMessage);
  }
}
