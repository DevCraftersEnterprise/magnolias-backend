import { DataSource } from 'typeorm';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedBreadType {
  name: string;
  description: string;
}

export async function seedBreadTypes(dataSource: DataSource): Promise<void> {
  console.log('� Iniciando seed de tipos de pan para pastel...');

  const breadTypeRepository = dataSource.getRepository(BreadType);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de tipos de pan para pastel',
    );
    return;
  }

  const breadTypes: SeedBreadType[] = [
    { name: 'Vainilla', description: 'Pan de vainilla clásico, suave y esponjoso' },
    { name: 'Chocolate', description: 'Pan de chocolate intenso' },
    { name: 'Fresa', description: 'Pan con sabor a fresa natural' },
    { name: 'Marmoleado', description: 'Combinación de vainilla y chocolate' },
    { name: 'Red Velvet', description: 'Pan red velvet con toque de cacao' },
    { name: 'Zanahoria', description: 'Pan de zanahoria con especias' },
    { name: 'Limón', description: 'Pan con ralladura de limón fresco' },
    { name: 'Naranja', description: 'Pan con sabor a naranja natural' },
    { name: 'Nuez', description: 'Pan de vainilla con nueces' },
    { name: 'Almendra', description: 'Pan con esencia y hojuelas de almendra' },
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
