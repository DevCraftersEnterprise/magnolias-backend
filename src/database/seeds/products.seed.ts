import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedProduct {
  name: string;
  description: string;
  categoryName: string;
}

export async function seedProducts(dataSource: DataSource): Promise<void> {
  console.log('🎂 Iniciando seed de productos...');

  const productRepository = dataSource.getRepository(Product);
  const categoryRepository = dataSource.getRepository(Category);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de productos',
    );
    return;
  }

  const products: SeedProduct[] = [
    // Pasteles
    {
      name: 'Pastel de Tres Leches',
      description:
        'Tradicional pastel mexicano empapado en tres tipos de leche',
      categoryName: 'Pasteles',
    },
    {
      name: 'Pastel Red Velvet',
      description: 'Pastel de terciopelo rojo con frosting de queso crema',
      categoryName: 'Pasteles',
    },
    {
      name: 'Pastel de Chocolate',
      description: 'Delicioso pastel de chocolate con ganache',
      categoryName: 'Pasteles',
    },
    {
      name: 'Pastel de Zanahoria',
      description: 'Pastel húmedo de zanahoria con nueces',
      categoryName: 'Pasteles',
    },
    {
      name: 'Pastel de Fresas con Crema',
      description: 'Pastel suave decorado con fresas frescas',
      categoryName: 'Pasteles',
    },
    {
      name: 'Pastel de Vainilla',
      description: 'Clásico pastel de vainilla con buttercream',
      categoryName: 'Pasteles',
    },

    // Cupcakes
    {
      name: 'Cupcake de Chocolate',
      description: 'Cupcake de chocolate con frosting cremoso',
      categoryName: 'Cupcakes',
    },
    {
      name: 'Cupcake de Vainilla',
      description: 'Cupcake de vainilla con decoración colorida',
      categoryName: 'Cupcakes',
    },
    {
      name: 'Cupcake Red Velvet',
      description: 'Cupcake de terciopelo rojo con queso crema',
      categoryName: 'Cupcakes',
    },
    {
      name: 'Cupcake de Limón',
      description: 'Cupcake cítrico fresco de limón',
      categoryName: 'Cupcakes',
    },

    // Pan Dulce
    {
      name: 'Conchas',
      description: 'Pan dulce tradicional mexicano con costra de azúcar',
      categoryName: 'Pan Dulce',
    },
    {
      name: 'Orejas',
      description: 'Pan hojaldrado en forma de oreja bañado en azúcar',
      categoryName: 'Pan Dulce',
    },
    {
      name: 'Pan de Muerto',
      description: 'Pan tradicional del Día de Muertos',
      categoryName: 'Pan Dulce',
    },
    {
      name: 'Roles de Canela',
      description: 'Rollos suaves con canela y glaseado',
      categoryName: 'Pan Dulce',
    },
    {
      name: 'Pan Integral',
      description: 'Pan de caja integral saludable',
      categoryName: 'Pan Dulce',
    },

    // Galletas
    {
      name: 'Galletas Decoradas',
      description: 'Galletas personalizadas con glaseado real',
      categoryName: 'Galletas',
    },
    {
      name: 'Galletas de Chispas de Chocolate',
      description: 'Clásicas galletas con chispas de chocolate',
      categoryName: 'Galletas',
    },
    {
      name: 'Galletas de Avena',
      description: 'Galletas crujientes de avena con pasas',
      categoryName: 'Galletas',
    },
    {
      name: 'Galletas de Mantequilla',
      description: 'Suaves galletas danesas de mantequilla',
      categoryName: 'Galletas',
    },

    // Postres
    {
      name: 'Pay de Queso',
      description: 'Cremoso cheesecake estilo Nueva York',
      categoryName: 'Postres',
    },
    {
      name: 'Pay de Limón',
      description: 'Pay de limón con merengue italiano',
      categoryName: 'Postres',
    },
    {
      name: 'Flan Napolitano',
      description: 'Tradicional flan de huevo con caramelo',
      categoryName: 'Postres',
    },
    {
      name: 'Tiramisú',
      description: 'Clásico postre italiano de café',
      categoryName: 'Postres',
    },

    // Bocadillos
    {
      name: 'Mini Sándwiches',
      description: 'Variedad de sándwiches miniatura para eventos',
      categoryName: 'Bocadillos',
    },
    {
      name: 'Canapés Variados',
      description: 'Selección de canapés gourmet',
      categoryName: 'Bocadillos',
    },
    {
      name: 'Bocadillos Dulces',
      description: 'Mezcla de bocadillos dulces miniatura',
      categoryName: 'Bocadillos',
    },
  ];

  let createdCount = 0;

  for (const productData of products) {
    try {
      const existing = await productRepository.findOne({
        where: { name: productData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Producto '${productData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      const category = await categoryRepository.findOne({
        where: { name: productData.categoryName },
      });

      if (!category) {
        console.log(
          `   ⚠️  Categoría '${productData.categoryName}' no encontrada para producto '${productData.name}'`,
        );
        continue;
      }

      const product = productRepository.create({
        name: productData.name,
        description: productData.description,
        category: category,
        isActive: true,
        isFavorite: false,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await productRepository.save(product);
      console.log(`   ✅ Producto creado: ${productData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear producto '${productData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
