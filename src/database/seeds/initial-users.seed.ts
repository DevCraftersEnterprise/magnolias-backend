import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedUser {
  name: string;
  lastname: string;
  username: string;
  userkey: string;
  role: UserRoles;
}

export async function seedInitialUsers(dataSource: DataSource): Promise<void> {
  const environment = process.env.NODE_ENV;

  // Validar que solo se ejecute en desarrollo o staging
  if (environment !== 'development' && environment !== 'staging') {
    console.warn(
      '⚠️  Seed de usuarios solo puede ejecutarse en desarrollo o staging',
    );
    console.warn(`   Entorno actual: ${environment || 'production'}`);
    return;
  }

  console.log('🌱 Iniciando seed de usuarios iniciales...');

  const userRepository = dataSource.getRepository(User);

  // Definir los usuarios iniciales
  const initialUsers: SeedUser[] = [
    {
      name: 'Cristian',
      lastname: 'Corona',
      username: 'cristianc',
      userkey: '112233',
      role: UserRoles.ADMIN,
    },
    {
      name: 'Mónica',
      lastname: 'Chaves',
      username: 'monipanecito',
      userkey: '224466',
      role: UserRoles.EMPLOYEE,
    },
    {
      name: 'Sergio',
      lastname: 'Barreras',
      username: 'sergiobg',
      userkey: '200999',
      role: UserRoles.SUPER,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const userData of initialUsers) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await userRepository.findOne({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(
          `   ⏭️  Usuario '${userData.username}' ya existe, omitiendo...`,
        );
        skippedCount++;
        continue;
      }

      // Hashear la userkey
      const hashedKey = await argon2.hash(userData.userkey);

      // Crear el usuario
      const user = userRepository.create({
        name: userData.name,
        lastname: userData.lastname,
        username: userData.username,
        userkey: hashedKey,
        role: userData.role,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(
        `   ✅ Usuario creado: ${userData.name} ${userData.lastname} (${userData.username}) - Rol: ${userData.role}`,
      );
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear usuario '${userData.username}':`,
        error,
      );
    }
  }

  console.log('\n📊 Resumen del seed:');
  console.log(`   • Usuarios creados: ${createdCount}`);
  console.log(`   • Usuarios omitidos: ${skippedCount}`);
  console.log('✨ Seed de usuarios completado\n');
}
