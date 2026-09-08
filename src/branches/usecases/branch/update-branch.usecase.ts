import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBranchDto } from '../../../branches/dto/update-branch.dto';
import { Branch } from '../../../branches/entities/branch.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class UpdateBranchUseCase {
  private readonly logger = new Logger(UpdateBranchUseCase.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async execute(updateBranchDto: UpdateBranchDto, user: User): Promise<Branch> {
    const { id } = updateBranchDto;

    this.logger.log(`Updating branch by user: ${user.id}`);

    const branch = await this.branchRepository.findOne({ where: { id } });

    if (!branch) {
      this.logger.warn(`Branch with ID ${id} not found for update`);
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    Object.assign(branch, updateBranchDto, { updatedBy: user });

    const updatedBranch = await this.branchRepository.save(branch);

    this.logger.log(
      `Branch with ID ${id} updated successfully by user ${user.id}`,
    );

    return updatedBranch;
  }
}
