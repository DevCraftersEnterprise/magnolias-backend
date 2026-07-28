import { BreadType } from '../../bread-types/entities/bread-type.entity';

describe('BaseCatalogEntity', () => {
    it('se puede importar junto con una entidad de catálogo sin disparar el ciclo con order/user (regresión)', () => {
        expect(BreadType).toBeDefined();
    });
});
