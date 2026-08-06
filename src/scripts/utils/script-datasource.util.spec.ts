import { DataSource } from 'typeorm';
import { buildScriptDataSource, runScript } from './script-datasource.util';

const initializeMock = jest.fn().mockResolvedValue(undefined);
const destroyMock = jest.fn().mockResolvedValue(undefined);

jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation((options) => ({
    options,
    initialize: initializeMock,
    destroy: destroyMock,
    isInitialized: true,
  })),
}));

describe('script-datasource.util', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env = {
      ...ORIGINAL_ENV,
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'test',
      DB_PASSWORD: 'test',
      DB_NAME: 'test',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('buildScriptDataSource', () => {
    it('crea un DataSource de postgres con SSL a partir de las variables DB_*', () => {
      buildScriptDataSource();

      expect(DataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
          ssl: true,
        }),
      );
    });
  });

  describe('runScript', () => {
    it('inicializa, ejecuta la tarea y cierra la conexión', async () => {
      const dataSource = new DataSource({} as never);
      const task = jest.fn().mockResolvedValue(undefined);

      await runScript(dataSource, task);

      expect(initializeMock).toHaveBeenCalled();
      expect(task).toHaveBeenCalled();
      expect(destroyMock).toHaveBeenCalled();
    });

    it('registra el error y termina el proceso si la tarea falla, cerrando igual la conexión', async () => {
      const dataSource = new DataSource({} as never);
      const task = jest.fn().mockRejectedValue(new Error('boom'));
      const exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation(() => undefined as never);
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await runScript(dataSource, task);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Fatal error'),
        expect.any(Error),
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(destroyMock).toHaveBeenCalled();

      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
