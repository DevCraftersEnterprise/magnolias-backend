import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProductionStatusDto } from './update-production-status.dto';
import { OrderDetailProductionStatus } from '../enums/order-detail-production-status.enum';

function hasErrorOn(errors: { property: string }[], property: string) {
  return errors.some((e) => e.property === property);
}

describe('UpdateProductionStatusDto', () => {
  it('es válido con un status del enum', async () => {
    const dto = plainToInstance(UpdateProductionStatusDto, {
      status: OrderDetailProductionStatus.IN_PROCESS,
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('requiere status', async () => {
    const dto = plainToInstance(UpdateProductionStatusDto, {});
    const errors = await validate(dto);

    expect(hasErrorOn(errors, 'status')).toBe(true);
  });

  it('rechaza un status que no pertenece al enum', async () => {
    const dto = plainToInstance(UpdateProductionStatusDto, {
      status: 'NO_EXISTE',
    });
    const errors = await validate(dto);

    expect(hasErrorOn(errors, 'status')).toBe(true);
  });
});
