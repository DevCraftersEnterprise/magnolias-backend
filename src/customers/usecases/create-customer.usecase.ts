import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Customer } from '../entities/customer.entity';
import { CustomerAddress } from '../entities/customer-address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { User } from '../../users/entities/user.entity';
import { CreateCustomerAddressDto } from '../dto/create-customer-address.dto';

@Injectable()
export class CreateCustomerUseCase {
  private readonly logger = new Logger(CreateCustomerUseCase.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerAddress)
    private readonly customerAddressRepository: Repository<CustomerAddress>,
  ) {}

  async execute(
    createCustomerDto: CreateCustomerDto,
    user: User,
  ): Promise<Customer> {
    const { address, ...customerDto } = createCustomerDto;

    const existingCustomer = await this.customerRepository.findOne({
      where: { phone: customerDto.phone },
    });

    if (existingCustomer) {
      this.logger.warn(
        `Customer with phone ${customerDto.phone} already exists`,
      );
      throw new ConflictException(
        `Customer with this phone ${customerDto.phone} already exists`,
      );
    }

    this.logger.log(`Creating customer with phone: ${createCustomerDto.phone}`);

    const customer = this.customerRepository.create({
      ...customerDto,
      createdBy: user,
      updatedBy: user,
    });

    const savedCustomer = await this.customerRepository.save(customer);

    this.logger.log(`Customer created with ID: ${savedCustomer.id}`);

    if (address) await this.createCustomerAddress(address, savedCustomer, user);

    return savedCustomer;
  }

  private async createCustomerAddress(
    createCustomerAddressDto: CreateCustomerAddressDto,
    customer: Customer,
    user: User,
  ): Promise<void> {
    this.logger.log(`Creating address for customer ID: ${customer.id}`);

    const address = this.customerAddressRepository.create({
      ...createCustomerAddressDto,
      customer,
      createdBy: user,
      updatedBy: user,
    });

    await this.customerAddressRepository.save(address);

    this.logger.log(`Address created for customer ID: ${customer.id}`);
  }
}
