import { Repository } from 'typeorm';
import { BreadTypesService } from '../../bread-types/bread-types.service';
import { CreateBreadTypeDto } from '../../bread-types/dto/create-bread-type.dto';
import { BreadType } from '../../bread-types/entities/bread-type.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedBreadTypes(
  breadTypesService: BreadTypesService,
  userRepository: Repository<User>,
  breadTypeRepository: Repository<BreadType>,
): Promise<void> {
  console.log('� Iniciando seed de tipos de pan para pastel...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de tipos de pan para pastel',
    );
    return;
  }

  // Catálogo fusionado con el antiguo "sabores" (cliente #2): el negocio
  // entiende "tipo de pan" como el sabor del pan, así que absorbe también
  // los valores que antes vivían en el catálogo de sabores (deduplicados
  // por nombre, ej. "Chocolate" ya no existe por duplicado en dos listas).
  const breadTypes: CreateBreadTypeDto[] = [
    {
      name: 'Vainilla',
      description: 'Pan de vainilla clásico, suave y esponjoso',
    },
    { name: 'Chocolate', description: 'Pan de chocolate intenso' },
    { name: 'Fresa', description: 'Pan con sabor a fresa natural' },
    { name: 'Marmoleado', description: 'Combinación de vainilla y chocolate' },
    { name: 'Red Velvet', description: 'Pan red velvet con toque de cacao' },
    { name: 'Zanahoria', description: 'Pan de zanahoria con especias' },
    { name: 'Limón', description: 'Pan con ralladura de limón fresco' },
    { name: 'Naranja', description: 'Pan con sabor a naranja natural' },
    { name: 'Nuez', description: 'Pan de vainilla con nueces' },
    { name: 'Almendra', description: 'Pan con esencia y hojuelas de almendra' },
    { name: 'Tres Leches', description: 'Mezcla tradicional de tres leches' },
    { name: 'Café', description: 'Café expreso de grano' },
    { name: 'Nutella', description: 'Crema de avellanas con chocolate' },
    { name: 'Cajeta', description: 'Dulce de leche tradicional mexicano' },
    { name: 'Moka', description: 'Combinación de café y chocolate' },
    { name: 'Coco', description: 'Coco natural rallado' },
    { name: 'Plátano', description: 'Plátano maduro natural' },
    { name: 'Matcha', description: 'Té verde matcha japonés' },
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

      await breadTypesService.create(breadTypeData, adminUser);
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
