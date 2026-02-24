import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Baker } from '../../bakers/entities/baker.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedBakerUser {
  name: string;
  lastname: string;
  username: string;
  userkey: string;
  bakerFullName: string;
}

export async function seedBakerUsers(dataSource: DataSource): Promise<void> {
  console.log('👨‍🍳 Iniciando seed de usuarios panaderos...');

  const userRepository = dataSource.getRepository(User);
  const bakerRepository = dataSource.getRepository(Baker);

  const bakerUsers: SeedBakerUser[] = [
    {
      name: 'Juan Carlos',
      lastname: 'Pérez',
      username: 'juanperez',
      userkey: '789012',
      bakerFullName: 'Juan Carlos Pérez',
    },
    {
      name: 'Laura',
      lastname: 'Jiménez',
      username: 'laurajimenez',
      userkey: '890123',
      bakerFullName: 'Laura Jiménez',
    },
    {
      name: 'Miguel Ángel',
      lastname: 'Torres',
      username: 'migueltorres',
      userkey: '901234',
      bakerFullName: 'Miguel Ángel Torres',
    },
    {
      name: 'Sofía',
      lastname: 'Ramírez',
      username: 'sofiaramirez',
      userkey: '012345',
      bakerFullName: 'Sofía Ramírez',
    },
  ];

  let createdCount = 0;

  for (const userData of bakerUsers) {
    try {
      const existingUser = await userRepository.findOne({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(
          `   ⏭️  Usuario '${userData.username}' ya existe, omitiendo...`,
        );
        continue;
      }

      // Buscar el baker correspondiente
      const baker = await bakerRepository.findOne({
        where: { fullName: userData.bakerFullName },
      });

      if (!baker) {
        console.log(
          `   ⚠️  Panadero '${userData.bakerFullName}' no encontrado para usuario '${userData.username}', omitiendo...`,
        );
        continue;
      }

      // Verificar que el baker no esté ya vinculado a otro usuario
      const existingBakerUser = await userRepository.findOne({
        where: { baker: { id: baker.id } },
      });

      if (existingBakerUser) {
        console.log(
          `   ⚠️  Panadero '${userData.bakerFullName}' ya está vinculado a otro usuario, omitiendo...`,
        );
        continue;
      }

      const hashedKey = await argon2.hash(userData.userkey);

      const user = userRepository.create({
        name: userData.name,
        lastname: userData.lastname,
        username: userData.username,
        userkey: hashedKey,
        role: UserRoles.BAKER,
        baker: baker,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(
        `   ✅ Usuario panadero creado: ${userData.name} ${userData.lastname} (${userData.username}) -> ${userData.bakerFullName}`,
      );
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear usuario panadero '${userData.username}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
