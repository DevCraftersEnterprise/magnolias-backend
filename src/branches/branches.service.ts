import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginationResponse } from '../common/responses/pagination.response';
import { CreateBranchDto } from './dto/create-branch.dto';
import { User } from '../users/entities/user.entity';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async registerBranch(dto: CreateBranchDto, user: User) {
    const { name, address } = dto;

    const branchData: Partial<Branch> = {
      name,
      address,
      createdBy: user,
      updatedBy: user,
    };

    const branch = this.branchRepository.create(branchData);
    await this.branchRepository.save(branch);
    return branch;
  }

  async findBranches(filters: FilterDto): Promise<PaginationResponse<Branch>> {
    const { name, address, limit = 10, offset = 0 } = filters;

    const whereConditions: FindOptionsWhere<Branch> = {};

    if (name) whereConditions.name = name;
    if (address) whereConditions.address = address;

    const [branches, total] = await this.branchRepository.findAndCount({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      items: branches,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findAllBranches(): Promise<Branch[]> {
    return this.branchRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findBranchByTerm(term: string): Promise<Branch | null> {
    const whereConditions: FindOptionsWhere<Branch>[] = [];

    if (isUUID(term)) whereConditions.push({ id: term });
    whereConditions.push({ name: term });

    const branch = await this.branchRepository.findOne({
      where: whereConditions,
    });

    if (!branch) return null;

    return branch;
  }

  async updateBranch(dto: UpdateBranchDto, user: User): Promise<Branch> {
    const { id, name, address, isActive } = dto;

    const branch = await this.branchRepository.preload({ id });

    if (!branch) throw new Error('Branch does not exist');

    branch.name = name ?? branch.name;
    branch.address = address ?? branch.address;
    branch.isActive = isActive ?? branch.isActive;
    branch.updatedBy = user;

    const updatedBranch = await this.branchRepository.save(branch);

    return updatedBranch;
  }

  async deleteBranch(dto: UpdateBranchDto, user: User): Promise<void> {
    const { id } = dto;

    const isBranchActive = await this.branchRepository.findOne({
      where: { id, isActive: true },
    });

    if (!isBranchActive) {
      throw new BadRequestException(
        'Branch is already inactive or does not exist',
      );
    }

    await this.branchRepository.update(id, {
      isActive: false,
      updatedBy: user,
    });
  }
}
