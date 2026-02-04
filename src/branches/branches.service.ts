import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { BranchesFilterDto } from './dto/branches-filter.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreatePhonesDto } from './dto/create-phones.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { UpdatePhonesDto } from './dto/update-phones.dto';
import { Branch } from './entities/branch.entity';
import { Phone } from './entities/phone.entity';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
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

  async findBranches(
    filters: BranchesFilterDto,
  ): Promise<PaginationResponse<Branch>> {
    const { name, address, limit = 10, offset = 0 } = filters;

    const whereConditions: FindOptionsWhere<Branch> = {};

    if (name) whereConditions.name = name;
    if (address) whereConditions.address = address;

    const [branches, total] = await this.branchRepository.findAndCount({
      where: whereConditions,
      relations: {
        phones: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        phones: {
          phone1: true,
          phone2: true,
          whatsapp: true,
        },
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
      relations: { phones: true },
      select: {
        id: true,
        name: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        phones: {
          phone1: true,
          phone2: true,
          whatsapp: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findBranchByTerm(term: string): Promise<Branch | null> {
    const whereConditions: FindOptionsWhere<Branch>[] = [];

    if (isUUID(term)) whereConditions.push({ id: term });
    whereConditions.push({ name: term });

    const branch = await this.branchRepository.findOne({
      where: whereConditions,
      relations: { phones: true },
      select: {
        id: true,
        name: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        phones: {
          phone1: true,
          phone2: true,
          whatsapp: true,
        },
      },
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

  async addBranchPhoneNumbers(
    dto: CreatePhonesDto,
    user: User,
    branchId: string,
  ): Promise<Phone> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new BadRequestException('Branch does not exist');
    }

    const phoneData: Partial<Phone> = {
      phone1: dto.phone1,
      createdBy: user,
      updatedBy: user,
      branch,
    };

    if (dto.phone2) phoneData.phone2 = dto.phone2;

    if (dto.whatsapp) phoneData.whatsapp = dto.whatsapp;

    const phones = this.phoneRepository.create(phoneData);

    const savedPhones = await this.phoneRepository.save(phones);

    branch.phones = savedPhones;
    branch.updatedBy = user;
    await this.branchRepository.save(branch);

    return savedPhones;
  }

  async updateBranchPhoneNumbers(
    dto: UpdatePhonesDto,
    user: User,
  ): Promise<Phone> {
    const { id, phone1, phone2, whatsapp } = dto;

    const phone = await this.phoneRepository.preload({ id });

    if (!phone) throw new Error('Phone record does not exist');

    phone.phone1 = phone1 ?? phone.phone1;
    phone.phone2 = phone2 === undefined ? '' : (phone2 ?? phone.phone2);
    phone.whatsapp = whatsapp === undefined ? '' : (whatsapp ?? phone.whatsapp);
    phone.updatedBy = user;

    const updatedPhone = await this.phoneRepository.save(phone);

    return updatedPhone;
  }
}
