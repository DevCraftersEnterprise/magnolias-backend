import { Repository } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { Product } from '../../products/entities/product.entity';
import { ProductsService } from '../../products/products.service';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedProducts(
  productsService: ProductsService,
  userRepository: Repository<User>,
  categoryRepository: Repository<Category>,
  productRepository: Repository<Product>,
): Promise<void> {
  console.log('🎂 Iniciando seed de productos...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de productos',
    );
    return;
  }

  const categories = await categoryRepository.find();

  const pasteles = categories.find((cat) => cat.name === 'PASTELES');
  const cupcakes = categories.find((cat) => cat.name === 'CUPCAKES');
  const panDulce = categories.find((cat) => cat.name === 'PAN DULCE');
  const galletas = categories.find((cat) => cat.name === 'GALLETAS');
  const postres = categories.find((cat) => cat.name === 'POSTRES');
  const bocadillos = categories.find((cat) => cat.name === 'BOCADILLOS');

  const products: CreateProductDto[] = [
    // Pasteles
    {
      name: 'Pastel de Tres Leches',
      description:
        'Tradicional pastel mexicano empapado en tres tipos de leche',
      categoryId: pasteles!.id,
    },
    {
      name: 'Pastel Red Velvet',
      description: 'Pastel de terciopelo rojo con frosting de queso crema',
      categoryId: pasteles!.id,
    },
    {
      name: 'Pastel de Chocolate',
      description: 'Delicioso pastel de chocolate con ganache',
      categoryId: pasteles!.id,
    },
    {
      name: 'Pastel de Zanahoria',
      description: 'Pastel húmedo de zanahoria con nueces',
      categoryId: pasteles!.id,
    },
    {
      name: 'Pastel de Fresas con Crema',
      description: 'Pastel suave decorado con fresas frescas',
      categoryId: pasteles!.id,
    },
    {
      name: 'Pastel de Vainilla',
      description: 'Clásico pastel de vainilla con buttercream',
      categoryId: pasteles!.id,
    },
    // Cupcakes
    {
      name: 'Cupcake de Chocolate',
      description: 'Cupcake de chocolate con frosting cremoso',
      categoryId: cupcakes!.id,
    },
    {
      name: 'Cupcake de Vainilla',
      description: 'Cupcake de vainilla con decoración colorida',
      categoryId: cupcakes!.id,
    },
    {
      name: 'Cupcake Red Velvet',
      description: 'Cupcake de terciopelo rojo con queso crema',
      categoryId: cupcakes!.id,
    },
    {
      name: 'Cupcake de Limón',
      description: 'Cupcake cítrico fresco de limón',
      categoryId: cupcakes!.id,
    },
    // Pan Dulce
    {
      name: 'Conchas',
      description: 'Pan dulce tradicional mexicano con costra de azúcar',
      categoryId: panDulce!.id,
    },
    {
      name: 'Orejas',
      description: 'Pan hojaldrado en forma de oreja bañado en azúcar',
      categoryId: panDulce!.id,
    },
    {
      name: 'Pan de Muerto',
      description: 'Pan tradicional del Día de Muertos',
      categoryId: panDulce!.id,
    },
    {
      name: 'Roles de Canela',
      description: 'Rollos suaves con canela y glaseado',
      categoryId: panDulce!.id,
    },
    {
      name: 'Pan Integral',
      description: 'Pan de caja integral saludable',
      categoryId: panDulce!.id,
    },
    // Galletas
    {
      name: 'Galletas Decoradas',
      description: 'Galletas personalizadas con glaseado real',
      categoryId: galletas!.id,
    },
    {
      name: 'Galletas de Chispas de Chocolate',
      description: 'Clásicas galletas con chispas de chocolate',
      categoryId: galletas!.id,
    },
    {
      name: 'Galletas de Avena',
      description: 'Galletas crujientes de avena con pasas',
      categoryId: galletas!.id,
    },
    {
      name: 'Galletas de Mantequilla',
      description: 'Suaves galletas danesas de mantequilla',
      categoryId: galletas!.id,
    },

    // Postres
    {
      name: 'Pay de Queso',
      description: 'Cremoso cheesecake estilo Nueva York',
      categoryId: postres!.id,
    },
    {
      name: 'Pay de Limón',
      description: 'Pay de limón con merengue italiano',
      categoryId: postres!.id,
    },
    {
      name: 'Flan Napolitano',
      description: 'Tradicional flan de huevo con caramelo',
      categoryId: postres!.id,
    },
    {
      name: 'Tiramisú',
      description: 'Clásico postre italiano de café',
      categoryId: postres!.id,
    },

    // Bocadillos
    {
      name: 'Mini Sándwiches',
      description: 'Variedad de sándwiches miniatura para eventos',
      categoryId: bocadillos!.id,
    },
    {
      name: 'Canapés Variados',
      description: 'Selección de canapés gourmet',
      categoryId: bocadillos!.id,
    },
    {
      name: 'Bocadillos Dulces',
      description: 'Mezcla de bocadillos dulces miniatura',
      categoryId: bocadillos!.id,
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

      await productsService.createProduct(productData, adminUser);
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
