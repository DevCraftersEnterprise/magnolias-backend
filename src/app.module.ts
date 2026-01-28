import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { CommonModule } from './common/common.module';
import { CustomJwtModule } from './custom-jwt/custom-jwt.module';
import { CustomPassportModule } from './custom-passport/custom-passport.module';
import { CustomThrottlerModule } from './custom-throttler/custom-throttler.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

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
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
