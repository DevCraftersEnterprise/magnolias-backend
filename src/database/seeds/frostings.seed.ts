import { Repository } from 'typeorm';
import { CreateFrostingDto } from '../../frostings/dto/create-frosting.dto';
import { Frosting } from '../../frostings/entities/frosting.entity';
import { FrostingsService } from '../../frostings/frostings.service';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedFrostings(
  frostingsService: FrostingsService,
  userRepository: Repository<User>,
  frostingRepository: Repository<Frosting>,
): Promise<void> {
  console.log('🧁 Iniciando seed de glaseados...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de glaseados',
    );
    return;
  }

  const frostings: CreateFrostingDto[] = [
    { name: 'Buttercream Suizo', description: 'Buttercream suizo merengue' },
    {
      name: 'Buttercream Italiano',
      description: 'Buttercream italiano merengue',
    },
    {
      name: 'Buttercream Americano',
      description: 'Buttercream americano clásico',
    },
    { name: 'Fondant', description: 'Fondant para decoración lisa' },
    { name: 'Ganache', description: 'Ganache de chocolate para cobertura' },
    { name: 'Crema de Queso', description: 'Frosting de queso crema' },
    { name: 'Chantilly', description: 'Crema chantilly estabilizada' },
    { name: 'Glaseado Real', description: 'Glaseado real para galletas' },
    { name: 'Merengue Francés', description: 'Merengue francés tradicional' },
    {
      name: 'Crema de Mantequilla Alemana',
      description: 'Crema alemana con natillas',
    },
    {
      name: 'Glaseado de Chocolate',
      description: 'Glaseado espejo de chocolate',
    },
    { name: 'Betún de Cajeta', description: 'Betún de cajeta mexicana' },
  ];

  let createdCount = 0;

  for (const frostingData of frostings) {
    try {
      const existing = await frostingRepository.findOne({
        where: { name: frostingData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Glaseado '${frostingData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      await frostingsService.create(frostingData, adminUser);
      console.log(`✅ Glaseado creado: ${frostingData.name}`);
      createdCount++;
    } catch (error) {
      console.error(
        `❌ Error al crear glaseado '${frostingData.name}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
