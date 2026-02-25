import { Repository } from 'typeorm';
import { RegisterUserDto } from '../../users/dto/register-user.dto';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';
import { UsersService } from '../../users/users.service';

export async function seedInitialUsers(usersService: UsersService, repository: Repository<User>): Promise<void> {
  console.log('🌱 Iniciando seed de usuarios iniciales...');

  // Definir los usuarios iniciales
  const initialUsers: RegisterUserDto[] = [
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
      role: UserRoles.ADMIN,
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
      const existingUser = await repository.findOne({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(
          `   ⏭️  Usuario '${userData.username}' ya existe, omitiendo...`,
        );
        skippedCount++;
        continue;
      }

      await usersService.registerUser(userData);

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
