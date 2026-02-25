import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommonAddressDto } from '../addresses/dto/create-common-address.dto';
import { UpdateCommonAddressDto } from '../addresses/dto/update-common-address.dto';
import { CommonAddress } from '../addresses/entities/common-address.entity';
import { CreateCommonAddressUseCase } from '../addresses/usecases/create-common-address.usecase';
import { FindAllCommonAddressesUseCase } from '../addresses/usecases/find-all-common-addresses.usecase';
import { FindOneCommonAddressUseCase } from '../addresses/usecases/find-one-common-address.usecase';
import { RemoveCommonAddressUseCase } from '../addresses/usecases/remove-common-address.usecase';
import { UpdateCommonAddressUseCase } from '../addresses/usecases/update-common-address.usecase';
import { User } from '../users/entities/user.entity';
@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(CommonAddress)
    private commonAddressRepository: Repository<CommonAddress>,
    private readonly createCommonAddressUseCase: CreateCommonAddressUseCase,
    private readonly findAllCommonAddressesUseCase: FindAllCommonAddressesUseCase,
    private readonly findOneCommonAddressUseCase: FindOneCommonAddressUseCase,
    private readonly updateCommonAddressUseCase: UpdateCommonAddressUseCase,
    private readonly removeCommonAddressUseCase: RemoveCommonAddressUseCase
  ) { }

  async create(createAddressDto: CreateCommonAddressDto, user: User,): Promise<CommonAddress> {
    return await this.createCommonAddressUseCase.execute(createAddressDto, user);
  }

  async findAll(search?: string): Promise<CommonAddress[]> {
    return await this.findAllCommonAddressesUseCase.execute(search);
  }

  async findOne(id: string): Promise<CommonAddress> {
    return await this.findOneCommonAddressUseCase.execute(id);
  }

  async update(id: string, updateAddressDto: UpdateCommonAddressDto, user: User,): Promise<CommonAddress> {
    return await this.updateCommonAddressUseCase.execute(id, updateAddressDto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeCommonAddressUseCase.execute(id, user);
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.commonAddressRepository.increment({ id }, 'usageCount', 1);
  }

  async decrementUsageCount(id: string): Promise<void> {
    await this.commonAddressRepository.decrement({ id }, 'usageCount', 1);
  }
}
