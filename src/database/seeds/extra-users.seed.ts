import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedExtraUser {
  name: string;
  lastname: string;
  username: string;
  userkey: string;
  role: UserRoles;
  branchName?: string;
}

export async function seedExtraUsers(dataSource: DataSource): Promise<void> {
  console.log('👥 Iniciando seed de usuarios adicionales...');

  const userRepository = dataSource.getRepository(User);
  const branchRepository = dataSource.getRepository(Branch);

  const extraUsers: SeedExtraUser[] = [
    {
      name: 'Ana',
      lastname: 'Martínez',
      username: 'anamartinez',
      userkey: '123456',
      role: UserRoles.EMPLOYEE,
      branchName: 'Magnolias Centro',
    },
    {
      name: 'Luis',
      lastname: 'Hernández',
      username: 'luishernandez',
      userkey: '234567',
      role: UserRoles.EMPLOYEE,
      branchName: 'Magnolias Polanco',
    },
    {
      name: 'Carmen',
      lastname: 'López',
      username: 'carmenlopez',
      userkey: '345678',
      role: UserRoles.EMPLOYEE,
      branchName: 'Magnolias Coyoacán',
    },
    {
      name: 'Pedro',
      lastname: 'García',
      username: 'pedrogarcia',
      userkey: '456789',
      role: UserRoles.ASSISTANT,
      branchName: 'Magnolias Centro',
    },
    {
      name: 'María',
      lastname: 'Rodríguez',
      username: 'mariarodriguez',
      userkey: '567890',
      role: UserRoles.ASSISTANT,
      branchName: 'Magnolias Polanco',
    },
    {
      name: 'Roberto',
      lastname: 'Sánchez',
      username: 'robertosanchez',
      userkey: '678901',
      role: UserRoles.ADMIN,
    },
  ];

  let createdCount = 0;

  for (const userData of extraUsers) {
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

      let branch: Branch | undefined = undefined;
      if (userData.branchName) {
        branch =
          (await branchRepository.findOne({
            where: { name: userData.branchName },
          })) ?? undefined;
      }

      const hashedKey = await argon2.hash(userData.userkey);

      const user = userRepository.create({
        name: userData.name,
        lastname: userData.lastname,
        username: userData.username,
        userkey: hashedKey,
        role: userData.role,
        branch: branch,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(
        `   ✅ Usuario creado: ${userData.name} ${userData.lastname} (${userData.username}) - ${userData.role}`,
      );
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear usuario '${userData.username}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
