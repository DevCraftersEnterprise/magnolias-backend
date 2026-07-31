import { Repository } from 'typeorm';
import { BranchEmployeesService } from '../../branch-employees/branch-employees.service';
import { BranchEmployee } from '../../branch-employees/entities/branch-employee.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedBranchEmployees(
  branchEmployeesService: BranchEmployeesService,
  branchEmployeeRepository: Repository<BranchEmployee>,
  userRepository: Repository<User>,
  branchRepository: Repository<Branch>,
): Promise<void> {
  console.log('🧑‍🍳 Iniciando seed de empleados por sucursal...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.SUPER },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de empleados',
    );
    return;
  }

  const branches = await branchRepository.find();

  if (branches.length === 0) {
    console.log('   ⚠️  No hay sucursales, omitiendo seed de empleados');
    return;
  }

  const employees = [
    { name: 'Ana', lastname: 'Martínez', pin: '1001', branchIndex: 0 },
    { name: 'Luis', lastname: 'Hernández', pin: '1002', branchIndex: 1 },
    { name: 'Carmen', lastname: 'López', pin: '1003', branchIndex: 2 },
    { name: 'Pedro', lastname: 'García', pin: '1004', branchIndex: 0 },
    { name: 'María', lastname: 'Rodríguez', pin: '1005', branchIndex: 1 },
  ].filter((e) => branches[e.branchIndex]);

  let createdCount = 0;

  for (const { name, lastname, pin, branchIndex } of employees) {
    const branch = branches[branchIndex];

    try {
      const existingEmployee = await branchEmployeeRepository.findOne({
        where: { name, lastname, branch: { id: branch.id } },
      });

      if (existingEmployee) {
        console.log(
          `   ⏭️  Empleado '${name} ${lastname}' ya existe, omitiendo...`,
        );
        continue;
      }

      await branchEmployeesService.create(
        { name, lastname, pin, branchId: branch.id },
        adminUser,
      );

      console.log(
        `   ✅ Empleado creado: ${name} ${lastname} (sucursal ${branch.name}, PIN ${pin})`,
      );
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear empleado '${name} ${lastname}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
