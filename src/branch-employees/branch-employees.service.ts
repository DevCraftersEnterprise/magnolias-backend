import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateBranchEmployeeDto } from './dto/create-branch-employee.dto';
import { UpdateBranchEmployeeDto } from './dto/update-branch-employee.dto';
import { VerifyEmployeePinDto } from './dto/verify-employee-pin.dto';
import { BranchEmployee } from './entities/branch-employee.entity';
import { RegenerateBranchEmployeePinResponse } from './responses/regenerate-branch-employee-pin.response';
import { VerifyEmployeePinResponse } from './responses/verify-employee-pin.response';
import { CreateBranchEmployeeUseCase } from './usecases/create-branch-employee.usecase';
import { FindAllBranchEmployeesUseCase } from './usecases/find-all-branch-employees.usecase';
import { RegenerateBranchEmployeePinUseCase } from './usecases/regenerate-branch-employee-pin.usecase';
import { RemoveBranchEmployeeUseCase } from './usecases/remove-branch-employee.usecase';
import { UpdateBranchEmployeeUseCase } from './usecases/update-branch-employee.usecase';
import { VerifyEmployeePinUseCase } from './usecases/verify-employee-pin.usecase';

@Injectable()
export class BranchEmployeesService {
  constructor(
    private readonly createBranchEmployeeUseCase: CreateBranchEmployeeUseCase,
    private readonly findAllBranchEmployeesUseCase: FindAllBranchEmployeesUseCase,
    private readonly updateBranchEmployeeUseCase: UpdateBranchEmployeeUseCase,
    private readonly removeBranchEmployeeUseCase: RemoveBranchEmployeeUseCase,
    private readonly verifyEmployeePinUseCase: VerifyEmployeePinUseCase,
    private readonly regenerateBranchEmployeePinUseCase: RegenerateBranchEmployeePinUseCase,
  ) {}

  async create(
    dto: CreateBranchEmployeeDto,
    user: User,
  ): Promise<BranchEmployee> {
    return this.createBranchEmployeeUseCase.execute(dto, user);
  }

  async findAllByBranch(
    branchId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<BranchEmployee> | BranchEmployee[]> {
    return this.findAllBranchEmployeesUseCase.execute(branchId, paginationDto);
  }

  async update(
    id: string,
    dto: UpdateBranchEmployeeDto,
    user: User,
  ): Promise<BranchEmployee> {
    return this.updateBranchEmployeeUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return this.removeBranchEmployeeUseCase.execute(id, user);
  }

  async verifyPin(
    dto: VerifyEmployeePinDto,
    user: User,
  ): Promise<VerifyEmployeePinResponse> {
    return this.verifyEmployeePinUseCase.execute(dto, user);
  }

  async regeneratePin(
    id: string,
    user: User,
  ): Promise<RegenerateBranchEmployeePinResponse> {
    return this.regenerateBranchEmployeePinUseCase.execute(id, user);
  }
}
