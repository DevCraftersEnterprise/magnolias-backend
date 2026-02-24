import { DataSource } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Phone } from '../../branches/entities/phone.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedBranch {
  name: string;
  address: string;
  phone: string;
}

export async function seedBranches(dataSource: DataSource): Promise<void> {
  console.log('🏢 Iniciando seed de sucursales...');

  const branchRepository = dataSource.getRepository(Branch);
  const phoneRepository = dataSource.getRepository(Phone);
  const userRepository = dataSource.getRepository(User);

  // Obtener un usuario administrador para crear las sucursales
  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de sucursales',
    );
    return;
  }

  const branches: SeedBranch[] = [
    {
      name: 'Magnolias Centro',
      address: 'Av. Juárez 123, Centro Histórico, CDMX',
      phone: '+52 55 1234 5678',
    },
    {
      name: 'Magnolias Polanco',
      address: 'Calle Presidente Masaryk 456, Polanco, CDMX',
      phone: '+52 55 2345 6789',
    },
    {
      name: 'Magnolias Coyoacán',
      address: 'Av. Miguel Ángel de Quevedo 789, Coyoacán, CDMX',
      phone: '+52 55 3456 7890',
    },
    {
      name: 'Magnolias Santa Fe',
      address: 'Vasco de Quiroga 3800, Santa Fe, CDMX',
      phone: '+52 55 4567 8901',
    },
  ];

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
      const branch = branchRepository.create({
        name: branchData.name,
        address: branchData.address,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await branchRepository.save(branch);

      // Luego crear el teléfono con la referencia a la sucursal
      const phone = phoneRepository.create({
        phone1: branchData.phone,
        branch: branch,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await phoneRepository.save(phone);

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
