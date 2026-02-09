import { DataSource } from 'typeorm';
import { Flavor } from '../../flavors/entities/flavor.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedFlavor {
  name: string;
  description: string;
}

export async function seedFlavors(dataSource: DataSource): Promise<void> {
  console.log('🍰 Iniciando seed de sabores...');

  const flavorRepository = dataSource.getRepository(Flavor);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de sabores',
    );
    return;
  }

  const flavors: SeedFlavor[] = [
    { name: 'Chocolate', description: 'Chocolate oscuro de calidad premium' },
    { name: 'Vainilla', description: 'Vainilla natural de Madagascar' },
    { name: 'Fresa', description: 'Fresas frescas naturales' },
    { name: 'Tres Leches', description: 'Mezcla tradicional de tres leches' },
    { name: 'Red Velvet', description: 'Terciopelo rojo con toque de cacao' },
    { name: 'Zanahoria', description: 'Zanahoria fresca con especias' },
    { name: 'Limón', description: 'Limón fresco y natural' },
    { name: 'Café', description: 'Café expreso de grano' },
    { name: 'Nutella', description: 'Crema de avellanas con chocolate' },
    { name: 'Cajeta', description: 'Dulce de leche tradicional mexicano' },
    { name: 'Moka', description: 'Combinación de café y chocolate' },
    { name: 'Coco', description: 'Coco natural rallado' },
    { name: 'Naranja', description: 'Naranja fresca natural' },
    { name: 'Plátano', description: 'Plátano maduro natural' },
    { name: 'Matcha', description: 'Té verde matcha japonés' },
  ];

  let createdCount = 0;

  for (const flavorData of flavors) {
    try {
      const existing = await flavorRepository.findOne({
        where: { name: flavorData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Sabor '${flavorData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      const flavor = flavorRepository.create({
        name: flavorData.name,
        description: flavorData.description,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await flavorRepository.save(flavor);
      console.log(`   ✅ Sabor creado: ${flavorData.name}`);
      createdCount++;
    } catch (error) {
      console.error(`   ❌ Error al crear sabor '${flavorData.name}':`, error);
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
