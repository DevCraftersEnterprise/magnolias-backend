import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HideOrderDetailReferenceImageUseCase } from './hide-order-detail-reference-image.usecase';
import type { User } from '../../../users/entities/user.entity';

function createMocks() {
    const orderDetailReferenceImageRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new HideOrderDetailReferenceImageUseCase(
        orderDetailReferenceImageRepository as never,
    );

    return { useCase, orderDetailReferenceImageRepository };
}

const user = { id: 'user-1' } as User;

describe('HideOrderDetailReferenceImageUseCase', () => {
    it('lanza NotFoundException si la imagen no existe', async () => {
        const mocks = createMocks();
        mocks.orderDetailReferenceImageRepository.findOne.mockResolvedValue(null);

        await expect(mocks.useCase.execute('img-1', user)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('lanza BadRequestException si la imagen ya está oculta', async () => {
        const mocks = createMocks();
        mocks.orderDetailReferenceImageRepository.findOne.mockResolvedValue({
            id: 'img-1',
            isActive: false,
        });

        await expect(mocks.useCase.execute('img-1', user)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('oculta la imagen: isActive=false y registra updatedBy', async () => {
        const mocks = createMocks();
        const image = { id: 'img-1', isActive: true, updatedBy: null };
        mocks.orderDetailReferenceImageRepository.findOne.mockResolvedValue(image);

        await mocks.useCase.execute('img-1', user);

        expect(image.isActive).toBe(false);
        expect(image.updatedBy).toBe(user);
        expect(mocks.orderDetailReferenceImageRepository.save).toHaveBeenCalledWith(image);
    });
});
