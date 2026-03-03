import { Injectable } from '@nestjs/common';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { LoginResponse } from '../auth/responses/login.response';
import { RefreshTokenResponse } from '../auth/responses/refresh-token.response';
import { LoginUseCase } from '../auth/usecases/login.usecase';
import { RefreshTokenUseCase } from '../auth/usecases/refresh-token.usecase';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
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
}
