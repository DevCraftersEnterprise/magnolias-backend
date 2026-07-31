import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateBranchEmployeeDto } from '../dto/update-branch-employee.dto';
import { BranchEmployee } from '../entities/branch-employee.entity';
import { isPinTakenInBranch } from '../utils/check-pin-availability.util';

@Injectable()
export class UpdateBranchEmployeeUseCase {
  private readonly logger = new Logger(UpdateBranchEmployeeUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
  ) {}

  async execute(
    id: string,
    dto: UpdateBranchEmployeeDto,
    user: User,
  ): Promise<BranchEmployee> {
    const { pin, ...rest } = dto;

    const employee = await this.branchEmployeeRepository.findOne({
      where: { id },
      relations: { branch: true },
    });

    if (!employee) {
      this.logger.warn(`Branch employee not found with ID: ${id}`);
      throw new NotFoundException(`Branch employee with ID ${id} not found`);
    }

    if (pin) {
      const pinTaken = await isPinTakenInBranch(
        this.branchEmployeeRepository,
        employee.branch.id,
        pin,
        employee.id,
      );

      if (pinTaken) {
        this.logger.log(
          `Duplicated PIN for branch ID: ${employee.branch.id}`,
        );
        throw new ConflictException(
          'Another active employee in this branch already uses this PIN',
        );
      }

      employee.pin = await argon2.hash(pin);
    }

    Object.assign(employee, { ...rest, updatedBy: user });

    const updatedEmployee = await this.branchEmployeeRepository.save(
      employee,
    );

    this.logger.log(`Branch employee updated with ID: ${updatedEmployee.id}`);

    return updatedEmployee;
  }
}
