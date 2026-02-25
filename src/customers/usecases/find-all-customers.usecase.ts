import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { PaginationResponse } from '../../common/responses/pagination.response';
import { CustomersFilterDto } from "../dto/customers-filter.dto";
import { Customer } from '../entities/customer.entity';

@Injectable()
export class FindAllCustomersUseCase {
    private readonly logger = new Logger(FindAllCustomersUseCase.name);

    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async execute(customersFilterDto: CustomersFilterDto): Promise<PaginationResponse<Customer> | Customer[]> {
        const { name, phone, isActive, limit, offset } = customersFilterDto;

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

        if (limit !== undefined && offset !== undefined) {
            this.logger.log(`Found ${total} customers matching filters.`);
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

        this.logger.log(`Found ${customers.length} customers matching filters.`);

        return customers;
    }


}