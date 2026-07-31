import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from '../branches/branches.module';
import { CommonModule } from '../common/common.module';
import { CustomJwtModule } from '../custom-jwt/custom-jwt.module';
import { BranchEmployeesController } from './branch-employees.controller';
import { BranchEmployeesService } from './branch-employees.service';
import { BranchEmployee } from './entities/branch-employee.entity';
import { EmployeePinThrottleGuard } from './guards/employee-pin-throttle.guard';
import { CreateBranchEmployeeUseCase } from './usecases/create-branch-employee.usecase';
import { FindAllBranchEmployeesUseCase } from './usecases/find-all-branch-employees.usecase';
import { RegenerateBranchEmployeePinUseCase } from './usecases/regenerate-branch-employee-pin.usecase';
import { RemoveBranchEmployeeUseCase } from './usecases/remove-branch-employee.usecase';
import { UpdateBranchEmployeeUseCase } from './usecases/update-branch-employee.usecase';
import { VerifyEmployeePinUseCase } from './usecases/verify-employee-pin.usecase';

@Module({
  controllers: [BranchEmployeesController],
  providers: [
    // Services
    BranchEmployeesService,
    // Guards
    EmployeePinThrottleGuard,
    // Use Cases
    CreateBranchEmployeeUseCase,
    FindAllBranchEmployeesUseCase,
    UpdateBranchEmployeeUseCase,
    RemoveBranchEmployeeUseCase,
    VerifyEmployeePinUseCase,
    RegenerateBranchEmployeePinUseCase,
  ],
  imports: [
    TypeOrmModule.forFeature([BranchEmployee]),
    CommonModule,
    CustomJwtModule,
    BranchesModule,
  ],
  exports: [TypeOrmModule, BranchEmployeesService],
})
export class BranchEmployeesModule {}
