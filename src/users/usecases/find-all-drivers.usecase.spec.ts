import { FindAllDriversUseCase } from './find-all-drivers.usecase';
import { UserRoles } from '../enums/user-role';

function createMocks() {
    const userRepository = {
        find: jest.fn(),
    };

    const useCase = new FindAllDriversUseCase(userRepository as never);

    return { useCase, userRepository };
}

describe('FindAllDriversUseCase', () => {
    it('busca usuarios con rol DRIVER asociados a la sucursal dada', async () => {
        const mocks = createMocks();
        mocks.userRepository.find.mockResolvedValue([{ id: 'driver-1' }]);

        const result = await mocks.useCase.execute('branch-1');

        expect(mocks.userRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { branches: { id: 'branch-1' }, role: UserRoles.DRIVER },
            }),
        );
        expect(result).toEqual([{ id: 'driver-1' }]);
    });

    it('retorna un arreglo vacío si no hay repartidores en la sucursal', async () => {
        const mocks = createMocks();
        mocks.userRepository.find.mockResolvedValue([]);

        const result = await mocks.useCase.execute('branch-sin-drivers');

        expect(result).toEqual([]);
    });
});
