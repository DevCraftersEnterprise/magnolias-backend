import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { UpdateCustomerAddressDto } from "../dto/update-customer-address.dto";
import { UpdateCustomerDto } from "../dto/update-customer.dto";
import { CustomerAddress } from "../entities/customer-address.entity";
import { Customer } from '../entities/customer.entity';

@Injectable()
export class UpdateCustomerUseCase {
    private readonly logger = new Logger(UpdateCustomerUseCase.name);

    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        @InjectRepository(CustomerAddress)
        private readonly customerAddressRepository: Repository<CustomerAddress>,
    ) { }

    async execute(id: string, updateCustomerDto: UpdateCustomerDto, user: User): Promise<Customer> {
        const { address, ...customerDto } = updateCustomerDto;

        const customer = await this.customerRepository.findOne({
            where: { id },
        });

        if (!customer) {
            this.logger.warn(`Customer with ID ${id} not found`);
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        if (customer && customer.phone !== customerDto.phone) {
            const duplicatedCustomer = await this.customerRepository.findOne({
                where: { phone: customerDto.phone },
            });

            if (duplicatedCustomer && duplicatedCustomer.id !== id) {
                this.logger.warn(`Customer with phone ${customerDto.phone} already exists`);
                throw new ConflictException(`Customer with this phone ${customerDto.phone} already exists`);
            }
        }

        this.logger.log(`Updating customer with ID: ${id}`);

        Object.assign(customer, customerDto, { updatedBy: user });

        const updatedCustomer = await this.customerRepository.save(customer);

        this.logger.log(`Customer updated with ID: ${updatedCustomer.id}`);

        if (address) await this.updateCustomerAddress(address, updatedCustomer, user);

        return updatedCustomer;
    }

    private async updateCustomerAddress(
        updateCustomerAddressDto: UpdateCustomerAddressDto,
        customer: Customer,
        user: User): Promise<void> {

        this.logger.log(`Updating address for customer ID: ${customer.id}`);

        const customerAddress = await this.customerAddressRepository.findOne({
            where: { customer: { id: customer.id } },
        });

        if (!customerAddress) {
            this.logger.warn(`Address for customer ID ${customer.id} not found, creating new address`);

            const address = this.customerAddressRepository.create({
                ...updateCustomerAddressDto,
                customer,
                createdBy: user,
                updatedBy: user,
            });

            await this.customerAddressRepository.save(address);

            this.logger.log(`Address created for customer ID: ${customer.id}`);

            return;
        }

        Object.assign(customerAddress, updateCustomerAddressDto, { updatedBy: user });

        await this.customerAddressRepository.save(customerAddress);

        this.logger.log(`Address updated for customer ID: ${customer.id}`);
    }
}