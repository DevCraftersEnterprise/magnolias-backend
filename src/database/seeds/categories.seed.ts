import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedCategory {
  name: string;
  description: string;
}

export async function seedCategories(dataSource: DataSource): Promise<void> {
  console.log('📁 Iniciando seed de categorías...');

  const categoryRepository = dataSource.getRepository(Category);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de categorías',
    );
    return;
  }

  const categories: SeedCategory[] = [
    {
      name: 'Pasteles',
      description: 'Pasteles decorados para toda ocasión',
    },
    {
      name: 'Cupcakes',
      description: 'Cupcakes individuales con diferentes decoraciones',
    },
    {
      name: 'Pan Dulce',
      description: 'Pan dulce tradicional mexicano y pan de caja',
    },
    {
      name: 'Galletas',
      description: 'Galletas decoradas y tradicionales',
    },
    {
      name: 'Postres',
      description: 'Postres variados como pays, tartas y flanes',
    },
    {
      name: 'Bocadillos',
      description: 'Bocadillos salados para eventos',
    },
  ];

  let createdCount = 0;

  for (const categoryData of categories) {
    try {
      const existing = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Categoría '${categoryData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      const category = categoryRepository.create({
        name: categoryData.name,
        description: categoryData.description,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await categoryRepository.save(category);
      console.log(`   ✅ Categoría creada: ${categoryData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear categoría '${categoryData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creadas: ${createdCount}\n`);
}
