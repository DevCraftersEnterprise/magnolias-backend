import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { BranchesService } from '../../branches/branches.service';
import { User } from '../../users/entities/user.entity';
import { CreateBranchEmployeeDto } from '../dto/create-branch-employee.dto';
import { BranchEmployee } from '../entities/branch-employee.entity';
import { isPinTakenInBranch } from '../utils/check-pin-availability.util';

@Injectable()
export class CreateBranchEmployeeUseCase {
  private readonly logger = new Logger(CreateBranchEmployeeUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
    private readonly branchesService: BranchesService,
  ) {}

  async execute(
    dto: CreateBranchEmployeeDto,
    user: User,
  ): Promise<BranchEmployee> {
    const { name, lastname, pin, branchId } = dto;

    const branch = await this.branchesService.findBranchByTerm(branchId);

    const pinTaken = await isPinTakenInBranch(
      this.branchEmployeeRepository,
      branch.id,
      pin,
    );

    if (pinTaken) {
      this.logger.log(`Duplicated PIN for branch ID: ${branch.id}`);
      throw new ConflictException(
        'Another active employee in this branch already uses this PIN',
      );
    }

    const hashedPin = await argon2.hash(pin);

    const employee = this.branchEmployeeRepository.create({
      name,
      lastname,
      pin: hashedPin,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    const savedEmployee = await this.branchEmployeeRepository.save(employee);

    this.logger.log(
      `Branch employee created with ID: ${savedEmployee.id} for branch ${branch.id}`,
    );

    return savedEmployee;
  }
}
