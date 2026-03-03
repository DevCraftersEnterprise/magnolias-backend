import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class RemoveCustomerUseCase {
  private readonly logger = new Logger(RemoveCustomerUseCase.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(id: string, user: User): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      this.logger.warn(`Customer with ID ${id} not found`);
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (!customer.isActive) {
      this.logger.warn(`Customer with ID ${id} is already inactive`);
      throw new BadRequestException(
        `Customer with ID ${id} is already inactive`,
      );
    }

    this.logger.log(`Removing customer with ID: ${id}`);

    Object.assign(customer, { updatedBy: user, isActive: false });

    await this.customerRepository.save(customer);

    this.logger.log(`Customer removed with ID: ${customer.id}`);
  }
}
