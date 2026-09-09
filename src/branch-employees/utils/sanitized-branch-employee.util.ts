import { BranchEmployee } from '../entities/branch-employee.entity';

export const sanitizeBranchEmployee = (
  employee: Partial<BranchEmployee>,
): Omit<BranchEmployee, 'pin'> => {
  return {
    id: employee.id,
    name: employee.name,
    lastname: employee.lastname,
    isActive: employee.isActive,
    branch: employee.branch,
    createdBy: employee.createdBy,
    updatedBy: employee.updatedBy,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  } as Omit<BranchEmployee, 'pin'>;
};

export const sanitizeBranchEmployees = (
  employees: BranchEmployee[],
): Omit<BranchEmployee, 'pin'>[] => employees.map(sanitizeBranchEmployee);
