import { NotFoundException } from '@nestjs/common';
import { FindOneProductUseCase } from './find-one-product.usecase';

const validUuid = '11111111-1111-1111-8111-111111111111';

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
  };

  const useCase = new FindOneProductUseCase(productRepository as never);

  return { useCase, productRepository };
}

describe('FindOneProductUseCase', () => {
  describe('execute', () => {
    it('busca por id cuando el término es un UUID', async () => {
      const mocks = createMocks();
      mocks.productRepository.findOne.mockResolvedValue({ id: validUuid });

      await mocks.useCase.execute(validUuid);

      expect(mocks.productRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: validUuid } }),
      );
    });

    it('busca por name en mayúsculas cuando el término no es un UUID', async () => {
      const mocks = createMocks();
      mocks.productRepository.findOne.mockResolvedValue({ id: 'p1' });

      await mocks.useCase.execute('pastel de chocolate');

      expect(mocks.productRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'PASTEL DE CHOCOLATE' },
        }),
      );
    });

    it('lanza NotFoundException si no se encuentra el producto', async () => {
      const mocks = createMocks();
      mocks.productRepository.findOne.mockResolvedValue(null);

      await expect(mocks.useCase.execute('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el producto encontrado', async () => {
      const mocks = createMocks();
      const product = { id: 'p1', name: 'PASTEL' };
      mocks.productRepository.findOne.mockResolvedValue(product);

      const result = await mocks.useCase.execute('PASTEL');

      expect(result).toBe(product);
    });
  });

  describe('favorite', () => {
    it('lanza NotFoundException si no hay producto favorito', async () => {
      const mocks = createMocks();
      mocks.productRepository.findOne.mockResolvedValue(null);

      await expect(mocks.useCase.favorite()).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el producto favorito', async () => {
      const mocks = createMocks();
      const favorite = { id: 'p1', isFavorite: true };
      mocks.productRepository.findOne.mockResolvedValue(favorite);

      const result = await mocks.useCase.favorite();

      expect(result).toBe(favorite);
      expect(mocks.productRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isFavorite: true } }),
      );
    });
  });
});
