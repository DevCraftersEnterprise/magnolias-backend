import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateCommonAddressDto } from './dto/create-common-address.dto';
import { UpdateCommonAddressDto } from './dto/update-common-address.dto';
import { CommonAddress } from './entities/common-address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(CommonAddress)
    private commonAddressRepository: Repository<CommonAddress>,
  ) {}

  async create(
    createAddressDto: CreateCommonAddressDto,
    user: User,
  ): Promise<CommonAddress> {
    const existing = await this.commonAddressRepository.findOne({
      where: {
        street: createAddressDto.street,
        number: createAddressDto.number,
        neighborhood: createAddressDto.neighborhood,
      },
    });

    if (existing) {
      throw new ConflictException(
        'An adress with the same street, number, and neighborhood already exists.',
      );
    }

    const address = this.commonAddressRepository.create({
      ...createAddressDto,
      createdBy: user,
      updatedBy: user,
    });

    return this.commonAddressRepository.save(address);
  }

  async findAll(search?: string): Promise<CommonAddress[]> {
    const whereConditions: FindOptionsWhere<CommonAddress> = {};

    if (search) {
      return this.commonAddressRepository.find({
        where: [
          { ...whereConditions, name: ILike(`%${search}%`) },
          { ...whereConditions, street: ILike(`%${search}%`) },
          { ...whereConditions, neighborhood: ILike(`%${search}%`) },
        ],
        order: { usageCount: 'DESC', name: 'ASC' },
        take: 20,
      });
    }

    return this.commonAddressRepository.find({
      where: whereConditions,
      order: { usageCount: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CommonAddress> {
    const address = await this.commonAddressRepository.findOne({
      where: { id, isActive: true },
    });

    if (!address) throw new NotFoundException('Address not found');

    return address;
  }

  async update(
    id: string,
    updateAddressDto: UpdateCommonAddressDto,
    user: User,
  ): Promise<CommonAddress> {
    const address = await this.findOne(id);

    Object.assign(address, updateAddressDto, { updatedBy: user });

    return this.commonAddressRepository.save(address);
  }

  async remove(id: string, user: User): Promise<void> {
    const address = await this.findOne(id);
    address.isActive = false;
    address.updatedBy = user;
    await this.commonAddressRepository.save(address);
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.commonAddressRepository.increment({ id }, 'usageCount', 1);
  }
}
