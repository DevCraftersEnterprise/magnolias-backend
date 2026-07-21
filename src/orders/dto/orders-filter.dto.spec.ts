import { plainToInstance } from "class-transformer";
import { OrdersFilterDto } from "./orders-filter.dto";
import { validate } from "class-validator";

describe('OrdersFilterDto', () => {
    it('convierte fechas ISO válidas (como llegan en query params) a instancias de Date', async () => {
        const dto = plainToInstance(OrdersFilterDto, {
            startDate: '2023-10-15',
            endDate: '2023-10-18',
        });

        expect(dto.startDate).toBeInstanceOf(Date);
        expect(dto.endDate).toBeInstanceOf(Date);

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('rechaza un valor de fecha inválido', async () => {
        const dto = plainToInstance(OrdersFilterDto, {
            startDate: 'no-es-una-fecha',
        });

        const errors = await validate(dto);
        const startDateError = errors.find((e) => e.property === 'startDate');

        expect(startDateError).toBeDefined();
        expect(startDateError?.constraints).toHaveProperty('isDate');
    });

    it('rechaza un string vacío como fecha', async () => {
        const dto = plainToInstance(OrdersFilterDto, { orderDate: '' });

        const errors = await validate(dto);
        const orderDateError = errors.find((e) => e.property === 'orderDate');

        expect(orderDateError).toBeDefined();
    });

    it('permite que orderDate, startDate y endDate sean opcionales', async () => {
        const dto = plainToInstance(OrdersFilterDto, {});

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });
});