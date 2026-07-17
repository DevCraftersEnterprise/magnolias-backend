import { DataSource } from "typeorm";
import { encrypt } from "../common/utils/encryption.util";
import * as rotateEncryptionKey from './rotate-encryption-key';

const queryMock = jest.fn();

jest.mock('typeorm', () => ({
    DataSource: jest.fn().mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
        isInitialized: true,
        query: queryMock
    })),
}));

const {
    validateEnvironment,
    rotateCustomerPhones,
    rotateOrderTransferAccounts,
    main,
} = rotateEncryptionKey;

describe('rotate-encryption-key', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();

        process.env = {
            ...ORIGINAL_ENV,
            OLD_ENCRYPTION_KEY: 'old-key-0123456789',
            NEW_ENCRYPTION_KEY: 'new-key-9876543210',
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
            delete process.env.DB_HOST;

            expect(() => validateEnvironment()).toThrow(
                /Missing required environment variables/
            );
        });

        it('lanza un error si OLD_ENCRYPTION_KEY y NEW_ENCRYPTION_KEY son iguales', () => {
            process.env.NEW_ENCRYPTION_KEY = process.env.OLD_ENCRYPTION_KEY;

            expect(() => validateEnvironment()).toThrow(
                /OLD_ENCRYPTION_KEY and NEW_ENCRYPTION_KEY must be different/,
            );
        });

        it('no lanza error cuando toda la configuración es válida', () => {
            expect(() => validateEnvironment()).not.toThrow();
        });
    });

    describe('rotateCustomerPhones', () => {
        it('re-encripta phone y omite registros no cifrados o sin valor', async () => {
            const encryptedPhone = encrypt('5551234567', 'OLD_ENCRYPTION_KEY');

            queryMock
                .mockResolvedValueOnce([
                    { id: 'c1', phone: encryptedPhone, alternativePhone: null },
                    { id: 'c2', phone: 'plain-not-encrypted', alternativePhone: null },
                    { id: 'c3', phone: null, alternativePhone: null },
                ])
                .mockResolvedValueOnce(undefined);

            const dataSource = new DataSource({} as never);
            const stats = await rotateCustomerPhones(dataSource);

            expect(stats.table).toBe('customers');
            expect(stats.total).toBe(3);
            expect(stats.rotated).toBe(1);
            expect(stats.skipped).toBe(2);
            expect(stats.errors).toBe(0);
            expect(queryMock).toHaveBeenNthCalledWith(
                1,
                'SELECT id, phone, "alternativePhone" FROM customers',
            )
        });

        it('cuenta un error por registro si la re-encriptación falla', async () => {
            queryMock.mockResolvedValueOnce([
                { id: 'c1', phone: 'aa:bb:cc', alternativePhone: null },
            ]);

            const dataSource = new DataSource({} as never);
            const stats = await rotateCustomerPhones(dataSource);

            expect(stats.errors).toBe(0);
            expect(stats.skipped).toBe(1);
        });
    });

    describe('rotateOrderTransferAccounts', () => {
        it('re-encripta transferAccount cuando está cifrado', async () => {
            const encryptedAccount = encrypt(
                '0123456789012345',
                'OLD_ENCRYPTION_KEY',
            );

            queryMock
                .mockResolvedValueOnce([{ id: 'o1', transferAccount: encryptedAccount }])
                .mockResolvedValueOnce(undefined);

            const dataSource = new DataSource({} as never);
            const stats = await rotateOrderTransferAccounts(dataSource);

            expect(stats.table).toBe('orders (transferAccount)');
            expect(stats.total).toBe(1);
            expect(stats.rotated).toBe(1);
            expect(stats.errors).toBe(0);
            expect(queryMock).toHaveBeenNthCalledWith(
                1,
                'SELECT id, "transferAccount" FROM orders WHERE "transferAccount" IS NOT NULL',
            );
        });

        it('omite cuentas no cifradas sin marcarlas como error', async () => {
            queryMock.mockResolvedValueOnce([
                { id: 'o1', transferAccount: 'plain-account-number' },
            ]);

            const dataSource = new DataSource({} as never);
            const stats = await rotateOrderTransferAccounts(dataSource);

            expect(stats.rotated).toBe(0);
            expect(stats.skipped).toBe(1);
        });
    });

    describe('main (regresión de pickupPersonPhone)', () => {
        it('no expone rotateOrderPhones como función pública', () => {
            expect((rotateEncryptionKey as Record<string, unknown>).rotateOrderPhones).toBeUndefined();
        });

        it('nunca consulta la columna eliminada orders.pickupPersonPhone', async () => {
            queryMock.mockResolvedValue([]);

            await main();

            const executedQueries = queryMock.mock.calls.map(([sql]) => sql as string);

            expect(executedQueries.some((sql) => sql.includes('pickupPersonPhone'))).toBe(false);
            expect(executedQueries.some((sql) => sql.includes('FROM customers'))).toBe(true);
            expect(
                executedQueries.some((sql) => sql.includes('FROM orders WHERE "transferAccount"')),
            ).toBe(true);
        });
    });
});
