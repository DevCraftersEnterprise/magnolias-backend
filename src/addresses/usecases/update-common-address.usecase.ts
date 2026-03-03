import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCommonAddressDto } from '../../addresses/dto/update-common-address.dto';
import { CommonAddress } from '../../addresses/entities/common-address.entity';
import { CheckForDuplicateAddressUtil } from '../../addresses/utils/check-for-duplicate-address.util';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UpdateCommonAddressUseCase {
  private readonly logger = new Logger(UpdateCommonAddressUseCase.name);

  constructor(
    @InjectRepository(CommonAddress)
    private commonAddressRepository: Repository<CommonAddress>,
    private readonly checkForDuplicateAddressUtil: CheckForDuplicateAddressUtil,
  ) {}

  async execute(
    id: string,
    updateCommonAddressDto: UpdateCommonAddressDto,
    user: User,
  ): Promise<CommonAddress> {
    const address = await this.commonAddressRepository.findOne({
      where: { id },
    });

    if (!address) {
      this.logger.warn(`Address with ID ${id} not found for update`);
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    const { street, number, neighborhood } = updateCommonAddressDto;

    const duplicateAddress =
      await this.checkForDuplicateAddressUtil.checkForDuplicate(
        street ?? address.street,
        number ?? address.number,
        neighborhood ?? address.neighborhood,
      );

    if (duplicateAddress && duplicateAddress.id !== id) {
      this.logger.warn(
        `Duplicate address found with ID ${duplicateAddress.id} for update`,
      );
      throw new ConflictException(
        `Another address with the same street, number, and neighborhood already exists`,
      );
    }

    Object.assign(address, updateCommonAddressDto, { updateBy: user });

    const updatedCommonAddress =
      await this.commonAddressRepository.save(address);

    this.logger.log(
      `Address with ID ${id} updated successfully by user ${user.id}`,
    );

    return updatedCommonAddress;
  }
}
