import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { CustomPassportModule } from '../custom-passport/custom-passport.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginThrottleGuard } from './guards/login-throttle.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginThrottleGuard],
  imports: [
    ConfigModule,
    CustomPassportModule,
    CustomJwtModule,
    CommonModule,
    UsersModule,
  ],
  exports: [JwtStrategy, CustomPassportModule],
})
export class AuthModule {}
