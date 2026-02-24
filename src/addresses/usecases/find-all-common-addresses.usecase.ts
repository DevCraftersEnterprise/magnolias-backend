import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";

import { CommonAddress } from '@/addresses/entities/common-address.entity';

@Injectable()
export class FindAllCommonAddressesUseCase {
    private readonly logger = new Logger(FindAllCommonAddressesUseCase.name);

    constructor(
        @InjectRepository(CommonAddress)
        private commonAddressRepository: Repository<CommonAddress>,
    ) { }

    async execute(search?: string): Promise<CommonAddress[]> {
        let results: CommonAddress[];

        if (search) {
            this.logger.log(`Searching for common addresses with search term: ${search}`);

            results = await this.commonAddressRepository.find({
                where: [
                    { name: ILike(`%${search}%`) },
                    { street: ILike(`%${search}%`) },
                    { neighborhood: ILike(`%${search}%`) },
                ],
                order: { usageCount: 'DESC', name: 'ASC' }
            })

            this.logger.log(`Found ${results.length} common addresses matching search term: ${search}`);
        } else {
            this.logger.log(`Fetching all common addresses`);

            results = await this.commonAddressRepository.find({
                order: { usageCount: 'DESC', name: 'ASC' }
            })

            this.logger.log(`Found ${results.length} common addresses`);
        }

        return results;
    }
}