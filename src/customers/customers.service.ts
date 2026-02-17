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
import { CustomerAddress } from './entities/customer-address.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepository: Repository<CustomerAddress>,
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

    // Exclude address from customer creation
    const { address, ...customerData } = dto;

    const customer = this.customerRepository.create({
      ...customerData,
      createdBy: user,
      updatedBy: user,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    // Create customer address if provided
    if (address) {
      const customerAddress = this.customerAddressRepository.create({
        ...address,
        customer: savedCustomer,
      });
      await this.customerAddressRepository.save(customerAddress);
    }

    return this.findOne(savedCustomer.id);
  }

  async findAll(
    filterDto: CustomersFilterDto,
  ): Promise<PaginationResponse<Customer> | Customer[]> {
    const { name, phone, isActive, limit, offset } = filterDto;

    const whereConditions: FindOptionsWhere<Customer> = {};

    if (name) whereConditions.fullName = ILike(`%${name}%`);
    if (phone) whereConditions.phone = ILike(`%${phone}%`);
    if (isActive !== undefined) whereConditions.isActive = isActive;

    const [customers, total] = await this.customerRepository.findAndCount({
      where: whereConditions,
      relations: { address: true },
      select: {
        id: true,
        fullName: true,
        phone: true,
        alternativePhone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        address: {
          id: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          postalCode: true,
          betweenStreets: true,
          reference: true,
        },
      },
      take: limit,
      skip: offset,
      order: { fullName: 'DESC' },
    });

    if (limit && offset) {
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

    return customers;
  }

  async findOne(term: string): Promise<Customer> {
    const whereCondition: FindOptionsWhere<Customer> = {};

    if (isUUID(term)) whereCondition.id = term;
    else whereCondition.phone = term;

    const customer = await this.customerRepository.findOne({
      where: whereCondition,
      relations: { address: true, orders: { branch: true, details: true } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        alternativePhone: true,
        email: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        address: {
          id: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          postalCode: true,
          betweenStreets: true,
          reference: true,
        },
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
