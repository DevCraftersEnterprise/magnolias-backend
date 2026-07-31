import { Repository } from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { BakerArea } from '../../common/enums/baker-area.enum';
import { RegisterUserDto } from '../../users/dto/register-user.dto';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';
import { UsersService } from '../../users/users.service';

export async function seedExtraUsers(
  usersService: UsersService,
  userRepository: Repository<User>,
  branchRepository: Repository<Branch>,
): Promise<void> {
  console.log('👥 Iniciando seed de usuarios adicionales...');

  const branches = await branchRepository.find();

  const extraUsers: RegisterUserDto[] = [
    {
      name: 'Juan Carlos',
      lastname: 'Pérez',
      username: 'juanperez',
      userkey: '789012',
      role: UserRoles.BAKER,
      area: BakerArea.PE,
      branchIds: [branches[0].id, branches[3].id],
      specialty: 'Especialista en pasteles de celebración',
    },
    {
      name: 'Laura',
      lastname: 'Jiménez',
      username: 'laurajimenez',
      userkey: '890123',
      role: UserRoles.BAKER,
      area: BakerArea.TRES_LECHES,
      branchIds: [branches[1].id, branches[3].id],
      specialty: 'Maestra en pasteles de tres leches',
    },
    {
      name: 'Miguel Ángel',
      lastname: 'Torres',
      username: 'migueltorres',
      userkey: '901234',
      role: UserRoles.BAKER,
      area: BakerArea.PA,
      branchIds: [branches[0].id, branches[1].id],
      specialty: 'Experto en pan artesanal',
    },
    {
      name: 'Sofía',
      lastname: 'Ramírez',
      username: 'sofiaramirez',
      userkey: '012345',
      role: UserRoles.BAKER,
      area: BakerArea.CK,
      branchIds: [branches[2].id, branches[3].id],
      specialty: 'Especialista en cupcakes decorados',
    },
    {
      name: 'Gabriela',
      lastname: 'Vargas',
      username: 'gabrielavargas',
      userkey: '112233',
      role: UserRoles.BAKER,
      area: BakerArea.PE,
      branchIds: [branches[0].id, branches[2].id],
      specialty: 'Experta en decoración con fondant',
    },
    {
      name: 'Ricardo',
      lastname: 'Ruiz',
      username: 'ricardoruiz',
      userkey: '223344',
      role: UserRoles.BAKER,
      area: BakerArea.PA,
      branchIds: [branches[1].id, branches[2].id],
      specialty: 'Panadero tradicional mexicano',
    },
    {
      name: 'Patricia',
      lastname: 'Mendoza',
      username: 'patriciamendoza',
      userkey: '334455',
      role: UserRoles.BAKER,
      area: BakerArea.CK,
      branchIds: [...branches.map((b) => b.id)],
      specialty: 'Especialista en decoración con manga',
    },
    // Cliente #13: EMPLOYEE es ahora una cuenta compartida por sucursal (no
    // usuarios individuales) — una sola cuenta por sucursal, nombrada por la
    // sucursal misma. Los empleados individuales se registran aparte en
    // branch-employees.seed.ts (nombre + PIN), no como usuarios de login.
    ...branches.map((branch, index) => ({
      name: 'Sucursal',
      lastname: branch.name,
      username: `sucursal.${branch.name.toLowerCase().replace(/\s+/g, '-')}`,
      userkey: `10000${index + 1}`,
      role: UserRoles.EMPLOYEE,
      branchId: branch.id,
    })),
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

      await usersService.registerUser(userData);

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
