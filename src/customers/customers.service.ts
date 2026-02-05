import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersFilterDto } from './dto/customers-filter.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async createCustomer(dto: CreateCustomerDto, user: User): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findOne({
      where: { phone: dto.phone },
    });

    if (existingCustomer) {
      throw new BadRequestException(
        `Customer with this phone ${dto.phone} already exists`,
      );
    }

    const customer = this.customerRepository.create({
      ...dto,
      createdBy: user,
      updatedBy: user,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(
    filterDto: CustomersFilterDto,
  ): Promise<PaginationResponse<Customer>> {
    const { name, phone, isActive, limit = 10, offset = 0 } = filterDto;

    const whereConditions: FindOptionsWhere<Customer> = {};

    if (name) whereConditions.fullName = ILike(`%${name}%`);
    if (phone) whereConditions.phone = ILike(`%${phone}%`);
    if (isActive !== undefined) whereConditions.isActive = isActive;

    const [customers, total] = await this.customerRepository.findAndCount({
      where: whereConditions,
      select: {
        id: true,
        fullName: true,
        phone: true,
        alternativePhone: true,
        address: true,
        alternativeAddress: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      skip: offset,
      order: { fullName: 'DESC' },
    });

    return {
      items: customers,
      total,
      pagination: {
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }

  async findOne(term: string): Promise<Customer> {
    const whereCondition: FindOptionsWhere<Customer> = {};

    if (isUUID(term)) whereCondition.id = term;
    else whereCondition.phone = term;

    const customer = await this.customerRepository.findOne({
      where: whereCondition,
      relations: { orders: { branch: true, details: true } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        alternativePhone: true,
        address: true,
        alternativeAddress: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          id: true,
          deliveryDate: true,
          branch: {
            name: true,
          },
          details: {
            id: true,
            product: { id: true, name: true },
            notes: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${term} not found`);
    }

    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    user: User,
  ): Promise<Customer> {
    const { phone } = dto;

    const customer = await this.findOne(id);

    if (phone && phone !== customer.phone) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { phone },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new BadRequestException(
          `Another customer with phone ${phone} already exists`,
        );
      }
    }

    Object.assign(customer, dto);
    customer.updatedBy = user;

    return await this.customerRepository.save(customer);
  }

  async remove(id: string, user: User): Promise<void> {
    const customer = await this.findOne(id);

    customer.isActive = false;
    customer.updatedBy = user;

    await this.customerRepository.save(customer);
  }
}
