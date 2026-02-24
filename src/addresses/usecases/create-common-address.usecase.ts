import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateCommonAddressDto } from '@/addresses/dto/create-common-address.dto';
import { CommonAddress } from '@/addresses/entities/common-address.entity';
import { CheckForDuplicateAddressUtil } from "@/addresses/utils/check-for-duplicate-address.util";

import { User } from '@/users/entities/user.entity';

@Injectable()
export class CreateCommonAddressUseCase {
    private readonly logger = new Logger(CreateCommonAddressUseCase.name);

    constructor(
        @InjectRepository(CommonAddress)
        private commonAddressRepository: Repository<CommonAddress>,
        private readonly checkForDuplicateAddressUtil: CheckForDuplicateAddressUtil
    ) { }

    async execute(createCommonAddressDto: CreateCommonAddressDto, user: User): Promise<CommonAddress> {
        const { street, number, neighborhood } = createCommonAddressDto;

        const duplicateAddress = await this.checkForDuplicateAddressUtil.checkForDuplicate(street, number, neighborhood);

        if (duplicateAddress) {
            this.logger.warn(`Duplicate address found: ${street} ${number}, ${neighborhood}`);
            throw new ConflictException('An address with the same street, number, and neighborhood already exists.');
        }

        const address = this.commonAddressRepository.create({
            ...createCommonAddressDto,
            createdBy: user,
            updatedBy: user,
        });

        this.logger.log(`Created new address: ${street} ${number}, ${neighborhood} by user ${user.id}`);
        return await this.commonAddressRepository.save(address);
    }
}