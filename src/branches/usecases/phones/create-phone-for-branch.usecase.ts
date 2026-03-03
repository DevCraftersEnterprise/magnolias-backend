import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhonesDto } from '../../../branches/dto/create-phones.dto';
import { Branch } from '../../../branches/entities/branch.entity';
import { Phone } from '../../../branches/entities/phone.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class CreatePhoneForBranchUseCase {
  private readonly logger = new Logger(CreatePhoneForBranchUseCase.name);

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) {}

  async execute(
    createPhoneDto: CreatePhonesDto,
    user: User,
    branchId: string,
  ): Promise<Phone> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      this.logger.warn(`Branch with ID ${branchId} not found`);
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const phones = this.phoneRepository.create({
      ...createPhoneDto,
      branch,
      createdBy: user,
      updatedBy: user,
    });

    const savedPhones = await this.phoneRepository.save(phones);

    this.logger.log(
      `Created phone with ID ${savedPhones.id} for branch ID ${branchId}`,
    );

    Object.assign(branch, { phones: savedPhones, updatedBy: user });

    await this.branchRepository.save(branch);

    this.logger.log(
      `Updated branch with ID ${branchId} to associate new phone with ID ${savedPhones.id}`,
    );

    return savedPhones;
  }
}
