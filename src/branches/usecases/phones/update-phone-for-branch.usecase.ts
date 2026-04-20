import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePhonesDto } from '../../../branches/dto/update-phones.dto';
import { Phone } from '../../../branches/entities/phone.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class UpdatePhoneForBranchUseCase {
  private readonly logger = new Logger(UpdatePhoneForBranchUseCase.name);

  constructor(
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) { }

  async execute(updatePhoneDto: UpdatePhonesDto, user: User): Promise<Phone> {
    const { id } = updatePhoneDto;

    const phones = await this.phoneRepository.findOne({
      where: { id },
    });

    if (!phones) {
      this.logger.warn(`Phone with ID ${id} not found`);
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }

    Object.assign(phones, { ...updatePhoneDto, updatedBy: user });

    const savedPhones = await this.phoneRepository.save(phones);

    this.logger.log(`Updated phone with ID ${savedPhones.id}`);

    return savedPhones;
  }
}
