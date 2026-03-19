import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { CustomersFilterDto } from '../dto/customers-filter.dto';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class FindAllCustomersUseCase {
  private readonly logger = new Logger(FindAllCustomersUseCase.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(
    customersFilterDto: CustomersFilterDto,
  ): Promise<PaginationResponse<Customer> | Customer[]> {
    const { name, phone, isActive, limit, offset } = customersFilterDto;

    const whereConditions = this.buildWhereConditions(name, isActive);

    let customers: Customer[];
    let total: number;
    let applyManualPagination = false;

    if (phone) {
      ({ customers, total } = await this.searchByPhone(phone, whereConditions));
      applyManualPagination = true;
    } else {
      ({ customers, total } = await this.searchWithoutPhone(
        whereConditions,
        limit,
        offset,
      ));
    }

    return this.buildResponse(
      customers,
      total,
      limit,
      offset,
      applyManualPagination,
    );
  }

  private buildWhereConditions(
    name?: string,
    isActive?: boolean,
  ): FindOptionsWhere<Customer> {
    const whereConditions: FindOptionsWhere<Customer> = {};

    if (name) whereConditions.fullName = ILike(`%${name}%`);
    if (isActive !== undefined) whereConditions.isActive = isActive;

    return whereConditions;
  }

  private async searchByPhone(
    phone: string,
    whereConditions: FindOptionsWhere<Customer>,
  ): Promise<{ customers: Customer[]; total: number }> {
    this.logger.debug(`Searching customers by phone: ${phone}`);

    const allCustomers = await this.customerRepository.find({
      where: whereConditions,
      relations: { address: true },
      order: { fullName: 'DESC' },
    });

    const filteredCustomers = allCustomers.filter(
      (customer) => customer.phone && customer.phone.startsWith(phone),
    );

    return {
      customers: filteredCustomers,
      total: filteredCustomers.length,
    };
  }

  private async searchWithoutPhone(
    whereConditions: FindOptionsWhere<Customer>,
    limit?: number,
    offset?: number,
  ): Promise<{ customers: Customer[]; total: number }> {
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

    return { customers, total };
  }

  private buildResponse(
    customers: Customer[],
    total: number,
    limit?: number,
    offset?: number,
    applyManualPagination: boolean = false,
  ): PaginationResponse<Customer> | Customer[] {
    // Aplicar paginación manual si es necesario
    const paginatedCustomers =
      limit !== undefined && offset !== undefined && applyManualPagination
        ? customers.slice(offset, offset + limit)
        : customers;

    if (limit !== undefined && offset !== undefined) {
      this.logger.log(`Found ${total} customers matching filters.`);
      return {
        items: paginatedCustomers,
        total,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    }

    this.logger.log(`Found ${customers.length} customers matching filters.`);
    return paginatedCustomers;
  }
}
