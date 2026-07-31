import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { BranchEmployee } from '../entities/branch-employee.entity';

/**
 * PINs are hashed, so uniqueness within a branch can't be enforced with a DB
 * constraint — this scans the (small) set of active employees for that
 * branch and compares hashes one by one.
 */
export async function isPinTakenInBranch(
  repository: Repository<BranchEmployee>,
  branchId: string,
  pin: string,
  excludeEmployeeId?: string,
): Promise<boolean> {
  const activeEmployees = await repository.find({
    where: { branch: { id: branchId }, isActive: true },
  });

  for (const employee of activeEmployees) {
    if (employee.id === excludeEmployeeId) continue;
    if (await argon2.verify(employee.pin, pin)) return true;
  }

  return false;
}
