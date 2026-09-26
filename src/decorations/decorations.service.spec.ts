import { DecorationsService } from './decorations.service';
import type { User } from '../users/entities/user.entity';

describe('DecorationsService', () => {
    let createUseCaseMock: { execute: jest.Mock };
    let findAllUseCaseMock: { execute: jest.Mock };
    let findOneUseCaseMock: { execute: jest.Mock };
    let updateUseCaseMock: { execute: jest.Mock };
    let removeUseCaseMock: { execute: jest.Mock };
    let service: DecorationsService;
    const user = { id: 'user-1' } as User;

    beforeEach(() => {
        createUseCaseMock = { execute: jest.fn() };
        findAllUseCaseMock = { execute: jest.fn() };
        findOneUseCaseMock = { execute: jest.fn() };
        updateUseCaseMock = { execute: jest.fn() };
        removeUseCaseMock = { execute: jest.fn() };

        service = new DecorationsService(
            createUseCaseMock as never,
            findAllUseCaseMock as never,
            findOneUseCaseMock as never,
            updateUseCaseMock as never,
            removeUseCaseMock as never,
        );
    });

    it('create delega en CreateDecorationUseCase', async () => {
        createUseCaseMock.execute.mockResolvedValue({ id: 'decoration-1' });

        const result = await service.create(
            { name: 'Perlas doradas' } as never,
            user,
        );

        expect(createUseCaseMock.execute).toHaveBeenCalledWith(
            { name: 'Perlas doradas' },
            user,
        );
        expect(result).toEqual({ id: 'decoration-1' });
    });

    it('findAll delega en FindAllDecorationsUseCase', async () => {
        findAllUseCaseMock.execute.mockResolvedValue([]);

        const result = await service.findAll({} as never);

        expect(findAllUseCaseMock.execute).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });

    it('findOne delega en FindOneDecorationUseCase', async () => {
        findOneUseCaseMock.execute.mockResolvedValue({ id: 'decoration-1' });

        const result = await service.findOne('decoration-1');

        expect(findOneUseCaseMock.execute).toHaveBeenCalledWith('decoration-1');
        expect(result).toEqual({ id: 'decoration-1' });
    });

    it('update delega en UpdateDecorationUseCase', async () => {
        updateUseCaseMock.execute.mockResolvedValue({ id: 'decoration-1' });

        const result = await service.update(
            'decoration-1',
            { name: 'Chispas' } as never,
            user,
        );

        expect(updateUseCaseMock.execute).toHaveBeenCalledWith(
            'decoration-1',
            { name: 'Chispas' },
            user,
        );
        expect(result).toEqual({ id: 'decoration-1' });
    });

    it('remove delega en RemoveDecorationUseCase', async () => {
        await service.remove('decoration-1', user);

        expect(removeUseCaseMock.execute).toHaveBeenCalledWith(
            'decoration-1',
            user,
        );
    });
});
