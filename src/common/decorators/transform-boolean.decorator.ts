import { Transform } from 'class-transformer';

export function TransformBoolean() {
    return Transform(({ value }) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true' || value === '1') return true;
            if (value.toLowerCase() === 'false' || value === '0') return false;
        }
        return undefined;
    });
}