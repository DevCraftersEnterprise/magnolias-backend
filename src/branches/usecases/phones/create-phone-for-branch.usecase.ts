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
  ) { }

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

    // Se usa update() en lugar de save(branch) a propósito: branch.phones se
    // cargó (eager) antes de crear el teléfono de arriba, por lo que en este
    // punto sigue siendo null en memoria. Un save() con cascade:true
    // interpretaría ese null como "quitar la relación" y pondría en NULL el
    // branchId del teléfono que se acaba de crear, violando el NOT NULL.
    await this.branchRepository.update(branchId, { updatedBy: user });

    return savedPhones;
  }
}
