import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VerifyEmployeePinDto } from '../dto/verify-employee-pin.dto';
import { BranchEmployee } from '../entities/branch-employee.entity';
import { VerifyEmployeePinResponse } from '../responses/verify-employee-pin.response';

@Injectable()
export class VerifyEmployeePinUseCase {
  private readonly logger = new Logger(VerifyEmployeePinUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    dto: VerifyEmployeePinDto,
    user: User,
  ): Promise<VerifyEmployeePinResponse> {
    const attemptStart = Date.now();

    if (!user.branch) {
      this.logger.warn(
        `User ${user.id} attempted PIN verification without a branch`,
      );
      throw new BadRequestException(
        'Current user is not assigned to a branch',
      );
    }

    const activeEmployees = await this.branchEmployeeRepository.find({
      where: { branch: { id: user.branch.id }, isActive: true },
    });

    let matchedEmployee: BranchEmployee | undefined;

    for (const employee of activeEmployees) {
      if (await argon2.verify(employee.pin, dto.pin)) {
        matchedEmployee = employee;
        break;
      }
    }

    if (!matchedEmployee) {
      const attemptTime = Date.now() - attemptStart;
      this.logger.warn(
        `Failed employee PIN attempt for branch ${user.branch.id} (${attemptTime}ms)`,
      );
      throw new BadRequestException('Invalid PIN');
    }

    const employeeActionPayload = {
      employeeId: matchedEmployee.id,
      branchId: user.branch.id,
      type: 'employee-action',
    };

    const employeeActionTokenExpiry = this.configService.get(
      'EMPLOYEE_ACTION_TOKEN_EXPIRY',
    );

    const employeeActionToken = this.jwtService.sign(employeeActionPayload, {
      expiresIn: employeeActionTokenExpiry,
    });

    const attemptTime = Date.now() - attemptStart;
    this.logger.log(
      `Employee action authorized for ${matchedEmployee.name} ${matchedEmployee.lastname} (${attemptTime}ms)`,
    );

    return {
      employeeActionToken,
      employeeName: `${matchedEmployee.name} ${matchedEmployee.lastname}`,
    };
  }
}
