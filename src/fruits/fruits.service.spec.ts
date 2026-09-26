import { FruitsService } from './fruits.service';
import type { User } from '../users/entities/user.entity';

describe('FruitsService', () => {
    let createUseCaseMock: { execute: jest.Mock };
    let findAllUseCaseMock: { execute: jest.Mock };
    let findOneUseCaseMock: { execute: jest.Mock };
    let updateUseCaseMock: { execute: jest.Mock };
    let removeUseCaseMock: { execute: jest.Mock };
    let service: FruitsService;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        createUseCaseMock = { execute: jest.fn() };
        findAllUseCaseMock = { execute: jest.fn() };
        findOneUseCaseMock = { execute: jest.fn() };
        updateUseCaseMock = { execute: jest.fn() };
        removeUseCaseMock = { execute: jest.fn() };

        service = new FruitsService(
            createUseCaseMock as never,
            findAllUseCaseMock as never,
            findOneUseCaseMock as never,
            updateUseCaseMock as never,
            removeUseCaseMock as never,
        );
    });

    it('create delega en CreateFruitUseCase', async () => {
        createUseCaseMock.execute.mockResolvedValue({ id: 'fruit-1' });

        const result = await service.create({ name: 'Fresa' } as never, user);

        expect(createUseCaseMock.execute).toHaveBeenCalledWith(
            { name: 'Fresa' },
            user,
        );
        expect(result).toEqual({ id: 'fruit-1' });
    });

    it('findAll delega en FindAllFruitsUseCase', async () => {
        findAllUseCaseMock.execute.mockResolvedValue([]);

        const result = await service.findAll({} as never);

        expect(findAllUseCaseMock.execute).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });

    it('findOne delega en FindOneFruitUseCase', async () => {
        findOneUseCaseMock.execute.mockResolvedValue({ id: 'fruit-1' });

        const result = await service.findOne('fruit-1');

        expect(findOneUseCaseMock.execute).toHaveBeenCalledWith('fruit-1');
        expect(result).toEqual({ id: 'fruit-1' });
    });

    it('update delega en UpdateFruitUseCase', async () => {
        updateUseCaseMock.execute.mockResolvedValue({ id: 'fruit-1' });

        const result = await service.update(
            'fruit-1',
            { name: 'Mango' } as never,
            user,
        );

        expect(updateUseCaseMock.execute).toHaveBeenCalledWith(
            'fruit-1',
            { name: 'Mango' },
            user,
        );
        expect(result).toEqual({ id: 'fruit-1' });
    });

    it('remove delega en RemoveFruitUseCase', async () => {
        await service.remove('fruit-1', user);

        expect(removeUseCaseMock.execute).toHaveBeenCalledWith('fruit-1', user);
    });
});
