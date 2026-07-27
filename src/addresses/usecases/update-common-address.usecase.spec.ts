import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateCommonAddressUseCase } from './update-common-address.usecase';
import type { UpdateCommonAddressDto } from '../dto/update-common-address.dto';
import type { User } from '../../users/entities/user.entity';

function createMocks() {
    const commonAddressRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };
    const checkForDuplicateAddressUtil = {
        checkForDuplicate: jest.fn(),
    };

    const useCase = new UpdateCommonAddressUseCase(
        commonAddressRepository as never,
        checkForDuplicateAddressUtil as never,
    );

    return { useCase, commonAddressRepository, checkForDuplicateAddressUtil };
}

const user = { id: 'user-1' } as User;

function baseAddress(overrides: Record<string, unknown> = {}) {
    return {
        id: 'id-1',
        street: 'Calle Vieja',
        number: '1',
        neighborhood: 'Centro',
        updatedBy: { id: 'old-user' },
        ...overrides,
    };
}

describe('UpdateCommonAddressUseCase', () => {
    it('lanza NotFoundException si la dirección no existe', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue(null);

        await expect(
            mocks.useCase.execute('id-1', {} as UpdateCommonAddressDto, user),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si otra dirección ya tiene la misma calle/número/colonia', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue(baseAddress());
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue({
            id: 'otra-direccion',
        });

        await expect(
            mocks.useCase.execute(
                'id-1',
                { street: 'Calle Nueva' } as UpdateCommonAddressDto,
                user,
            ),
        ).rejects.toThrow(ConflictException);
    });

    it('no lanza conflicto si la "duplicada" encontrada es la misma dirección que se edita', async () => {
        const mocks = createMocks();
        const address = baseAddress();
        mocks.commonAddressRepository.findOne.mockResolvedValue(address);
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue({
            id: 'id-1',
        });

        await expect(
            mocks.useCase.execute(
                'id-1',
                { street: 'Calle Nueva' } as UpdateCommonAddressDto,
                user,
            ),
        ).resolves.toBeDefined();
    });

    it('usa los valores existentes como fallback si el DTO no trae street/number/neighborhood', async () => {
        const mocks = createMocks();
        mocks.commonAddressRepository.findOne.mockResolvedValue(baseAddress());
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue(null);

        await mocks.useCase.execute(
            'id-1',
            { name: 'Nuevo nombre' } as UpdateCommonAddressDto,
            user,
        );

        expect(
            mocks.checkForDuplicateAddressUtil.checkForDuplicate,
        ).toHaveBeenCalledWith('Calle Vieja', '1', 'Centro');
    });

    it('aplica los campos del DTO sobre la dirección y la guarda', async () => {
        const mocks = createMocks();
        const address = baseAddress();
        mocks.commonAddressRepository.findOne.mockResolvedValue(address);
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue(null);

        const result = await mocks.useCase.execute(
            'id-1',
            { name: 'Nuevo nombre' } as UpdateCommonAddressDto,
            user,
        );

        expect(result.name).toBe('Nuevo nombre');
        expect(mocks.commonAddressRepository.save).toHaveBeenCalledWith(address);
    });

    // REGRESIÓN: el usecase asigna `{ updateBy: user }` (typo) en vez de `updatedBy`,
    // que es el nombre real de la columna en la entidad (ver create/remove, que sí
    // usan `updatedBy`). Como resultado, `updatedBy` NUNCA se actualiza al editar.
    // Este test documenta el bug tal cual está hoy (flagueado en el backlog, no se
    // corrige en esta tarea). Si se corrige a futuro, este test debe fallar y
    // obligar a actualizarlo a propósito.
    it('REGRESIÓN: updatedBy NO se actualiza al editar (bug de typo updateBy vs updatedBy)', async () => {
        const mocks = createMocks();
        const originalUpdatedBy = { id: 'old-user' };
        const address = baseAddress({ updatedBy: originalUpdatedBy });
        mocks.commonAddressRepository.findOne.mockResolvedValue(address);
        mocks.checkForDuplicateAddressUtil.checkForDuplicate.mockResolvedValue(null);

        const result = await mocks.useCase.execute(
            'id-1',
            { name: 'Nuevo nombre' } as UpdateCommonAddressDto,
            user,
        );

        expect(result.updatedBy).toBe(originalUpdatedBy);
        expect((result as unknown as { updateBy: User }).updateBy).toBe(user);
    });
});
