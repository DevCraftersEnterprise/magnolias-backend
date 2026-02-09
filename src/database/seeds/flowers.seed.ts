import { DataSource } from 'typeorm';
import { Flower } from '../../flowers/entities/flower.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedFlower {
  name: string;
  description: string;
}

export async function seedFlowers(dataSource: DataSource): Promise<void> {
  console.log('🌸 Iniciando seed de flores...');

  const flowerRepository = dataSource.getRepository(Flower);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de flores',
    );
    return;
  }

  const flowers: SeedFlower[] = [
    { name: 'Rosa', description: 'Rosa clásica decorativa' },
    { name: 'Margarita', description: 'Margarita blanca simple' },
    { name: 'Girasol', description: 'Girasol grande decorativo' },
    { name: 'Hortensia', description: 'Hortensia en racimo' },
    { name: 'Peonía', description: 'Peonía elegante' },
    { name: 'Tulipán', description: 'Tulipán delicado' },
    { name: 'Orquídea', description: 'Orquídea tropical' },
    { name: 'Lila', description: 'Flor de lila aromática' },
    { name: 'Dalia', description: 'Dalia mexicana tradicional' },
    { name: 'Gardenia', description: 'Gardenia perfumada' },
    { name: 'Cala', description: 'Cala elegante minimalista' },
    { name: 'Jazmín', description: 'Jazmín pequeño aromático' },
    { name: 'Azucena', description: 'Azucena blanca' },
    { name: 'Clavel', description: 'Clavel tradicional' },
  ];

  let createdCount = 0;

  for (const flowerData of flowers) {
    try {
      const existing = await flowerRepository.findOne({
        where: { name: flowerData.name },
      });

      if (existing) {
        console.log(`   ⏭️  Flor '${flowerData.name}' ya existe, omitiendo...`);
        continue;
      }

      const flower = flowerRepository.create({
        name: flowerData.name,
        description: flowerData.description,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await flowerRepository.save(flower);
      console.log(`   ✅ Flor creada: ${flowerData.name}`);
      createdCount++;
    } catch (error) {
      console.error(`   ❌ Error al crear flor '${flowerData.name}':`, error);
    }
  }

  console.log(`   📊 Total creadas: ${createdCount}\n`);
}
