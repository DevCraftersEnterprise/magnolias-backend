import { Repository } from 'typeorm';
import { CreateFlowerDto } from '../../flowers/dto/create-flower.dto';
import { Flower } from '../../flowers/entities/flower.entity';
import { FlowersService } from '../../flowers/flowers.service';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedFlowers(
  flowersService: FlowersService,
  userRepository: Repository<User>,
  flowerRepository: Repository<Flower>
): Promise<void> {
  console.log('🌸 Iniciando seed de flores...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de flores',
    );
    return;
  }

  const flowers: CreateFlowerDto[] = [
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

      await flowersService.create(flowerData, adminUser);

      console.log(`   ✅ Flor creada: ${flowerData.name}`);
      createdCount++;
    } catch (error) {
      console.error(`   ❌ Error al crear flor '${flowerData.name}':`, error);
    }
  }

  console.log(`   📊 Total creadas: ${createdCount}\n`);
}
