import { Repository } from 'typeorm';
import { CategoriesService } from '../../categories/categories.service';
import { CreateCategoryDto } from '../../categories/dto/create-category.dto';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedCategories(categoryService: CategoriesService, userRepository: Repository<User>): Promise<void> {
  console.log('📁 Iniciando seed de categorías...');



  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de categorías',
    );
    return;
  }

  const categories: CreateCategoryDto[] = [
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
      await categoryService.create(categoryData, adminUser)

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
