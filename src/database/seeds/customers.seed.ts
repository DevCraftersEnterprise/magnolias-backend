import { DataSource } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

interface SeedCustomer {
  fullName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
}

export async function seedCustomers(dataSource: DataSource): Promise<void> {
  console.log('👤 Iniciando seed de clientes...');

  const customerRepository = dataSource.getRepository(Customer);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de clientes',
    );
    return;
  }

  const customers: SeedCustomer[] = [
    {
      fullName: 'María González',
      phone: '5511112222',
      email: 'maria.gonzalez@example.com',
      address: 'Calle Reforma 123, Col. Centro, CDMX',
    },
    {
      fullName: 'José Ramírez',
      phone: '5522223333',
      alternativePhone: '5533334444',
      email: 'jose.ramirez@example.com',
      address: 'Av. Insurgentes 456, Col. Roma, CDMX',
    },
    {
      fullName: 'Ana María Fernández',
      phone: '5544445555',
      email: 'ana.fernandez@example.com',
      address: 'Calle Polanco 789, Col. Polanco, CDMX',
    },
    {
      fullName: 'Carlos Mendoza',
      phone: '5555556666',
      alternativePhone: '5566667777',
      address: 'Av. Universidad 321, Col. Coyoacán, CDMX',
    },
    {
      fullName: 'Laura Sánchez',
      phone: '5577778888',
      email: 'laura.sanchez@example.com',
      address: 'Calle Madero 654, Col. Centro, CDMX',
    },
    {
      fullName: 'Roberto Torres',
      phone: '5588889999',
      alternativePhone: '5599990000',
      email: 'roberto.torres@example.com',
      address: 'Av. Chapultepec 987, Col. Condesa, CDMX',
    },
    {
      fullName: 'Patricia López',
      phone: '5500001111',
      email: 'patricia.lopez@example.com',
      address: 'Calle Juárez 147, Col. Centro, CDMX',
    },
    {
      fullName: 'Jorge Martínez',
      phone: '5511113333',
      alternativePhone: '5522224444',
      address: 'Av. Revolución 258, Col. San Ángel, CDMX',
    },
    {
      fullName: 'Gabriela Herrera',
      phone: '5533335555',
      email: 'gabriela.herrera@example.com',
      address: 'Calle Amsterdam 369, Col. Hipódromo, CDMX',
    },
    {
      fullName: 'Fernando Ruiz',
      phone: '5544446666',
      email: 'fernando.ruiz@example.com',
      address: 'Av. Patriotismo 741, Col. Mixcoac, CDMX',
    },
    {
      fullName: 'Diana Morales',
      phone: '5566668888',
      alternativePhone: '5577779999',
      email: 'diana.morales@example.com',
      address: 'Calle Orizaba 852, Col. Roma, CDMX',
    },
    {
      fullName: 'Antonio Vargas',
      phone: '5588880000',
      address: 'Av. Cuauhtémoc 963, Col. Narvarte, CDMX',
    },
  ];

  let createdCount = 0;

  for (const customerData of customers) {
    try {
      const existing = await customerRepository.findOne({
        where: { phone: customerData.phone },
      });

      if (existing) {
        console.log(
          `   ⏭️  Cliente '${customerData.fullName}' ya existe, omitiendo...`,
        );
        continue;
      }

      const customer = customerRepository.create({
        fullName: customerData.fullName,
        phone: customerData.phone,
        alternativePhone: customerData.alternativePhone,
        email: customerData.email,
        address: customerData.address,
        isActive: true,
        createdBy: adminUser,
        updatedBy: adminUser,
      });

      await customerRepository.save(customer);
      console.log(`   ✅ Cliente creado: ${customerData.fullName}`);
      createdCount++;
    } catch (error) {
      console.error(
        `   ❌ Error al crear cliente '${customerData.fullName}':`,
        error,
      );
    }
  }

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
