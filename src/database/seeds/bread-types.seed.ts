import { DataSource } from 'typeorm';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedBreadType {
  name: string;
  description: string;
}

export async function seedBreadTypes(dataSource: DataSource): Promise<void> {
  console.log('🍞 Iniciando seed de tipos de pan...');

  const breadTypeRepository = dataSource.getRepository(BreadType);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de tipos de pan',
    );
    return;
  }

  const breadTypes: SeedBreadType[] = [
    { name: 'Blanco', description: 'Pan blanco tradicional' },
    { name: 'Integral', description: 'Pan de trigo integral' },
    { name: 'Centeno', description: 'Pan de centeno oscuro' },
    { name: 'Multigrano', description: 'Pan con mezcla de cereales' },
    { name: 'Brioche', description: 'Pan francés enriquecido' },
    { name: 'De Caja Blanco', description: 'Pan de caja tradicional blanco' },
    { name: 'De Caja Integral', description: 'Pan de caja integral' },
    { name: 'Sin Gluten', description: 'Pan libre de gluten' },
    { name: 'De Ajo', description: 'Pan con ajo y mantequilla' },
    { name: 'De Nuez', description: 'Pan con nueces' },
  ];

  let createdCount = 0;

  for (const breadTypeData of breadTypes) {
    try {
      const existing = await breadTypeRepository.findOne({
        where: { name: breadTypeData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Tipo de pan '${breadTypeData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      const breadType = breadTypeRepository.create({
        name: breadTypeData.name,
        description: breadTypeData.description,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await breadTypeRepository.save(breadType);
      console.log(`   ✅ Tipo de pan creado: ${breadTypeData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear tipo de pan '${breadTypeData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
