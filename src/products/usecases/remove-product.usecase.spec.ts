import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveProductUseCase } from './remove-product.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const useCase = new RemoveProductUseCase(productRepository as never);

  return { useCase, productRepository };
}

const user = { id: 'user-1' } as User;

describe('RemoveProductUseCase', () => {
  it('lanza NotFoundException si el producto no existe', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValue(null);

    await expect(mocks.useCase.execute('p1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza BadRequestException si el producto ya está inactivo', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValue({
      id: 'p1',
      isActive: false,
      isFavorite: false,
    });

    await expect(mocks.useCase.execute('p1', user)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('lanza BadRequestException si el producto es el favorito actual', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValue({
      id: 'p1',
      isActive: true,
      isFavorite: true,
    });

    await expect(mocks.useCase.execute('p1', user)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('elimina (soft delete) un producto activo y no favorito', async () => {
    const mocks = createMocks();
    const product = {
      id: 'p1',
      isActive: true,
      isFavorite: false,
      updatedBy: null,
    };
    mocks.productRepository.findOne.mockResolvedValue(product);

    await mocks.useCase.execute('p1', user);

    expect(product.isActive).toBe(false);
    expect(product.updatedBy).toBe(user);
    expect(mocks.productRepository.save).toHaveBeenCalledWith(product);
  });
});
