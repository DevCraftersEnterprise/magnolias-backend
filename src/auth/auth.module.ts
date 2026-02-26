import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { LoginThrottleGuard } from '../auth/guards/login-throttle.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LoginUseCase } from '../auth/usecases/login.usecase';
import { RefreshTokenUseCase } from '../auth/usecases/refresh-token.usecase';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomPassportModule } from '../custom-passport/custom-passport.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  providers: [
    // Services
    AuthService,
    // Strategies 
    JwtStrategy,
    // Guards
    LoginThrottleGuard,
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
  ],
  imports: [
    ConfigModule,
    CustomPassportModule,
    CustomJwtModule,
    CommonModule,
    UsersModule,
  ],
  exports: [JwtStrategy, CustomPassportModule],
})
export class AuthModule { }
