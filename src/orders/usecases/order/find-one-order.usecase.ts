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
  ) { }

  /**
   * @param includeTransferAccount - `transferAccount` holds a bank
   * account/reference number and must stay out of the normal admin UI
   * (list/detail screens) — it's only meant to be printed on the PDF
   * report. Defaults to `false`; only the PDF-generation path
   * (`FormatsService`) should pass `true`.
   */
  async execute(
    term: string,
    includeTransferAccount = false,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: term },
      relations: {
        customer: { address: true },
        branch: true,
        deliveryAddress: true,
        details: {
          product: {
            category: true,
          },
          frosting: true,
          breadType: true,
          style: true,
          filling: true,
          color: true,
          referenceImages: true,
          discountAuthorizedBy: true,
          tiers: {
            breadType: true,
            filling: true,
            frosting: true,
            color: true,
          },
          assignments: {
            baker: true,
          },
        },
        orderFlowers: {
          flower: true,
          color: true,
        },
        payments: true,
        createdBy: true,
        updatedBy: true,
      },
      order: {
        payments: {
          createdAt: 'DESC',
        },
      },
    });

    if (!order) {
      this.logger.warn(`Order with ID ${term} not found`);
      throw new NotFoundException(`Order with ID ${term} not found`);
    }

    if (!includeTransferAccount) {
      order.transferAccount = undefined;
    }

    return order;
  }
}
