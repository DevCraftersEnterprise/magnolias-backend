import { FindAllBakersUseCase } from './find-all-bakers.usecase';
import { UserRoles } from '../enums/user-role';

function createMocks() {
    const userRepository = {
        find: jest.fn(),
    };

    const useCase = new FindAllBakersUseCase(userRepository as never);

    return { useCase, userRepository };
}

describe('FindAllBakersUseCase', () => {
    it('busca usuarios con rol BAKER asociados a la sucursal dada', async () => {
        const mocks = createMocks();
        mocks.userRepository.find.mockResolvedValue([{ id: 'baker-1' }]);

        const result = await mocks.useCase.execute('branch-1');

        expect(mocks.userRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { branches: { id: 'branch-1' }, role: UserRoles.BAKER },
            }),
        );
        expect(result).toEqual([{ id: 'baker-1' }]);
    });

    it('retorna un arreglo vacío si no hay reposteros en la sucursal', async () => {
        const mocks = createMocks();
        mocks.userRepository.find.mockResolvedValue([]);

        const result = await mocks.useCase.execute('branch-sin-bakers');

        expect(result).toEqual([]);
    });
});
