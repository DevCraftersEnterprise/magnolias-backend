import { DataSource } from 'typeorm';
import { Color } from '../../colors/entities/color.entity';

interface SeedColor {
  name: string;
  value: string;
}

export async function seedColors(dataSource: DataSource): Promise<void> {
  console.log('🎨 Iniciando seed de colores...');

  const colorRepository = dataSource.getRepository(Color);

  const colors: SeedColor[] = [
    { name: 'Rosa Pastel', value: '#FFB6C1' },
    { name: 'Azul Cielo', value: '#87CEEB' },
    { name: 'Lavanda', value: '#E6E6FA' },
    { name: 'Menta', value: '#98FF98' },
    { name: 'Durazno', value: '#FFDAB9' },
    { name: 'Lila', value: '#DDA0DD' },
    { name: 'Amarillo Suave', value: '#FFFACD' },
    { name: 'Rosa Fuerte', value: '#FF1493' },
    { name: 'Azul Royal', value: '#4169E1' },
    { name: 'Verde Esmeralda', value: '#50C878' },
    { name: 'Rojo Intenso', value: '#DC143C' },
    { name: 'Morado', value: '#9370DB' },
    { name: 'Naranja', value: '#FF8C00' },
    { name: 'Turquesa', value: '#40E0D0' },
    { name: 'Coral', value: '#FF7F50' },
    { name: 'Dorado', value: '#FFD700' },
    { name: 'Plateado', value: '#C0C0C0' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Negro', value: '#000000' },
    { name: 'Café', value: '#8B4513' },
  ];

  let createdCount = 0;

  for (const colorData of colors) {
    try {
      const existing = await colorRepository.findOne({
        where: { value: colorData.value },
      });

      if (existing) {
        console.log(`   ⏭️  Color '${colorData.name}' ya existe, omitiendo...`);
        continue;
      }

      const color = colorRepository.create({
        name: colorData.name,
        value: colorData.value,
      });

      await colorRepository.save(color);
      console.log(`   ✅ Color creado: ${colorData.name} (${colorData.value})`);
      createdCount++;
    } catch (error) {
      console.error(`   ❌ Error al crear color '${colorData.name}':`, error);
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
