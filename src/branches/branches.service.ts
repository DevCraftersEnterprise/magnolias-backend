import { Injectable } from '@nestjs/common';

import { PaginationResponse } from '@/common/responses/pagination.response';
import { User } from '@/users/entities/user.entity';

import { BranchesFilterDto } from '@/branches/dto/branches-filter.dto';
import { CreateBranchDto } from '@/branches/dto/create-branch.dto';
import { CreatePhonesDto } from '@/branches/dto/create-phones.dto';
import { UpdateBranchDto } from '@/branches/dto/update-branch.dto';
import { UpdatePhonesDto } from '@/branches/dto/update-phones.dto';
import { Branch } from '@/branches/entities/branch.entity';
import { Phone } from '@/branches/entities/phone.entity';

import { CreateBranchUseCase } from '@/branches/usecases/branch/create-branch.usecase';
import { FindAllBranchesUseCase } from '@/branches/usecases/branch/find-all-branches.usecase';
import { FindOneBranchUseCase } from '@/branches/usecases/branch/find-one-branch.usecase';
import { RemoveBranchUseCase } from '@/branches/usecases/branch/remove-branch.usecase';
import { UpdateBranchUseCase } from '@/branches/usecases/branch/update-branch.usecase';

import { CreatePhoneForBranchUseCase } from '@/branches/usecases/phones/create-phone-for-branch.usecase';
import { UpdatePhoneForBranchUseCase } from '@/branches/usecases/phones/update-phone-for-branch.usecase';


@Injectable()
export class BranchesService {

  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly findAllBranchesUseCase: FindAllBranchesUseCase,
    private readonly findOneBranchUseCase: FindOneBranchUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
    private readonly removeBranchUseCase: RemoveBranchUseCase,
    private readonly createPhoneForBranchUseCase: CreatePhoneForBranchUseCase,
    private readonly updatePhoneForBranchUseCase: UpdatePhoneForBranchUseCase,
  ) { }

  async create(dto: CreateBranchDto, user: User): Promise<Branch> {
    return await this.createBranchUseCase.execute(dto, user);
  }

  async findAll(filters: BranchesFilterDto,): Promise<PaginationResponse<Branch> | Branch[]> {
    return await this.findAllBranchesUseCase.execute(filters);
  }

  async findBranchByTerm(term: string): Promise<Branch> {
    return await this.findOneBranchUseCase.execute(term);
  }

  async updateBranch(dto: UpdateBranchDto, user: User): Promise<Branch> {
    return await this.updateBranchUseCase.execute(dto, user);
  }

  async deleteBranch(dto: UpdateBranchDto, user: User): Promise<void> {
    return await this.removeBranchUseCase.execute(dto, user);
  }

  async addBranchPhoneNumbers(dto: CreatePhonesDto, user: User, branchId: string,): Promise<Phone> {
    return await this.createPhoneForBranchUseCase.execute(dto, user, branchId);
  }

  async updateBranchPhoneNumbers(dto: UpdatePhonesDto, user: User,): Promise<Phone> {
    return await this.updatePhoneForBranchUseCase.execute(dto, user);
  }
}
