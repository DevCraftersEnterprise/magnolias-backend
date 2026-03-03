import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonAddress } from '../../addresses/entities/common-address.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RemoveCommonAddressUseCase {
  private readonly logger = new Logger(RemoveCommonAddressUseCase.name);

  constructor(
    @InjectRepository(CommonAddress)
    private commonAddressRepository: Repository<CommonAddress>,
  ) {}

  async execute(id: string, user: User): Promise<void> {
    const address = await this.commonAddressRepository.findOne({
      where: { id },
    });

    if (!address) {
      this.logger.warn(`Address with ID ${id} not found for removal`);
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    Object.assign(address, { isActive: false, updatedBy: user });

    await this.commonAddressRepository.save(address);

    this.logger.log(
      `Address with ID ${id} removed successfully by user ${user.id}`,
    );
  }
}
