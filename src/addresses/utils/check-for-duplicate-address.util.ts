import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CommonAddress } from '@/addresses/entities/common-address.entity';

@Injectable()
export class CheckForDuplicateAddressUtil {
    constructor(
        @InjectRepository(CommonAddress)
        private commonAddressRepository: Repository<CommonAddress>,
    ) { }

    async checkForDuplicate(street: string, number: string, neighborhood: string): Promise<CommonAddress | null> {
        return await this.commonAddressRepository.findOne({
            where: {
                street,
                number,
                neighborhood,
            }
        });
    }
}