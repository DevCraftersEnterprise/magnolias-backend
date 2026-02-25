import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';
import { CustomJwtModule } from '@/custom-jwt/custom-jwt.module';

import { BranchesController } from '@/branches/branches.controller';
import { BranchesService } from '@/branches/branches.service';
import { Branch } from '@/branches/entities/branch.entity';
import { Phone } from '@/branches/entities/phone.entity';

import { CreateBranchUseCase } from '@/branches/usecases/branch/create-branch.usecase';
import { FindAllBranchesUseCase } from '@/branches/usecases/branch/find-all-branches.usecase';
import { FindOneBranchUseCase } from '@/branches/usecases/branch/find-one-branch.usecase';
import { RemoveBranchUseCase } from '@/branches/usecases/branch/remove-branch.usecase';
import { UpdateBranchUseCase } from '@/branches/usecases/branch/update-branch.usecase';

import { CreatePhoneForBranchUseCase } from '@/branches/usecases/phones/create-phone-for-branch.usecase';
import { UpdatePhoneForBranchUseCase } from '@/branches/usecases/phones/update-phone-for-branch.usecase';

@Module({
  controllers: [BranchesController],
  providers: [
    // Services
    BranchesService,
    // Use cases
    CreateBranchUseCase,
    FindAllBranchesUseCase,
    FindOneBranchUseCase,
    RemoveBranchUseCase,
    UpdateBranchUseCase,
    CreatePhoneForBranchUseCase,
    UpdatePhoneForBranchUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([Branch, Phone]),
    CommonModule,
    CustomJwtModule,
  ],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule { }
