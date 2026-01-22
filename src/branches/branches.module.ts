import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService],
  imports: [TypeOrmModule.forFeature([Branch]), CommonModule, CustomJwtModule],
  exports: [TypeOrmModule, BranchesService],
})
export class BranchesModule {}
