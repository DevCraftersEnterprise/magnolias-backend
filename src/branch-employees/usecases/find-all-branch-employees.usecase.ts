import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { BranchEmployee } from '../entities/branch-employee.entity';
import { sanitizeBranchEmployees } from '../utils/sanitized-branch-employee.util';

@Injectable()
export class FindAllBranchEmployeesUseCase {
  private readonly logger = new Logger(FindAllBranchEmployeesUseCase.name);

  constructor(
    @InjectRepository(BranchEmployee)
    private readonly branchEmployeeRepository: Repository<BranchEmployee>,
  ) {}

  async execute(
    branchId: string,
    paginationDto: PaginationDto,
  ): Promise<
    | PaginationResponse<Omit<BranchEmployee, 'pin'>>
    | Omit<BranchEmployee, 'pin'>[]
  > {
    const { limit, offset } = paginationDto;

    const [items, total] = await this.branchEmployeeRepository.findAndCount({
      where: { branch: { id: branchId } },
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    const sanitizedItems = sanitizeBranchEmployees(items);

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(
        `Found ${items.length} branch employees with pagination for branch ${branchId}`,
      );

      return {
        items: sanitizedItems,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(
      `Found ${items.length} branch employees without pagination for branch ${branchId}`,
    );

    return sanitizedItems;
  }
}
