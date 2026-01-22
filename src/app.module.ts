import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CustomJwtModule } from './custom-jwt/custom-jwt.module';
import { CustomPassportModule } from './custom-passport/custom-passport.module';
import { CustomThrottlerModule } from './custom-throttler/custom-throttler.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    CustomJwtModule,
    CustomPassportModule,
    CustomThrottlerModule,
    DatabaseModule,
    UsersModule,
    BranchesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
