import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BranchEmployee } from '../entities/branch-employee.entity';
import { generateRandomPin } from '../utils/generate-random-pin.util';
import { isPinTakenInBranch } from '../utils/check-pin-availability.util';
import { RegenerateBranchEmployeePinResponse } from '../responses/regenerate-branch-employee-pin.response';

const MAX_GENERATION_ATTEMPTS = 10;

@Injectable()
export class RegenerateBranchEmployeePinUseCase {
  private readonly logger = new Logger(RegenerateBranchEmployeePinUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
  ) {}

  async execute(
    id: string,
    user: User,
  ): Promise<RegenerateBranchEmployeePinResponse> {
    const employee = await this.branchEmployeeRepository.findOne({
      where: { id },
      relations: { branch: true },
    });

    if (!employee) {
      this.logger.warn(`Branch employee not found with ID: ${id}`);
      throw new NotFoundException(`Branch employee with ID ${id} not found`);
    }

    let pin: string | undefined;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const candidate = generateRandomPin();
      const taken = await isPinTakenInBranch(
        this.branchEmployeeRepository,
        employee.branch.id,
        candidate,
        employee.id,
      );

      if (!taken) {
        pin = candidate;
        break;
      }
    }

    if (!pin) {
      this.logger.error(
        `Could not generate a unique PIN for branch ${employee.branch.id} after ${MAX_GENERATION_ATTEMPTS} attempts`,
      );
      throw new InternalServerErrorException(
        'Could not generate a unique PIN, please try again',
      );
    }

    employee.pin = await argon2.hash(pin);
    employee.updatedBy = user;
    await this.branchEmployeeRepository.save(employee);

    this.logger.log(`PIN regenerated for branch employee ID: ${employee.id}`);

    return { pin };
  }
}
