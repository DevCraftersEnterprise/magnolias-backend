import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FindOneOrderUseCase {
  private readonly logger = new Logger(FindOneOrderUseCase.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async execute(term: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        customer: { address: true },
        branch: true,
        deliveryAddress: true,
        details: {
          product: true,
          frosting: true,
          breadType: true,
          style: true,
          filling: true,
          color: true,
          flavor: true,
        },
        orderFlowers: {
          flower: true,
        },
        createdBy: true,
        updatedBy: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order with ID ${term} not found`);
      throw new NotFoundException(`Order with ID ${term} not found`);
    }

    return order;
  }
}
