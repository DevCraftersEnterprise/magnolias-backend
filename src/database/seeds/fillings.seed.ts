import { DataSource } from 'typeorm';
import { Filling } from '../../fillings/entities/filling.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedFilling {
  name: string;
  description: string;
}

export async function seedFillings(dataSource: DataSource): Promise<void> {
  console.log('🥧 Iniciando seed de rellenos...');

  const fillingRepository = dataSource.getRepository(Filling);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de rellenos',
    );
    return;
  }

  const fillings: SeedFilling[] = [
    { name: 'Crema Pastelera', description: 'Crema pastelera tradicional' },
    {
      name: 'Ganache de Chocolate',
      description: 'Ganache de chocolate oscuro',
    },
    { name: 'Mermelada de Fresa', description: 'Mermelada de fresa natural' },
    { name: 'Dulce de Leche', description: 'Dulce de leche cremoso' },
    { name: 'Crema de Mantequilla', description: 'Crema de mantequilla suave' },
    { name: 'Chantilly', description: 'Crema chantilly batida' },
    { name: 'Crema de Queso', description: 'Queso crema natural' },
    { name: 'Baviera', description: 'Crema baviera de vainilla' },
    { name: 'Mousse de Chocolate', description: 'Mousse de chocolate aireado' },
    { name: 'Mermelada de Frambuesa', description: 'Mermelada de frambuesa' },
    { name: 'Cajeta con Nuez', description: 'Cajeta mexicana con nuez' },
    { name: 'Lemon Curd', description: 'Crema de limón inglesa' },
    { name: 'Nutella', description: 'Crema de avellanas' },
    { name: 'Crema de Coco', description: 'Crema de coco natural' },
  ];

  let createdCount = 0;

  for (const fillingData of fillings) {
    try {
      const existing = await fillingRepository.findOne({
        where: { name: fillingData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Relleno '${fillingData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      const filling = fillingRepository.create({
        name: fillingData.name,
        description: fillingData.description,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await fillingRepository.save(filling);
      console.log(`   ✅ Relleno creado: ${fillingData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear relleno '${fillingData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
