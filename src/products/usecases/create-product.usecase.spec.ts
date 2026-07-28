import { ConflictException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';
import type { CreateProductDto } from '../dto/create-product.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entity) => Promise.resolve({ id: 'product-1', ...entity })),
  };
  const categoriesService = {
    findOne: jest.fn(),
  };

  const useCase = new CreateProductUseCase(
    productRepository as never,
    categoriesService as never,
  );

  return { useCase, productRepository, categoriesService };
}

const user = { id: 'user-1' } as User;

function baseDto(overrides: Partial<CreateProductDto> = {}): CreateProductDto {
  return {
    name: 'pastel de chocolate',
    categoryId: 'cat-1',
    ...overrides,
  } as CreateProductDto;
}

describe('CreateProductUseCase', () => {
  it('busca la categoría con categoriesService.findOne', async () => {
    const mocks = createMocks();
    mocks.categoriesService.findOne.mockResolvedValue({ id: 'cat-1' });
    mocks.productRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(baseDto(), user);

    expect(mocks.categoriesService.findOne).toHaveBeenCalledWith('cat-1');
  });

  it('lanza ConflictException si ya existe un producto con el mismo nombre en la categoría', async () => {
    const mocks = createMocks();
    mocks.categoriesService.findOne.mockResolvedValue({ id: 'cat-1' });
    mocks.productRepository.findOne.mockResolvedValue({ id: 'existing' });

    await expect(mocks.useCase.execute(baseDto(), user)).rejects.toThrow(
      ConflictException,
    );
  });

  it('busca duplicados por nombre en mayúsculas dentro de la categoría', async () => {
    const mocks = createMocks();
    mocks.categoriesService.findOne.mockResolvedValue({ id: 'cat-1' });
    mocks.productRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(baseDto({ name: 'pastel de chocolate' }), user);

    expect(mocks.productRepository.findOne).toHaveBeenCalledWith({
      where: { category: { id: 'cat-1' }, name: 'PASTEL DE CHOCOLATE' },
    });
  });

  it('crea el producto con el nombre en mayúsculas, la categoría y createdBy/updatedBy', async () => {
    const mocks = createMocks();
    const category = { id: 'cat-1', name: 'Pasteles' };
    mocks.categoriesService.findOne.mockResolvedValue(category);
    mocks.productRepository.findOne.mockResolvedValue(null);

    await mocks.useCase.execute(baseDto({ name: 'pastel de chocolate' }), user);

    expect(mocks.productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'PASTEL DE CHOCOLATE',
        category,
        createdBy: user,
        updatedBy: user,
      }),
    );
  });
});
