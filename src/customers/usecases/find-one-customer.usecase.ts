import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";
import { FindOptionsWhere, Repository } from "typeorm";
import { Customer } from '../entities/customer.entity';

@Injectable()
export class FindOneCustomerUseCase {
    private readonly logger = new Logger(FindOneCustomerUseCase.name);

    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async execute(term: string): Promise<Customer> {
        const whereConditions: FindOptionsWhere<Customer> = {};

        if (isUUID(term)) whereConditions.id = term;
        else whereConditions.phone = term;

        const customer = await this.customerRepository.findOne({
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
        });

        if (!customer) {
            this.logger.error(`Customer with term ${term} not found.`);
            throw new BadRequestException(`Customer with term ${term} not found.`);
        }

        this.logger.log(`Found customer with term ${term}.`);
        return customer;
    }
}