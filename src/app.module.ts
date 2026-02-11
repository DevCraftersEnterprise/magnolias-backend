import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BakersModule } from './bakers/bakers.module';
import { BranchesModule } from './branches/branches.module';
import { BreadTypesModule } from './bread-types/bread-types.module';
import { CategoriesModule } from './categories/categories.module';
import { ColorsModule } from './colors/colors.module';
import { CommonModule } from './common/common.module';
import { CustomJwtModule } from './custom-jwt/custom-jwt.module';
import { CustomPassportModule } from './custom-passport/custom-passport.module';
import { CustomThrottlerModule } from './custom-throttler/custom-throttler.module';
import { CustomersModule } from './customers/customers.module';
import { DatabaseModule } from './database/database.module';
import { FillingsModule } from './fillings/fillings.module';
import { FlavorsModule } from './flavors/flavors.module';
import { FlowersModule } from './flowers/flowers.module';
import { FrostingsModule } from './frostings/frostings.module';
import { OrdersModule } from './orders/orders.module';
import { PrinterModule } from './printer/printer.module';
import { ProductsModule } from './products/products.module';
import { StylesModule } from './styles/styles.module';
import { UsersModule } from './users/users.module';
import { FormatsModule } from './formats/formats.module';
import { AddressesModule } from './addresses/addresses.module';

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
    CategoriesModule,
    PrinterModule,
    FormatsModule,
    AddressesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
