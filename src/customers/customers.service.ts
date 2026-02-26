import {
  Injectable
} from '@nestjs/common';
import { PaginationResponse } from '../common/responses/pagination.response';
import { User } from '../users/entities/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomersFilterDto } from './dto/customers-filter.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { CreateCustomerUseCase } from './usecases/create-customer.usecase';
import { FindAllCustomersUseCase } from './usecases/find-all-customers.usecase';
import { FindOneCustomerUseCase } from './usecases/find-one-customer.usecase';
import { RemoveCustomerUseCase } from './usecases/remove-customer.usecase';
import { UpdateCustomerUseCase } from './usecases/update-customer.usecase';

@Injectable()
export class CustomersService {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly findAllCustomersUseCase: FindAllCustomersUseCase,
    private readonly findOneCustomerUseCase: FindOneCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly removeCustomerUseCase: RemoveCustomerUseCase,
  ) { }

  async createCustomer(dto: CreateCustomerDto, user: User): Promise<Customer> {
    return await this.createCustomerUseCase.execute(dto, user);
  }

  async findAll(filterDto: CustomersFilterDto,): Promise<PaginationResponse<Customer> | Customer[]> {
    return await this.findAllCustomersUseCase.execute(filterDto);
  }

  async findOne(term: string): Promise<Customer> {
    return await this.findOneCustomerUseCase.execute(term);
  }

  async update(id: string, dto: UpdateCustomerDto, user: User,): Promise<Customer> {
    return await this.updateCustomerUseCase.execute(id, dto, user);
  }

  async remove(id: string, user: User): Promise<void> {
    return await this.removeCustomerUseCase.execute(id, user);
  }
}
