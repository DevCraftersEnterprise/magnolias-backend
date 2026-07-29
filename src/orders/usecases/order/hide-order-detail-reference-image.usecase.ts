import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetailReferenceImage } from '../../entities/order-detail-reference-image.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class HideOrderDetailReferenceImageUseCase {
    private readonly logger = new Logger(
        HideOrderDetailReferenceImageUseCase.name,
    );

    constructor(
        @InjectRepository(OrderDetailReferenceImage)
        private readonly orderDetailReferenceImageRepository: Repository<OrderDetailReferenceImage>,
    ) { }

    async execute(imageId: string, user: User): Promise<void> {
        const image = await this.orderDetailReferenceImageRepository.findOne({
            where: { id: imageId },
        });

        if (!image) {
            this.logger.warn(`Order detail reference image with id ${imageId} not found`);
            throw new NotFoundException(
                `Order detail reference image with id ${imageId} not found`,
            );
        }

        if (!image.isActive) {
            this.logger.warn(
                `Order detail reference image with id ${imageId} is already hidden`,
            );
            throw new BadRequestException(
                `Order detail reference image with id ${imageId} is already hidden`,
            );
        }

        Object.assign(image, { isActive: false, updatedBy: user });

        await this.orderDetailReferenceImageRepository.save(image);

        this.logger.log(
            `Order detail reference image with id ${imageId} has been hidden by user ${user.id}`,
        );
    }
}
