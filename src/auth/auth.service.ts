import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { VerifyDiscountAuthorizationDto } from '../auth/dto/verify-discount-authorization.dto';
import { LoginResponse } from '../auth/responses/login.response';
import { RefreshTokenResponse } from '../auth/responses/refresh-token.response';
import { VerifyDiscountAuthorizationResponse } from '../auth/responses/verify-discount-authorization.response';
import { LoginUseCase } from '../auth/usecases/login.usecase';
import { RefreshTokenUseCase } from '../auth/usecases/refresh-token.usecase';
import { VerifyDiscountAuthorizationUseCase } from '../auth/usecases/verify-discount-authorization.usecase';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly verifyDiscountAuthorizationUseCase: VerifyDiscountAuthorizationUseCase,
  ) {}

  async login(dto: LoginUserDto, ip: string): Promise<LoginResponse> {
    return await this.loginUseCase.execute(dto, ip);
  }

  async refreshToken(
    refreshToken: string,
    currentUser: User,
  ): Promise<RefreshTokenResponse> {
    return await this.refreshTokenUseCase.execute(refreshToken, currentUser);
  }

  async verifyDiscountAuthorization(
    dto: VerifyDiscountAuthorizationDto,
    ip: string,
  ): Promise<VerifyDiscountAuthorizationResponse> {
    return await this.verifyDiscountAuthorizationUseCase.execute(dto, ip);
  }
}
