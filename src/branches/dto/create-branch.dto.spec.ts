import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBranchDto } from './create-branch.dto';

function build(overrides: Partial<CreateBranchDto> = {}): CreateBranchDto {
    return plainToInstance(CreateBranchDto, {
        name: 'Sucursal Centro',
        address: 'Av. Siempre Viva 123',
        ...overrides,
    });
}

describe('CreateBranchDto', () => {
    it('es válido sin locationUrl', async () => {
        const errors = await validate(build());
        expect(errors).toHaveLength(0);
    });

    it.each([
        'https://www.google.com/maps/embed?pb=abc123',
        'https://google.com/maps/place/Foo',
        'https://maps.google.com/?q=21.88,-102.29',
        'https://maps.app.goo.gl/abc123',
    ])('acepta el enlace de Google Maps válido: %s', async (locationUrl) => {
        const errors = await validate(build({ locationUrl }));
        expect(errors).toHaveLength(0);
    });

    it.each([
        'https://maps.evil.com/maps/embed?pb=abc123',
        'https://example.com',
        'not-a-url',
        'http://www.google.com/maps/embed?pb=abc123',
    ])(
        'rechaza enlaces que no son de Google Maps: %s',
        async (locationUrl) => {
            const errors = await validate(build({ locationUrl }));
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('locationUrl');
        },
    );

    it('requiere name y address', async () => {
        const errors = await validate(build({ name: '', address: '' }));
        const properties = errors.map((e) => e.property);
        expect(properties).toEqual(expect.arrayContaining(['name', 'address']));
    });
});
