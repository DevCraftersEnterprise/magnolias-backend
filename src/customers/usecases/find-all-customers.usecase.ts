import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PaginationResponse } from '../../common/responses/pagination.response';
import { CustomersFilterDto } from '../dto/customers-filter.dto';
import { Customer } from '../entities/customer.entity';

/**
 * Cap on the in-memory prefix scan in `searchByPhone`. `phone` is encrypted
 * (random IV per row, so no SQL-level `startsWith`/`ILIKE` is possible),
 * so this reads every row matching the other filters, decrypts it, and
 * filters in JS. The cap bounds worst-case cost and logs a warning when
 * hit, so an incomplete result surfaces early instead of silently growing
 * unbounded as the customer base grows.
 */
const PHONE_PREFIX_SCAN_CAP = 1000;

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
    const { name, phone, last4, isActive, limit, offset } = customersFilterDto;

    const whereConditions = this.buildWhereConditions(name, isActive);

    let customers: Customer[];
    let total: number;
    let applyManualPagination = false;

    if (last4) {
      ({ customers, total } = await this.searchByLast4(
        last4,
        whereConditions,
        limit,
        offset,
      ));
    } else if (phone) {
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
      order: { updatedAt: 'DESC', createdAt: 'DESC', fullName: 'ASC' },
      take: PHONE_PREFIX_SCAN_CAP,
    });

    if (allCustomers.length >= PHONE_PREFIX_SCAN_CAP) {
      this.logger.warn(
        `Phone prefix scan hit its cap of ${PHONE_PREFIX_SCAN_CAP} rows; results may be incomplete.`,
      );
    }

    const filteredCustomers = allCustomers.filter(
      (customer) => customer.phone && customer.phone.startsWith(phone),
    );

    return {
      customers: filteredCustomers,
      total: filteredCustomers.length,
    };
  }

  private async searchByLast4(
    last4: string,
    whereConditions: FindOptionsWhere<Customer>,
    limit?: number,
    offset?: number,
  ): Promise<{ customers: Customer[]; total: number }> {
    this.logger.debug(`Searching customers by phone last4: ${last4}`);

    const [customers, total] = await this.customerRepository.findAndCount({
      where: { ...whereConditions, phoneLast4: last4 },
      relations: { address: true },
      order: { updatedAt: 'DESC', createdAt: 'DESC', fullName: 'ASC' },
      take: limit,
      skip: offset,
    });

    return { customers, total };
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
      order: { updatedAt: 'DESC', createdAt: 'DESC', fullName: 'ASC' },
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
