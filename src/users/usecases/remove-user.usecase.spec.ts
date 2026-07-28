import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RemoveUserUseCase } from './remove-user.usecase';
import { UserRoles } from '../enums/user-role';
import type { UpdateUserDto } from '../dto/update-user.dto';
import type { User } from '../entities/user.entity';

function createMocks() {
    const userRepository = {
        findOne: jest.fn(),
        save: jest.fn((entity) => Promise.resolve(entity)),
    };

    const useCase = new RemoveUserUseCase(userRepository as never);

    return { useCase, userRepository };
}

describe('RemoveUserUseCase', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue(null);
        const currentUser = { id: 'admin-1', role: UserRoles.ADMIN } as User;

        await expect(
            mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, currentUser),
        ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el usuario ya está inactivo', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'u1',
            isActive: false,
            role: UserRoles.EMPLOYEE,
        });
        const currentUser = { id: 'admin-1', role: UserRoles.ADMIN } as User;

        await expect(
            mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, currentUser),
        ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el nivel del usuario actual no es mayor al del objetivo', async () => {
        const mocks = createMocks();
        mocks.userRepository.findOne.mockResolvedValue({
            id: 'u1',
            isActive: true,
            role: UserRoles.ADMIN,
        });
        const currentUser = { id: 'admin-2', role: UserRoles.ADMIN } as User;

        await expect(
            mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, currentUser),
        ).rejects.toThrow(BadRequestException);
    });

    it('elimina (soft delete) si el usuario actual tiene mayor nivel que el objetivo', async () => {
        const mocks = createMocks();
        const targetUser = {
            id: 'u1',
            isActive: true,
            role: UserRoles.EMPLOYEE,
            updatedBy: null,
        };
        mocks.userRepository.findOne.mockResolvedValue(targetUser);
        const currentUser = { id: 'admin-1', role: UserRoles.ADMIN } as User;

        await mocks.useCase.execute({ id: 'u1' } as UpdateUserDto, currentUser);

        expect(targetUser.isActive).toBe(false);
        expect(targetUser.updatedBy).toBe(currentUser);
        expect(mocks.userRepository.save).toHaveBeenCalledWith(targetUser);
    });
});
