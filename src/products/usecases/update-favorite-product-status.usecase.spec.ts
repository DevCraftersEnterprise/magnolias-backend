import { NotFoundException } from '@nestjs/common';
import { UpdateFavoriteProductStatusUseCase } from './update-favorite-product-status.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const useCase = new UpdateFavoriteProductStatusUseCase(
    productRepository as never,
  );

  return { useCase, productRepository };
}

const user = { id: 'user-1' } as User;

describe('UpdateFavoriteProductStatusUseCase', () => {
  it('lanza NotFoundException si el producto no existe', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(null) // favorite lookup
      .mockResolvedValueOnce(null); // product lookup

    await expect(mocks.useCase.execute('p1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza NotFoundException si el producto no está activo', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'p1', isActive: false });

    await expect(mocks.useCase.execute('p1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('marca el producto como favorito si no había uno previo', async () => {
    const mocks = createMocks();
    const product = { id: 'p1', isActive: true, isFavorite: false };
    mocks.productRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(product);

    const result = await mocks.useCase.execute('p1', user);

    expect(result.isFavorite).toBe(true);
    expect(mocks.productRepository.save).toHaveBeenCalledTimes(1);
  });

  it('desmarca el favorito anterior y marca el nuevo cuando son productos distintos', async () => {
    const mocks = createMocks();
    const oldFavorite = { id: 'old', isActive: true, isFavorite: true };
    const product = { id: 'p1', isActive: true, isFavorite: false };
    mocks.productRepository.findOne
      .mockResolvedValueOnce(oldFavorite)
      .mockResolvedValueOnce(product);

    const result = await mocks.useCase.execute('p1', user);

    expect(oldFavorite.isFavorite).toBe(false);
    expect(result.isFavorite).toBe(true);
    expect(mocks.productRepository.save).toHaveBeenCalledTimes(2);
  });

  it('si el producto ya es el favorito: lo desmarca (toggle off) sin re-marcarlo', async () => {
    const mocks = createMocks();
    const product = { id: 'p1', isActive: true, isFavorite: true };
    mocks.productRepository.findOne
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce(product);

    const result = await mocks.useCase.execute('p1', user);

    expect(product.isFavorite).toBe(false);
    expect(result).toBe(product);
    expect(mocks.productRepository.save).toHaveBeenCalledTimes(1);
  });
});
