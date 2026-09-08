import {
    sanitizeBranchEmployee,
    sanitizeBranchEmployees,
} from './sanitized-branch-employee.util';
import type { BranchEmployee } from '../entities/branch-employee.entity';

function buildEmployee(overrides: Partial<BranchEmployee> = {}): BranchEmployee {
    return {
        id: 'employee-1',
        name: 'María',
        lastname: 'García',
        pin: '$argon2id$v=19$m=65536,t=3,p=4$hashedpin',
        isActive: true,
        ...overrides,
    } as BranchEmployee;
}

describe('sanitizeBranchEmployee', () => {
    it('elimina el campo pin del empleado', () => {
        const employee = buildEmployee();

        const result = sanitizeBranchEmployee(employee);

        expect(result).not.toHaveProperty('pin');
        expect(result.id).toBe('employee-1');
        expect(result.name).toBe('María');
    });

    it('no muta el objeto original', () => {
        const employee = buildEmployee();

        sanitizeBranchEmployee(employee);

        expect(employee.pin).toBeDefined();
    });
});

describe('sanitizeBranchEmployees', () => {
    it('elimina el campo pin de cada empleado en la lista', () => {
        const employees = [
            buildEmployee({ id: 'e1' }),
            buildEmployee({ id: 'e2' }),
        ];

        const result = sanitizeBranchEmployees(employees);

        expect(result).toHaveLength(2);
        result.forEach((employee) => {
            expect(employee).not.toHaveProperty('pin');
        });
    });

    it('retorna un arreglo vacío para una lista vacía', () => {
        expect(sanitizeBranchEmployees([])).toEqual([]);
    });
});
