import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { CommonAddress } from './entities/common-address.entity';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [
    TypeOrmModule.forFeature([CommonAddress]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, AddressesService],
})
export class AddressesModule {}
