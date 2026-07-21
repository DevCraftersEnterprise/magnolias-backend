import { BadRequestException } from '@nestjs/common';
import { Between } from 'typeorm';
import { FindAllOrdersUseCase } from './find-all-orders.usecase';
import { OrdersFilterDto } from '../../dto/orders-filter.dto';

describe('FindAllOrdersUseCase', () => {
    const branchId = 'branch-1';
    let findAndCountMock: jest.Mock;
    let useCase: FindAllOrdersUseCase;

    beforeEach(() => {
        findAndCountMock = jest.fn().mockResolvedValue([[], 0]);
        useCase = new FindAllOrdersUseCase({
            findAndCount: findAndCountMock,
        } as never);
    });

    it('filtra por orderDate cubriendo el día completo en UTC', async () => {
        const filter = { orderDate: new Date('2023-10-15') } as OrdersFilterDto;

        await useCase.execute(filter, branchId);

        const whereArg = findAndCountMock.mock.calls[0][0].where;
        expect(whereArg.deliveryDate).toEqual(
            Between(
                new Date('2023-10-15T00:00:00.000Z'),
                new Date('2023-10-15T23:59:59.999Z'),
            ),
        );
    });

    it('filtra por rango startDate/endDate de forma inclusiva', async () => {
        const filter = {
            startDate: new Date('2023-10-15'),
            endDate: new Date('2023-10-18'),
        } as OrdersFilterDto;

        await useCase.execute(filter, branchId);

        const whereArg = findAndCountMock.mock.calls[0][0].where;
        expect(whereArg.deliveryDate).toEqual(
            Between(
                new Date('2023-10-15T00:00:00.000Z'),
                new Date('2023-10-18T23:59:59.999Z'),
            ),
        );
    });

    it('rechaza un rango invertido (startDate posterior a endDate)', async () => {
        const filter = {
            startDate: new Date('2023-10-18'),
            endDate: new Date('2023-10-15'),
        } as OrdersFilterDto;

        await expect(useCase.execute(filter, branchId)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('rechaza orderDate combinado con startDate/endDate', async () => {
        const filter = {
            orderDate: new Date('2023-10-15'),
            startDate: new Date('2023-10-15'),
            endDate: new Date('2023-10-18'),
        } as OrdersFilterDto;

        await expect(useCase.execute(filter, branchId)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('rechaza startDate sin endDate', async () => {
        const filter = { startDate: new Date('2023-10-15') } as OrdersFilterDto;

        await expect(useCase.execute(filter, branchId)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('rechaza endDate sin startDate', async () => {
        const filter = { endDate: new Date('2023-10-18') } as OrdersFilterDto;

        await expect(useCase.execute(filter, branchId)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('no aplica filtro de fecha cuando no se envía ninguno', async () => {
        const filter = {} as OrdersFilterDto;

        await useCase.execute(filter, branchId);

        const whereArg = findAndCountMock.mock.calls[0][0].where;
        expect(whereArg.deliveryDate).toBeUndefined();
    });
});
