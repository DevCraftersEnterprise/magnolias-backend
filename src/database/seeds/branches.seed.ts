import { Repository } from 'typeorm';
import { BranchesService } from '../../branches/branches.service';
import { CreateBranchDto } from '../../branches/dto/create-branch.dto';
import { CreatePhonesDto } from '../../branches/dto/create-phones.dto';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedBranches(
  branchesService: BranchesService,
  userRepository: Repository<User>,
  branchRepository: Repository<Branch>
): Promise<void> {
  console.log('🏢 Iniciando seed de sucursales...');

  // Obtener un usuario administrador para crear las sucursales
  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.SUPER },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de sucursales',
    );
    return;
  }

  const branches: CreateBranchDto[] = [
    {
      name: 'Magnolias Centro',
      address: 'Av. Juárez 123, Centro Histórico, CDMX',
    },
    {
      name: 'Magnolias Polanco',
      address: 'Calle Presidente Masaryk 456, Polanco, CDMX',
    },
    {
      name: 'Magnolias Coyoacán',
      address: 'Av. Miguel Ángel de Quevedo 789, Coyoacán, CDMX',
    },
    {
      name: 'Magnolias Santa Fe',
      address: 'Vasco de Quiroga 3800, Santa Fe, CDMX',
    },
  ];

  const phones: CreatePhonesDto[] = [
    { phone1: '+52 55 1234 5678' },
    { phone1: '+52 55 2345 6789' },
    { phone1: '+52 55 3456 7890' },
    { phone1: '+52 55 4567 8901', },
  ]

  let createdCount = 0;

  for (const branchData of branches) {
    try {
      const existingBranch = await branchRepository.findOne({
        where: { name: branchData.name },
      });

      if (existingBranch) {
        console.log(
          `   ⏭️  Sucursal '${branchData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      // Primero crear la sucursal sin el teléfono
      const branch = await branchesService.create(branchData, adminUser)

      // Luego crear el teléfono con la referencia a la sucursal
      await branchesService.addBranchPhoneNumbers(phones[createdCount], adminUser, branch.id);

      console.log(`   ✅ Sucursal creada: ${branchData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear sucursal '${branchData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creadas: ${createdCount}\n`);
}
