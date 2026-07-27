import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.usecase';
import type { UpdateProductDto } from '../dto/update-product.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };
  const categoriesService = {
    findOne: jest.fn(),
  };

  const useCase = new UpdateProductUseCase(
    productRepository as never,
    categoriesService as never,
  );

  return { useCase, productRepository, categoriesService };
}

const user = { id: 'user-1' } as User;

function baseProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    name: 'PASTEL VIEJO',
    category: { id: 'cat-1' },
    ...overrides,
  };
}

describe('UpdateProductUseCase', () => {
  it('lanza NotFoundException si el producto no existe', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute('p1', {} as UpdateProductDto, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza ConflictException si otro producto de la misma categoría ya tiene ese nombre', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(baseProduct())
      .mockResolvedValueOnce({ id: 'otro-producto' });

    await expect(
      mocks.useCase.execute(
        'p1',
        { name: 'Pastel Nuevo', categoryId: 'cat-1' } as UpdateProductDto,
        user,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('no lanza conflicto si el "duplicado" encontrado es el mismo producto', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(baseProduct())
      .mockResolvedValueOnce({ id: 'p1' });

    await expect(
      mocks.useCase.execute(
        'p1',
        { name: 'Pastel Nuevo', categoryId: 'cat-1' } as UpdateProductDto,
        user,
      ),
    ).resolves.toBeDefined();
  });

  // REGRESIÓN: a diferencia de CreateProductUseCase (que siempre guarda el
  // nombre en mayúsculas), aquí el nombre se asigna TAL CUAL viene en el DTO
  // (Object.assign no lo normaliza), rompiendo la invariante de mayúsculas.
  // Documentado tal cual está hoy (flagueado en el backlog).
  it('REGRESIÓN: no normaliza el nombre a mayúsculas al actualizar', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(baseProduct())
      .mockResolvedValueOnce(null);

    const result = await mocks.useCase.execute(
      'p1',
      { name: 'pastel minúsculas', categoryId: 'cat-1' } as UpdateProductDto,
      user,
    );

    expect(result.name).toBe('pastel minúsculas');
  });

  // REGRESIÓN: si se cambia el nombre sin enviar categoryId, el chequeo de
  // duplicados arma `where: { category: { id: undefined } }` — TypeORM
  // descarta esa condición, así que la búsqueda de duplicados deja de estar
  // acotada a la categoría del producto y revisa TODAS las categorías.
  // Documentado tal cual está hoy (flagueado en el backlog).
  it('REGRESIÓN: sin categoryId, el chequeo de duplicados pierde el scope de categoría', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(baseProduct())
      .mockResolvedValueOnce(null);

    await mocks.useCase.execute(
      'p1',
      { name: 'Pastel Nuevo' } as UpdateProductDto,
      user,
    );

    expect(mocks.productRepository.findOne).toHaveBeenNthCalledWith(2, {
      where: { name: 'PASTEL NUEVO', category: { id: undefined } },
    });
  });

  it('actualiza la categoría si categoryId difiere de la actual', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValueOnce(baseProduct());
    const newCategory = { id: 'cat-2', name: 'Nueva categoría' };
    mocks.categoriesService.findOne.mockResolvedValue(newCategory);

    const result = await mocks.useCase.execute(
      'p1',
      { categoryId: 'cat-2' } as UpdateProductDto,
      user,
    );

    expect(mocks.categoriesService.findOne).toHaveBeenCalledWith('cat-2');
    expect(result.category).toEqual(newCategory);
  });

  it('actualiza los campos del DTO y registra updatedBy', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValueOnce(baseProduct());

    const result = await mocks.useCase.execute(
      'p1',
      { description: 'Nueva descripción' } as UpdateProductDto,
      user,
    );

    expect(result.description).toBe('Nueva descripción');
    expect(mocks.productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ updatedBy: user }),
    );
  });
});
