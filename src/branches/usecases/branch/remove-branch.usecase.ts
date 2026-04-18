import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBranchDto } from '../../../branches/dto/update-branch.dto';
import { Branch } from '../../../branches/entities/branch.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class RemoveBranchUseCase {
  private readonly logger = new Logger(RemoveBranchUseCase.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async execute(updateBranchDto: UpdateBranchDto, user: User): Promise<void> {
    const { id } = updateBranchDto;

    this.logger.log(`Removing branch by user: ${user.id}`);

    const branch = await this.branchRepository.findOne({
      where: { id, isActive: true },
    });

    if (!branch) {
      this.logger.warn(
        `Branch with ID ${id} not found for removal or already inactive`,
      );
      throw new NotFoundException(
        `Branch with ID ${id} not found or already inactive`,
      );
    }

    Object.assign(branch, { isActive: false, updatedBy: user });

    await this.branchRepository.save(branch);

    this.logger.log(
      `Branch with ID ${id} removed successfully by user ${user.id}`,
    );
  }
}
