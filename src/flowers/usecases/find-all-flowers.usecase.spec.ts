import { FindAllFlowersUseCase } from './find-all-flowers.usecase';
import type { FlowersFilterDto } from '../dto/flowers-filter.dto';

describe('FindAllFlowersUseCase', () => {
  let findAndCountMock: jest.Mock;
  let useCase: FindAllFlowersUseCase;

  beforeEach(() => {
    findAndCountMock = jest.fn();
    useCase = new FindAllFlowersUseCase({
      findAndCount: findAndCountMock,
    } as never);
  });

  it('filtra por isActive cuando viene definido', async () => {
    findAndCountMock.mockResolvedValue([[], 0]);

    await useCase.execute({ isActive: false } as FlowersFilterDto);

    expect(findAndCountMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: false } }),
    );
  });

  it('filtra por name usando ILike', async () => {
    findAndCountMock.mockResolvedValue([[], 0]);

    await useCase.execute({ name: 'Rosa' } as FlowersFilterDto);

    const callArg = findAndCountMock.mock.calls[0][0];
    expect(callArg.where.name).toBeDefined();
  });

  it('no aplica filtros cuando no vienen definidos', async () => {
    findAndCountMock.mockResolvedValue([[], 0]);

    await useCase.execute({} as FlowersFilterDto);

    expect(findAndCountMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('retorna la respuesta paginada cuando se envían limit y offset', async () => {
    findAndCountMock.mockResolvedValue([[{ id: '1', name: 'ROSA' }], 1]);

    const result = await useCase.execute(
      { limit: 10, offset: 0 } as FlowersFilterDto,
    );

    expect(result).toEqual({
      items: [{ id: '1', name: 'ROSA' }],
      total: 1,
      pagination: { limit: 10, offset: 0, totalPages: 1, currentPage: 1 },
    });
  });

  it('retorna un arreglo plano cuando no se envían limit/offset', async () => {
    findAndCountMock.mockResolvedValue([[{ id: '1', name: 'ROSA' }], 1]);

    const result = await useCase.execute({} as FlowersFilterDto);

    expect(Array.isArray(result)).toBe(true);
  });
});
