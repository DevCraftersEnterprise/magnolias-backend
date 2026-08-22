import { DataSource } from 'typeorm';
import { encrypt } from '../common/utils/encryption.util';
import { buildPhoneIndexFields } from '../common/utils/phone-hash.util';
import * as backfillCustomerPhoneIndex from './backfill-customer-phone-index';

const queryMock = jest.fn();

jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    query: queryMock,
  })),
}));

const {
  validateEnvironment,
  backfillCustomerPhoneIndex: runBackfill,
  printStats,
  main,
} = backfillCustomerPhoneIndex;

describe('backfill-customer-phone-index', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env = {
      ...ORIGINAL_ENV,
      ENCRYPTION_KEY: 'encryption-key-0123456789',
      PHONE_HASH_SECRET: 'phone-hash-secret-9876543210',
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

  describe('validateEnvironment', () => {
    it('lanza un error si falta una variable de entorno requerida', () => {
      delete process.env.PHONE_HASH_SECRET;

      expect(() => validateEnvironment()).toThrow(
        /Missing required environment variables/,
      );
    });

    it('no lanza error cuando toda la configuración es válida', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });
  });

  describe('backfillCustomerPhoneIndex', () => {
    it('calcula phoneHash/phoneLast4 para teléfonos cifrados y sin cifrar, y omite los vacíos', async () => {
      const encryptedPhone = encrypt('5551234567');

      queryMock
        .mockResolvedValueOnce([
          { id: 'c1', phone: encryptedPhone },
          { id: 'c2', phone: '5559876543' },
          { id: 'c3', phone: null },
        ])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const dataSource = new DataSource({} as never);
      const stats = await runBackfill(dataSource);

      expect(stats.total).toBe(3);
      expect(stats.updated).toBe(2);
      expect(stats.skipped).toBe(1);
      expect(stats.errors).toBe(0);

      const expectedC1 = buildPhoneIndexFields('5551234567');
      const expectedC2 = buildPhoneIndexFields('5559876543');

      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        `UPDATE customers SET "phoneHash" = $1, "phoneLast4" = $2 WHERE id = $3`,
        [expectedC1.phoneHash, expectedC1.phoneLast4, 'c1'],
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        3,
        `UPDATE customers SET "phoneHash" = $1, "phoneLast4" = $2 WHERE id = $3`,
        [expectedC2.phoneHash, expectedC2.phoneLast4, 'c2'],
      );
    });

    it('cuenta un error por registro si el backfill de esa fila falla', async () => {
      queryMock
        .mockResolvedValueOnce([{ id: 'c1', phone: '5551234567' }])
        .mockRejectedValueOnce(new Error('db unavailable'));

      const dataSource = new DataSource({} as never);
      const stats = await runBackfill(dataSource);

      expect(stats.total).toBe(1);
      expect(stats.updated).toBe(0);
      expect(stats.errors).toBe(1);
    });
  });

  describe('printStats', () => {
    it('advierte cuando hubo errores', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      printStats({ total: 3, updated: 2, skipped: 0, errors: 1 });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed with 1 errors'),
      );

      logSpy.mockRestore();
    });
  });

  describe('main', () => {
    it('consulta y actualiza los clientes vía el DataSource del script', async () => {
      queryMock.mockResolvedValue([]);

      await main();

      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        'SELECT id, phone FROM customers',
      );
    });
  });
});
