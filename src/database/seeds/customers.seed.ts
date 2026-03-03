import { Repository } from 'typeorm';
import { CustomersService } from '../../customers/customers.service';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedCustomers(
  customersService: CustomersService,
  userRepository: Repository<User>,
  customerRepository: Repository<Customer>,
): Promise<void> {
  console.log('👤 Iniciando seed de clientes...');

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log(
      '   ⚠️  No se encontró usuario administrador, omitiendo seed de clientes',
    );
    return;
  }

  const customers: CreateCustomerDto[] = [
    {
      fullName: 'María González',
      phone: '5511112222',
      email: 'maria.gonzalez@example.com',
      address: {
        street: 'Calle Reforma',
        number: '123',
        neighborhood: 'Col. Centro',
        city: 'CDMX',
      },
    },
    {
      fullName: 'José Ramírez',
      phone: '5522223333',
      alternativePhone: '5533334444',
      email: 'jose.ramirez@example.com',
      address: {
        street: 'Av. Insurgentes',
        number: '456',
        neighborhood: 'Col. Roma',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Ana María Fernández',
      phone: '5544445555',
      email: 'ana.fernandez@example.com',
      address: {
        street: 'Calle Polanco',
        number: '789',
        neighborhood: 'Col. Polanco',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Carlos Mendoza',
      phone: '5555556666',
      alternativePhone: '5566667777',
      address: {
        street: 'Av. Universidad',
        number: '321',
        neighborhood: 'Col. Coyoacán',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Laura Sánchez',
      phone: '5577778888',
      email: 'laura.sanchez@example.com',
      address: {
        street: 'Calle Madero',
        number: '654',
        neighborhood: 'Col. Centro',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Roberto Torres',
      phone: '5588889999',
      alternativePhone: '5599990000',
      email: 'roberto.torres@example.com',
      address: {
        street: 'Av. Chapultepec',
        number: '987',
        neighborhood: 'Col. Condesa',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Patricia López',
      phone: '5500001111',
      email: 'patricia.lopez@example.com',
      address: {
        street: 'Calle Juárez',
        number: '147',
        neighborhood: 'Col. Centro',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Jorge Martínez',
      phone: '5511113333',
      alternativePhone: '5522224444',
      address: {
        street: 'Av. Revolución',
        number: '258',
        neighborhood: 'Col. San Ángel',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Gabriela Herrera',
      phone: '5533335555',
      email: 'gabriela.herrera@example.com',
      address: {
        street: 'Calle Amsterdam',
        number: '369',
        neighborhood: 'Col. Hipódromo',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Fernando Ruiz',
      phone: '5544446666',
      email: 'fernando.ruiz@example.com',
      address: {
        street: 'Av. Patriotismo',
        number: '741',
        neighborhood: 'Col. Mixcoac',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Diana Morales',
      phone: '5566668888',
      alternativePhone: '5577779999',
      email: 'diana.morales@example.com',
      address: {
        street: 'Calle Orizaba',
        number: '852',
        neighborhood: 'Col. Roma',
        city: 'CDMX',
      },
    },
    {
      fullName: 'Antonio Vargas',
      phone: '5588880000',
      address: {
        street: 'Av. Cuauhtémoc',
        number: '963',
        neighborhood: 'Col. Narvarte',
        city: 'CDMX',
      },
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

      await customersService.createCustomer(customerData, adminUser);

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
