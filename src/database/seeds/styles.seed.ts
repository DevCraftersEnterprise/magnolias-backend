import { Repository } from 'typeorm';
import { CreateStyleDto } from '../../styles/dto/create-style.dto';
import { Style } from '../../styles/entities/style.entity';
import { StylesService } from '../../styles/styles.service';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedStyles(
  stylesService: StylesService,
  userRepository: Repository<User>,
  styleRepository: Repository<Style>,
): Promise<void> {
  console.log('✨ Iniciando seed de estilos...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de estilos',
    );
    return;
  }

  const styles: CreateStyleDto[] = [
    { name: 'Liso', description: 'Acabado completamente liso y uniforme' },
    { name: 'Rústico', description: 'Acabado rústico con texturas naturales' },
    { name: 'Semi Naked', description: 'Cobertura ligera semi cubierta' },
    { name: 'Naked', description: 'Sin cobertura externa, capas visibles' },
    { name: 'Texturizado', description: 'Con texturas decorativas' },
    { name: 'Ombré', description: 'Degradado de colores' },
    { name: 'Drip Cake', description: 'Con goteo de chocolate o ganache' },
    { name: 'Espátula', description: 'Acabado con marca de espátula' },
    { name: 'Piping', description: 'Decorado con manga pastelera' },
    { name: 'Fondant Liso', description: 'Cubierto con fondant pulido' },
    { name: 'Geométrico', description: 'Diseños geométricos modernos' },
    { name: 'Acuarela', description: 'Efecto acuarela pintado' },
  ];

  let createdCount = 0;

  for (const styleData of styles) {
    try {
      const existing = await styleRepository.findOne({
        where: { name: styleData.name },
      });

      if (existing) {
        console.log(
          `   ⏭️  Estilo '${styleData.name}' ya existe, omitiendo...`,
        );
        continue;
      }

      await stylesService.create(styleData, adminUser);

      console.log(`   ✅ Estilo creado: ${styleData.name}`);
      createdCount++;
    } catch (error) {
      console.error(`   ❌ Error al crear estilo '${styleData.name}':`, error);
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
