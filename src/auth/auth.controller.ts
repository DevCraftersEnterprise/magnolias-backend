import { Body, Controller, Get, Ip, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from 'src/users/entities/user.entity';
import { sanitizeUser } from 'src/users/utils/sanitized-user.util';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/curret-user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginResponse } from './responses/login.response';
import { RefreshTokenResponse } from './responses/refresh-token.response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loginThrottleGuard: LoginThrottleGuard,
  ) {}

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  @ApiOperation({
    summary: 'User login endpoint',
    description:
      'Endpoint for user login that returns access and refresh tokens upon successful authentication.',
  })
  @ApiCreatedResponse({
    description: 'Login successful',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests - Login attempts exceeded',
  })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Endpoint to refresh the access token using a valid refresh token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Valid refresh token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Access token refreshed successfully',
    type: RefreshTokenResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or expired refresh token',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests - Refresh attempts exceeded',
  })
  refreshToken(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser() user: User,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(refreshToken, user);
  }

  @Get('validate-token')
  @UseGuards(AccessTokenGuard, JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Validate access token',
    description:
      'Endpoint to validate the access token and retrieve the current user information.',
  })
  @ApiOkResponse({
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        user: { type: 'object', description: 'Sanitized user information' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or expired access token',
  })
  validateToken(@CurrentUser() user: User): {
    valid: boolean;
    user: Partial<User>;
  } {
    return {
      valid: true,
      user: sanitizeUser(user),
    };
  }
}
