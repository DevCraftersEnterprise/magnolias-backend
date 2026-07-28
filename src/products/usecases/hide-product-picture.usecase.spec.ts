import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HideProductPictureUseCase } from './hide-product-picture.usecase';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
  const productPictureRepository = {
    findOne: jest.fn(),
    save: jest.fn((entity) => Promise.resolve(entity)),
  };

  const useCase = new HideProductPictureUseCase(productPictureRepository as never);

  return { useCase, productPictureRepository };
}

const user = { id: 'user-1' } as User;

describe('HideProductPictureUseCase', () => {
  it('lanza NotFoundException si la foto no existe', async () => {
    const mocks = createMocks();
    mocks.productPictureRepository.findOne.mockResolvedValue(null);

    await expect(mocks.useCase.execute('pic-1', user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza BadRequestException si la foto ya está oculta', async () => {
    const mocks = createMocks();
    mocks.productPictureRepository.findOne.mockResolvedValue({
      id: 'pic-1',
      isActive: false,
    });

    await expect(mocks.useCase.execute('pic-1', user)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('oculta la foto: isActive=false y registra updatedBy', async () => {
    const mocks = createMocks();
    const picture = { id: 'pic-1', isActive: true, updatedBy: null };
    mocks.productPictureRepository.findOne.mockResolvedValue(picture);

    await mocks.useCase.execute('pic-1', user);

    expect(picture.isActive).toBe(false);
    expect(picture.updatedBy).toBe(user);
    expect(mocks.productPictureRepository.save).toHaveBeenCalledWith(picture);
  });
});
