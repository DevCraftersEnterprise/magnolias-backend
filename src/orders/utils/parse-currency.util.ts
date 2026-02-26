/**
 * Convierte una cadena con formato de moneda a un número.
 * Ejemplo: "$400.00" -> 400
 * @param value Cadena con formato de moneda
 * @returns Número convertido
 */
export function parseCurrency(value: string | number): number {
    if (typeof value === 'number') {
        return value; // Si ya es un número, retornarlo directamente
    }

    // Eliminar símbolos de moneda, comas y espacios
    const sanitizedValue = value.replace(/[^0-9.-]+/g, '');

    // Convertir a número
    const parsedValue = parseFloat(sanitizedValue);

    if (isNaN(parsedValue)) {
        throw new Error(`Invalid currency value: ${value}`);
    }

    return parsedValue;
}