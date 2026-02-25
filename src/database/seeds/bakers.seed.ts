// import { DataSource } from 'typeorm';
// import { BakerArea } from '../../common/enums/baker-area.enum';
// import { User } from '../../users/entities/user.entity';
// import { UserRoles } from '../../users/enums/user-role';

// interface SeedBaker {
//   fullName: string;
//   phone: string;
//   area: BakerArea;
//   specialty: string;
// }

// export async function seedBakers(dataSource: DataSource): Promise<void> {
//   console.log('👨‍🍳 Iniciando seed de pasteleros...');

//   const bakerRepository = dataSource.getRepository(Baker);
//   const userRepository = dataSource.getRepository(User);

//   const adminUser = await userRepository.findOne({
//     where: { role: UserRoles.ADMIN },
//   });

//   if (!adminUser) {
//     console.log(
//       '   ⚠️  No se encontró usuario administrador, omitiendo seed de pasteleros',
//     );
//     return;
//   }

//   const bakers: SeedBaker[] = [
//     {
//       fullName: 'Juan Carlos Pérez',
//       phone: '+52 55 1111 2222',
//       area: BakerArea.PE,
//       specialty: 'Especialista en pasteles de celebración',
//     },
//     {
//       fullName: 'Laura Jiménez',
//       phone: '+52 55 2222 3333',
//       area: BakerArea.TRES_LECHES,
//       specialty: 'Maestra en pasteles de tres leches',
//     },
//     {
//       fullName: 'Miguel Ángel Torres',
//       phone: '+52 55 3333 4444',
//       area: BakerArea.PA,
//       specialty: 'Experto en pan artesanal',
//     },
//     {
//       fullName: 'Sofía Ramírez',
//       phone: '+52 55 4444 5555',
//       area: BakerArea.CK,
//       specialty: 'Especialista en cupcakes decorados',
//     },
//     {
//       fullName: 'Fernando Morales',
//       phone: '+52 55 5555 6666',
//       area: BakerArea.BO,
//       specialty: 'Maestro repostero general',
//     },
//     {
//       fullName: 'Gabriela Vargas',
//       phone: '+52 55 6666 7777',
//       area: BakerArea.PE,
//       specialty: 'Experta en decoración con fondant',
//     },
//     {
//       fullName: 'Ricardo Ruiz',
//       phone: '+52 55 7777 8888',
//       area: BakerArea.PA,
//       specialty: 'Panadero tradicional mexicano',
//     },
//     {
//       fullName: 'Patricia Mendoza',
//       phone: '+52 55 8888 9999',
//       area: BakerArea.CK,
//       specialty: 'Especialista en decoración con manga',
//     },
//   ];

//   let createdCount = 0;

//   for (const bakerData of bakers) {
//     try {
//       const existing = await bakerRepository.findOne({
//         where: { fullName: bakerData.fullName },
//       });

//       if (existing) {
//         console.log(
//           `   ⏭️  Pastelero '${bakerData.fullName}' ya existe, omitiendo...`,
//         );
//         continue;
//       }

//       const baker = bakerRepository.create({
//         fullName: bakerData.fullName,
//         phone: bakerData.phone,
//         area: bakerData.area,
//         specialty: bakerData.specialty,
//         isActive: true,
//         createdBy: adminUser,
//         updatedBy: adminUser,
//       });

//       await bakerRepository.save(baker);
//       console.log(
//         `   ✅ Pastelero creado: ${bakerData.fullName} (${bakerData.area})`,
//       );
//       createdCount++;
//     } catch (error) {
//       console.error(
//         `   ❌ Error al crear pastelero '${bakerData.fullName}':`,
//         error,
//       );
//     }
//   }

//   console.log(`   📊 Total creados: ${createdCount}\n`);
// }
