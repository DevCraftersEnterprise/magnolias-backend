import { NotFoundException } from '@nestjs/common';
import { UploadPicturesForProductUseCase } from './upload-pictures-for-product.usecase';
import { uploadMultiplePicturesToCloudinary } from '../../common/utils/upload-to-cloudinary';
import type { User } from '../../users/entities/user.entity';

jest.mock('../../common/utils/upload-to-cloudinary', () => ({
  uploadMultiplePicturesToCloudinary: jest.fn(),
}));

const mockedUpload = uploadMultiplePicturesToCloudinary as jest.Mock;

function createMocks() {
  const productRepository = {
    findOne: jest.fn(),
  };
  const productPictureRepository = {
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((entities) => Promise.resolve(entities)),
  };

  const useCase = new UploadPicturesForProductUseCase(
    productRepository as never,
    productPictureRepository as never,
  );

  return { useCase, productRepository, productPictureRepository };
}

const user = { id: 'user-1' } as User;
const files = [{ buffer: Buffer.from('a') }, { buffer: Buffer.from('b') }] as Express.Multer.File[];

describe('UploadPicturesForProductUseCase', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    mockedUpload.mockReset();
  });

  it('lanza NotFoundException si el producto no existe', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne.mockResolvedValue(null);

    await expect(
      mocks.useCase.execute(files, 'p1', user),
    ).rejects.toThrow(NotFoundException);
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it('sube las imágenes y las asocia al producto', async () => {
    const mocks = createMocks();
    const product = { id: 'p1', pictures: [] };
    mocks.productRepository.findOne
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce({ ...product, pictures: [{ imageUrl: 'url1' }, { imageUrl: 'url2' }] });
    mockedUpload.mockResolvedValue(['url1', 'url2']);

    const result = await mocks.useCase.execute(files, 'p1', user);

    expect(mocks.productPictureRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: 'url1', product, createdBy: user, updatedBy: user }),
    );
    expect(mocks.productPictureRepository.save).toHaveBeenCalled();
    expect(result.pictures).toEqual([{ imageUrl: 'url1' }, { imageUrl: 'url2' }]);
  });

  it('lanza NotFoundException si no puede recuperar el producto actualizado tras subir', async () => {
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce({ id: 'p1', pictures: [] })
      .mockResolvedValueOnce(null);
    mockedUpload.mockResolvedValue(['url1']);

    await expect(
      mocks.useCase.execute(files, 'p1', user),
    ).rejects.toThrow(NotFoundException);
  });

  it('usa la carpeta correcta cuando NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce({ id: 'p1', pictures: [] })
      .mockResolvedValueOnce({ id: 'p1', pictures: [] });
    mockedUpload.mockResolvedValue(['url1', 'url2']);

    await mocks.useCase.execute(files, 'p1', user);

    expect(mockedUpload).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ folder: 'magnolias/product/pictures/p1' }),
      ]),
      3,
    );
  });

  // REGRESIÓN: el switch de NODE_ENV no tiene `default`, así que cualquier
  // valor no listado (incluido 'test', el que usa Jest) deja folder=''.
  // Documentado tal cual está hoy (flagueado en el backlog).
  it('REGRESIÓN: folder queda vacío si NODE_ENV no es production/development/staging', async () => {
    process.env.NODE_ENV = 'test';
    const mocks = createMocks();
    mocks.productRepository.findOne
      .mockResolvedValueOnce({ id: 'p1', pictures: [] })
      .mockResolvedValueOnce({ id: 'p1', pictures: [] });
    mockedUpload.mockResolvedValue(['url1', 'url2']);

    await mocks.useCase.execute(files, 'p1', user);

    expect(mockedUpload).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ folder: '' })]),
      3,
    );
  });
});
