import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AssignOrderDetailDto } from './assign-order-detail.dto';

function hasErrorOn(errors: { property: string }[], property: string) {
  return errors.some((e) => e.property === property);
}

describe('AssignOrderDetailDto', () => {
  it('es válido con solo bakerId', async () => {
    const dto = plainToInstance(AssignOrderDetailDto, {
      bakerId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('requiere bakerId', async () => {
    const dto = plainToInstance(AssignOrderDetailDto, {});
    const errors = await validate(dto);

    expect(hasErrorOn(errors, 'bakerId')).toBe(true);
  });

  it('rechaza bakerId que no es UUID', async () => {
    const dto = plainToInstance(AssignOrderDetailDto, {
      bakerId: 'no-es-un-uuid',
    });
    const errors = await validate(dto);

    expect(hasErrorOn(errors, 'bakerId')).toBe(true);
  });

  it('acepta assignedDate y notes opcionales', async () => {
    const dto = plainToInstance(AssignOrderDetailDto, {
      bakerId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
      assignedDate: '2026-08-05T12:00:00Z',
      notes: 'Entrega urgente',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rechaza assignedDate inválida', async () => {
    const dto = plainToInstance(AssignOrderDetailDto, {
      bakerId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
      assignedDate: 'no-es-una-fecha',
    });
    const errors = await validate(dto);

    expect(hasErrorOn(errors, 'assignedDate')).toBe(true);
  });
});
