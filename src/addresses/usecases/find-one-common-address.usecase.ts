import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommonAddress } from '../../addresses/entities/common-address.entity';

@Injectable()
export class FindOneCommonAddressUseCase {
    private readonly logger = new Logger(FindOneCommonAddressUseCase.name);

    constructor(
        @InjectRepository(CommonAddress)
        private commonAddressRepository: Repository<CommonAddress>,
    ) { }

    async execute(id: string): Promise<CommonAddress> {
        this.logger.log(`Finding common address with ID: ${id}`);

        const address = await this.commonAddressRepository.findOne({
            where: { id, isActive: true },
        });

        if (!address) {
            this.logger.warn(`Address with ID: ${id} not found`);
            throw new NotFoundException('Address with the specified ID not found');
        }

        this.logger.log(`Address with ID: ${id} found successfully`);
        return address;
    }
}