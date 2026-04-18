import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesController } from '../addresses/addresses.controller';
import { AddressesService } from '../addresses/addresses.service';
import { CommonAddress } from '../addresses/entities/common-address.entity';
import { CreateCommonAddressUseCase } from '../addresses/usecases/create-common-address.usecase';
import { FindAllCommonAddressesUseCase } from '../addresses/usecases/find-all-common-addresses.usecase';
import { FindOneCommonAddressUseCase } from '../addresses/usecases/find-one-common-address.usecase';
import { RemoveCommonAddressUseCase } from '../addresses/usecases/remove-common-address.usecase';
import { UpdateCommonAddressUseCase } from '../addresses/usecases/update-common-address.usecase';
import { CheckForDuplicateAddressUtil } from '../addresses/utils/check-for-duplicate-address.util';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';

@Module({
  controllers: [AddressesController],
  providers: [
    // Services
    AddressesService,
    // Utils
    CheckForDuplicateAddressUtil,
    // Use Cases
    CreateCommonAddressUseCase,
    FindAllCommonAddressesUseCase,
    FindOneCommonAddressUseCase,
    UpdateCommonAddressUseCase,
    RemoveCommonAddressUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([CommonAddress]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, AddressesService],
})
export class AddressesModule {}
