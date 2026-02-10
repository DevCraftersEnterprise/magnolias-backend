import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateCommonAddressDto } from './dto/create-common-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
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

  findAll(search?: string): Promise<CommonAddress[]> {
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

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }
}
