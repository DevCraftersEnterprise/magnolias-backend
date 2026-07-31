# Database Seeds

Este directorio contiene los seeds para poblar la base de datos con datos iniciales de prueba.

## 🔒 Restricción de Entorno

**IMPORTANTE**: Los seeds solo se pueden ejecutar en los siguientes entornos:

- `development`
- `staging`

Si intentas ejecutar los seeds en `production` o cualquier otro entorno, el proceso se detendrá automáticamente.

## 📋 Seeds Disponibles

### 1. Initial Users Seed (`initial-users.seed.ts`)

Crea los usuarios iniciales **requeridos** del sistema:

| Nombre          | Username     | UserKey | Rol      |
| --------------- | ------------ | ------- | -------- |
| Cristian Corona | cristianc    | 112233  | ADMIN    |
| Mónica Chaves   | monipanecito | 224466  | EMPLOYEE |
| Sergio Barreras | sergiobg     | 200999  | SUPER    |

### 2. Branches Seed (`branches.seed.ts`)

Crea **4 sucursales** de Magnolias en diferentes ubicaciones de CDMX:

- Magnolias Centro
- Magnolias Polanco
- Magnolias Coyoacán
- Magnolias Santa Fe

### 3. Extra Users Seed (`extra-users.seed.ts`)

Agrega usuarios adicionales:

- 7 Pasteleros (BAKER, asignados a diferentes sucursales)
- 1 cuenta `EMPLOYEE` compartida por sucursal (cliente #13 — ya no son usuarios individuales, ver seed de empleados abajo)
- 1 Administrador adicional

### 3.1. Branch Employees Seed (`branch-employees.seed.ts`)

Registra empleados individuales (nombre + PIN) dentro de las cuentas `EMPLOYEE` compartidas de cada sucursal, para autoría de pedidos (cliente #13).

### 4. Categories Seed (`categories.seed.ts`)

Crea **6 categorías** de productos:

- Pasteles
- Cupcakes
- Pan Dulce
- Galletas
- Postres
- Bocadillos

### 5. Colors Seed (`colors.seed.ts`)

Agrega **20 colores** para decoración:

- Colores pasteles (Rosa Pastel, Azul Cielo, Lavanda, etc.)
- Colores intensos (Rosa Fuerte, Rojo Intenso, etc.)
- Colores clásicos (Blanco, Negro, Dorado, Plateado)

### 6. Fillings Seed (`fillings.seed.ts`)

Agrega **14 tipos de rellenos**:

- Crema Pastelera
- Ganache de Chocolate
- Dulce de Leche
- Mousse de Chocolate
- Baviera
- Y más...

### 8. Frostings Seed (`frostings.seed.ts`)

Crea **12 tipos de glaseados y coberturas**:

- Buttercream Suizo, Italiano, Americano
- Fondant
- Ganache
- Crema de Queso
- Y más...

### 9. Flowers Seed (`flowers.seed.ts`)

Agrega **14 tipos de flores** para decoración:

- Rosa, Margarita, Girasol
- Peonía, Orquídea, Dalia
- Gardenia, Cala, Jazmín
- Y más...

### 10. Styles Seed (`styles.seed.ts`)

Crea **12 estilos de decoración**:

- Liso, Rústico
- Semi Naked, Naked
- Drip Cake, Ombré
- Geométrico, Acuarela
- Y más...

### 11. Bread Types Seed (`bread-types.seed.ts`)

Agrega **18 tipos de pan** (catálogo fusionado con el antiguo de sabores — cliente #2):

- Blanco, Integral, Centeno
- Brioche, Multigrano
- De Caja Blanco/Integral
- Sin Gluten
- Y más...

### 12. Bakers Seed (`bakers.seed.ts`)

Crea **8 pasteleros** especializados en diferentes áreas:

- Pastelería (PE)
- Tres Leches (3L)
- Panadería (PA)
- Cupcakes (CK)
- Repostería General (BO)

### 13. Customers Seed (`customers.seed.ts`)

Agrega **12 clientes** de ejemplo con datos completos:

- Nombres completos
- Teléfonos (algunos con teléfono alternativo)
- Emails
- Direcciones en CDMX

### 14. Products Seed (`products.seed.ts`)

Crea **27 productos** distribuidos en todas las categorías:

- 6 Pasteles (Tres Leches, Red Velvet, Chocolate, etc.)
- 4 Cupcakes
- 5 Pan Dulce (Conchas, Orejas, Pan de Muerto, etc.)
- 4 Galletas
- 4 Postres (Cheesecake, Flan, Tiramisú, etc.)
- 3 Bocadillos

## 🚀 Cómo Ejecutar los Seeds

### Prerequisitos

1. Asegúrate de tener configuradas las variables de entorno correctamente
2. Verifica que `NODE_ENV` esté configurado como `development` o `staging`
3. La base de datos debe estar creada y las migraciones ejecutadas

### Ejecutar todos los seeds

```bash
npm run seed:run
```

### Orden de Ejecución

Los seeds se ejecutan automáticamente en el siguiente orden para respetar las dependencias:

1. ✅ Usuarios iniciales
2. ✅ Sucursales
3. ✅ Usuarios adicionales
3.1. ✅ Empleados por sucursal (PIN individual)
4. ✅ Categorías
5. ✅ Colores
6. ✅ Rellenos, Glaseados, Flores, Estilos, Tipos de Pan (incluye sabores fusionados)
7. ✅ Pasteleros
8. ✅ Clientes
9. ✅ Productos

## 📊 Resumen de Datos Generados

Al ejecutar todos los seeds, obtendrás:

- **9 usuarios** con diferentes roles
- **4 sucursales** en CDMX
- **6 categorías** de productos
- **20 colores** para decoración
- **14 rellenos**
- **12 glaseados**
- **14 flores**
- **12 estilos**
- **18 tipos de pan** (incluye los antiguos sabores)
- **8 pasteleros** especializados
- **12 clientes**
- **27 productos**

**Total: ¡Más de 160 registros de prueba!** 🎉

## 📝 Características

- ✅ **Idempotentes**: Puedes ejecutarlos múltiples veces sin crear duplicados
- ✅ **Validación de existencia**: Si un registro ya existe, se omite su creación
- ✅ **Contraseñas seguras**: Las userkeys se hashean automáticamente con argon2
- ✅ **Datos realistas**: Información coherente para una pastelería mexicana
- ✅ **Relaciones correctas**: Respeta todas las relaciones entre entidades
- ✅ **Mensajes informativos**: Muestra información detallada durante la ejecución

## ✨ Agregar Nuevos Seeds

Para crear un nuevo seed:

1. Crea un archivo en formato `nombre-descriptivo.seed.ts`
2. Exporta una función que reciba `DataSource` como parámetro
3. Importa y ejecuta la función en `run-seeds.ts` en el orden correcto

Ejemplo:

```typescript
import { DataSource } from 'typeorm';
import { MiEntidad } from '../../mi-modulo/entities/mi-entidad.entity';
import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role';

export async function seedMiEntidad(dataSource: DataSource): Promise<void> {
  console.log('🔧 Iniciando seed de mi entidad...');

  const repository = dataSource.getRepository(MiEntidad);
  const userRepository = dataSource.getRepository(User);

  const adminUser = await userRepository.findOne({
    where: { role: UserRoles.ADMIN },
  });

  if (!adminUser) {
    console.log('   ⚠️  No se encontró usuario administrador');
    return;
  }

  // Tu lógica de seed aquí

  console.log(`   📊 Total creados: ${createdCount}\n`);
}
```
