import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BranchEmployee } from '../entities/branch-employee.entity';

@Injectable()
export class RemoveBranchEmployeeUseCase {
  private readonly logger = new Logger(RemoveBranchEmployeeUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
  ) {}

  async execute(id: string, user: User): Promise<void> {
    const employee = await this.branchEmployeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      this.logger.warn(`Branch employee not found with ID: ${id}`);
      throw new NotFoundException(`Branch employee with ID ${id} not found`);
    }

    if (!employee.isActive) {
      this.logger.log(`Branch employee already removed with ID: ${id}`);
      return;
    }

    Object.assign(employee, { isActive: false, updatedBy: user });
    await this.branchEmployeeRepository.save(employee);

    this.logger.log(`Branch employee removed with ID: ${id}`);
  }
}
