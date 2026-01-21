import { Body, Controller, Get, Ip, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/curret-user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginResponse } from './responses/login.response';
import { RefreshTokenResponse } from './responses/refresh-token.response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginThrottleGuard: LoginThrottleGuard,
  ) {}

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  async login(
    @Ip() ip: string,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginResponse> {
    try {
      const result = await this.authService.login(loginUserDto, ip);
      this.loginThrottleGuard.clearFailedAttempts(ip);
      return result;
    } catch (error) {
      this.loginThrottleGuard.recordFailedAttempt(ip);
      throw error;
    }
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  refreshToken(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser() user: User,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(refreshToken, user);
  }

  @Get('validate-token')
  @UseGuards(AccessTokenGuard, JwtAuthGuard)
  validateToken(@CurrentUser() user: User): {
    valid: boolean;
    user: Partial<User>;
  } {
    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
