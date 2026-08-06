import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomersFilterDto } from './customers-filter.dto';

describe('CustomersFilterDto', () => {
  it('permite que todos los filtros sean opcionales', async () => {
    const dto = plainToInstance(CustomersFilterDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('acepta last4 cuando son exactamente 4 dígitos', async () => {
    const dto = plainToInstance(CustomersFilterDto, { last4: '4567' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza last4 con menos de 4 dígitos', async () => {
    const dto = plainToInstance(CustomersFilterDto, { last4: '456' });

    const errors = await validate(dto);
    const last4Error = errors.find((e) => e.property === 'last4');

    expect(last4Error).toBeDefined();
    expect(last4Error?.constraints).toHaveProperty('matches');
  });

  it('rechaza last4 con caracteres no numéricos', async () => {
    const dto = plainToInstance(CustomersFilterDto, { last4: '45a7' });

    const errors = await validate(dto);
    const last4Error = errors.find((e) => e.property === 'last4');

    expect(last4Error).toBeDefined();
  });
});
