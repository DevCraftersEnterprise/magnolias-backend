import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { sanitizeUser } from '../users/utils/sanitized-user.util';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './responses/login.response';
import { RefreshTokenResponse } from './responses/refresh-token.response';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginUserDto, ip: string): Promise<LoginResponse> {
    const { username, userkey } = dto;

    const loginStart = Date.now();

    this.logger.log(`Login attempt for user: ${username} from IP: ${ip}`);

    const user = await this.usersService.findUserByTerm(username);

    if (!user) {
      this.throwLoginAttempt(loginStart, ip, 'User not found');
    }

    if (!user.isActive) {
      this.throwLoginAttempt(loginStart, ip, 'User is not active');
    }

    const isValidUserkey = await argon2.verify(user.userkey!, userkey);

    if (!isValidUserkey) {
      this.throwLoginAttempt(loginStart, ip, 'User credentials are invalid');
    }

    const loginTime = Date.now() - loginStart;

    this.logger.log(
      `Successful login for user: ${username} (${user.role}) from IP: ${ip} (${loginTime}ms)`,
    );

    const accessPayload = { id: user.id, type: 'access' };
    const refreshPayload = { id: user.id, type: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload);

    const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRY');

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: refreshTokenExpiry,
    });

    return {
      message: `Bienvenido ${user.name} ${user.lastname}`,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(
    refreshToken: string,
    currentUser: User,
  ): Promise<RefreshTokenResponse> {
    const refreshStart = Date.now();

    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        this.throwRefreshTokenAttempt('Invalid token type');
      }

      if (payload.id !== currentUser.id) {
        this.throwRefreshTokenAttempt('Token does not match user');
      }

      if (!currentUser.isActive) {
        this.throwRefreshTokenAttempt('User is not active');
      }

      const user = await this.usersService.findUserByTerm(payload.id);

      if (!user) this.throwRefreshTokenAttempt('User not found');

      if (!user.isActive) {
        this.throwRefreshTokenAttempt('User is not active');
      }

      const newAccessPayload = { id: user.id, type: 'access' };
      const newRefreshPayload = { id: user.id, type: 'refresh' };

      const newAccessToken = this.jwtService.sign(newAccessPayload);

      const refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRY');

      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        expiresIn: refreshTokenExpiry,
      });

      const refreshTime = Date.now() - refreshStart;
      this.logger.log(
        `Token refreshed successfully for user: ${user.username} (${user.role}) (${refreshTime}ms)`,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: sanitizeUser(user),
      };
    } catch {
      const refreshTime = Date.now() - refreshStart;
      this.logger.warn(
        `Token refresh failed for user: ${currentUser.username} (${refreshTime}ms)`,
      );
      throw new BadRequestException('Invalid refresh token');
    }
  }

  private throwLoginAttempt(
    loginStart: number,
    ip: string,
    exceptionMessage: string,
  ) {
    const loginTime = Date.now() - loginStart;

    this.logger.warn(`Failed login attempt - From IP: ${ip} (${loginTime}ms)`);
    throw new BadRequestException(exceptionMessage);
  }
  private throwRefreshTokenAttempt(exceptionMessage: string) {
    this.logger.warn(`Failed token refresh attempt`);
    throw new BadRequestException(exceptionMessage);
  }
}
