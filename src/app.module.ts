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
import { ColorsModule } from './colors/colors.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { BreadTypesModule } from './bread-types/bread-types.module';
import { FillingsModule } from './fillings/fillings.module';
import { FlavorsModule } from './flavors/flavors.module';
import { FrostingsModule } from './frostings/frostings.module';
import { StylesModule } from './styles/styles.module';
import { FlowersModule } from './flowers/flowers.module';
import { BakersModule } from './bakers/bakers.module';

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
    ColorsModule,
    OrdersModule,
    CustomersModule,
    BreadTypesModule,
    FillingsModule,
    FlavorsModule,
    FrostingsModule,
    StylesModule,
    FlowersModule,
    BakersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
