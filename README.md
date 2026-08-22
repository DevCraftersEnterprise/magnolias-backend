<p align="center">
  <img src="assets/magnolias_monograma.svg" width="800" alt="Magnolias Logo"/>
</p>

<h1 align="center">Magnolias Backend</h1>

<p align="center">
  Una aplicación backend robusta construida con <a href="https://github.com/nestjs/nest" target="_blank">NestJS</a>, que incluye autenticación JWT, control de acceso basado en roles e integración con base de datos PostgreSQL.
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://typeorm.io/" target="_blank"><img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" /></a>
</p>

---

## 📋 Descripción

Magnolias Backend es la API que sostiene el panel de administración y la tienda pública de Pastelería Magnolias. Gestiona pedidos, productos, clientes, sucursales, usuarios y catálogos, con arquitectura Controller → Service → UseCase (Clean/Use-Case) sobre NestJS 11, TypeORM 0.3 y PostgreSQL. Se despliega en Render.com (ambientes `dev`/`staging`/`prod`, cada uno con su propia base de datos).

### ✨ Características Principales

- 🔐 Autenticación JWT (access/refresh) y sesiones cortas con PIN individual por empleado de sucursal
- 👥 Control de acceso basado en roles (`SUPER`, `ADMIN`, `EMPLOYEE`, `BAKER`)
- 🗄️ TypeORM + PostgreSQL, con migraciones manuales (`synchronize: false`)
- 🔒 Cifrado AES-256-GCM para datos sensibles (teléfonos, cuenta de transferencia) + índice HMAC determinístico para búsqueda/unicidad
- 🍰 Módulo de pedidos con pisos de pastel independientes, asignación de repostero por línea de producto, estado de producción derivado automáticamente, descuentos por producto con autorización, e imágenes de referencia
- 🛡️ Rate limiting (throttling) por endpoint, incluyendo intentos de PIN
- 📦 Arquitectura modular y escalable (un módulo por dominio, casos de uso independientes y testeados)
- 🧪 Cobertura de pruebas unitarias con Jest, gate de calidad con SonarQube Cloud en cada PR
- 🚀 CI/CD: push a `dev`/`staging`/`prod` dispara build + migraciones en Render

## 📑 Tabla de Contenidos

- [Configuración del Proyecto](#configuración-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Comandos Clave](#comandos-clave)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Flujo de Trabajo Git y Convenciones](#flujo-de-trabajo-git-y-convenciones)
- [Despliegue](#despliegue)

## 🚀 Configuración del Proyecto

### Instalación

```bash
npm install
```

Copia el archivo `.env.template` para crear tu archivo `.env`:

```bash
cp .env.template .env
```

Completa las variables de entorno requeridas (consulta la sección [Variables de Entorno](#variables-de-entorno)).

## 🔧 Variables de Entorno

Copia `.env.template` a `.env` y completa los valores (ver también la sección [Configuración del Proyecto](#configuración-del-proyecto)):

```env
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu-clave-secreta-aqui
JWT_EXPIRES_IN=8h
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
DISCOUNT_AUTH_TOKEN_EXPIRY=10m      # Token corto emitido al autorizar un descuento por producto
EMPLOYEE_ACTION_TOKEN_EXPIRY=5m     # Token corto emitido al verificar el PIN de un empleado de sucursal

# BASE DE DATOS
DB_HOST=tu-host-de-base-de-datos
DB_PORT=5432
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=nombre-de-tu-base-de-datos

# CLOUDINARY (fotos de producto e imágenes de referencia de pedidos)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# RATE LIMITING
THROTTLE_TTL=60
THROTTLE_LIMIT=10
THROTTLE_LOGIN_LIMIT=5
THROTTLE_PIN_LIMIT=5                # Intentos de PIN de empleado antes de bloquear temporalmente

# ENCRYPTION — cifrado reversible (AES-256-GCM) de phone/alternativePhone/transferAccount
ENCRYPTION_KEY=tu-clave-generada-aqui

# PHONE HASH — hash determinístico (HMAC-SHA256) para búsqueda/unicidad exacta de teléfono,
# no reversible, distinto de ENCRYPTION_KEY
PHONE_HASH_SECRET=tu-secreto-generado-aqui

# Orígenes permitidos para CORS (separados por coma)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

`ENCRYPTION_KEY` y `PHONE_HASH_SECRET` se generan con `npm run encryption:generate-key` (32 bytes aleatorios en hex). Cada ambiente (`dev`/`staging`/`prod`) tiene su propio valor — nunca reutilices el mismo secreto entre ambientes ni lo subas al repositorio.

## ⚡ Comandos Clave

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run start:dev

# Iniciar en modo debug
npm run start:debug

# Iniciar en modo producción
npm run start:prod
```

### Generación de Código

```bash
# Generar un nuevo módulo
nest g module <nombre-modulo>

# Generar un nuevo controlador
nest g controller <nombre-controlador>

# Generar un nuevo servicio
nest g service <nombre-servicio>

# Generar un recurso completo (CRUD)
nest g resource <nombre-recurso>

# Generar un guard
nest g guard <nombre-guard>

# Generar un decorador
nest g decorator <nombre-decorador>
```

### Migraciones de Base de Datos

```bash
# Generar una nueva migración basada en cambios de entidad
npm run migration:generate src/database/migrations/<NombreMigracion>

# Crear un archivo de migración vacío
npm run migration:create src/database/migrations/<NombreMigracion>

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert
```

> ⚠️ En este proyecto, la mayoría de las migraciones se escriben a mano (SQL puro en `up`/`down`) en lugar de generarse con `migration:generate`: el tipo `money` de Postgres introduce drift cosmético que ese comando arrastra junto con el cambio real que se quiere aplicar. Revisa migraciones recientes en `src/database/migrations/` como referencia de estilo antes de escribir una nueva.

### Scripts de Mantenimiento

Scripts independientes (no forman parte del arranque normal de la app) para tareas puntuales sobre la base de datos:

```bash
# Generar un secreto aleatorio de 32 bytes (sirve tanto para ENCRYPTION_KEY como para PHONE_HASH_SECRET)
npm run encryption:generate-key

# Rotar ENCRYPTION_KEY: re-cifra phone/alternativePhone/transferAccount con una clave nueva
# Requiere OLD_ENCRYPTION_KEY y NEW_ENCRYPTION_KEY en el entorno
npm run encryption:rotate-key

# Poblar phoneHash/phoneLast4 en clientes existentes tras correr la migración
# AddCustomerPhoneIndexFields — correr una vez por ambiente, después de esa migración
npm run customers:backfill-phone-index

# Cargar datos semilla (catálogos base, etc.)
npm run seed:run
```

### Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas unitarias en modo watch
npm run test:watch

# Ejecutar pruebas end-to-end
npm run test:e2e

# Generar reporte de cobertura de pruebas
npm run test:cov
```

### Calidad de Código

```bash
# Formatear código con Prettier
npm run format

# Analizar código con ESLint
npm run lint

# Compilar el proyecto
npm run build
```

## 📁 Estructura del Proyecto

Cada módulo de dominio sigue el mismo patrón: `*.controller.ts` (rutas, delgado) → `*.service.ts` (delega) → `usecases/*.usecase.ts` (una clase por operación, con su `.spec.ts`), más `dto/`, `entities/` y a veces `enums/`/`utils/`/`responses/` propios.

```
src/
├── app.module.ts               # Módulo raíz de la aplicación
├── main.ts                     # Punto de entrada de la aplicación
├── addresses/                  # Direcciones de clientes (calle, colonia, referencias)
├── auth/                       # Login, refresh token, PIN de empleado, autorización de descuento
│   ├── decorators/             # Auth, CurrentUser, RoleProtected, etc.
│   ├── guards/                 # Guards (JWT, roles, throttling)
│   └── strategies/             # Estrategias de Passport
├── branch-employees/           # Empleados de sucursal (nombre/apellido + PIN, sin login propio)
├── branches/                   # Sucursales (punto de venta/producción, teléfonos)
├── bread-types/                # Catálogo: tipo de pan (incluye el antiguo catálogo "Sabor", fusionado)
├── categories/                 # Categorías de producto
├── colors/                     # Catálogo de colores (nombre + hex)
├── common/                     # Código compartido entre módulos
│   ├── decorators/             # Decoradores comunes (archivos, etc.)
│   ├── dto/                    # DTOs comunes (paginación)
│   ├── transformers/           # EncryptedTransformer (cifrado transparente de columnas TypeORM)
│   ├── usecases/               # Base genérica para catálogos simples (BaseCatalogEntity)
│   └── utils/                  # encryption.util, phone-hash.util, etc.
├── config/                     # Configuración de servicios de terceros (Cloudinary, etc.)
├── custom-jwt/                 # Configuración personalizada de JWT
├── custom-passport/            # Configuración personalizada de Passport
├── custom-throttler/           # Configuración personalizada de Throttler (incluye guard de PIN)
├── customers/                  # Clientes (teléfono cifrado + hash/last4 para búsqueda), direcciones
├── database/                   # Configuración de base de datos
│   ├── migrations/             # Migraciones de TypeORM (mayormente SQL escrito a mano)
│   ├── seeds/                  # Datos semilla
│   ├── data-source.ts          # Fuente de datos principal
│   └── database.module.ts      # Módulo de base de datos
├── fillings/                   # Catálogo: rellenos
├── flowers/                    # Catálogo: flores (pedidos con "incluye flores")
├── formats/                    # Generación de reportes/PDF por tipo de pedido
├── frostings/                  # Catálogo: cubiertas
├── orders/                     # Pedidos: líneas de producto, pisos, asignación por línea,
│   │                           # estado de producción, descuentos, imágenes de referencia, pagos
│   └── usecases/
│       ├── order/                        # Casos de uso a nivel pedido (crear, editar, stats, etc.)
│       └── order-detail-assignment/      # Asignación de repostero y avance de producción por línea
├── printer/                    # Utilidades de impresión de reportes
├── products/                   # Productos (categoría, fotos, favorito, visibilidad pública)
├── scripts/                    # Scripts de mantenimiento de uso único (ver comandos arriba)
├── styles/                     # Catálogo: forma
└── users/                      # Usuarios del sistema (login, roles, sucursales)
```

## 🗄️ Migraciones de Base de Datos

Este proyecto utiliza migraciones de TypeORM para gestionar cambios en el esquema de la base de datos.

### Crear una Migración

1. **Modificar tus entidades** - Realiza cambios en tus archivos de entidades
2. **Generar migración** - Ejecuta el generador de migraciones:
   ```bash
   npm run migration:generate src/database/migrations/NombreDescriptivo
   ```
3. **Revisar la migración** - Verifica el archivo de migración generado
4. **Ejecutar la migración** - Aplica la migración a la base de datos:
   ```bash
   npm run migration:run
   ```

### Mejores Prácticas

- Siempre usa nombres descriptivos para las migraciones (ej: `Crear-tabla-usuarios`, `Agregar-email-a-usuarios`)
- Revisa las migraciones generadas antes de ejecutarlas
- Prueba las migraciones en desarrollo antes de aplicarlas en producción
- Nunca modifiques migraciones que ya se han ejecutado en producción
- Mantén las migraciones pequeñas y enfocadas en un solo cambio

## 🔀 Flujo de Trabajo Git y Convenciones

### Convención de Mensajes de Commit

Seguimos la especificación de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Esto asegura un historial de commits consistente y habilita versionado automático y changelogs.

**Format**:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Tipos**:

- `feat`: Una nueva funcionalidad
- `fix`: Corrección de un error
- `docs`: Cambios en la documentación
- `style`: Cambios de estilo de código (formato, espacios, etc.)
- `refactor`: Refactorización de código (sin cambios funcionales)
- `perf`: Mejoras de rendimiento
- `test`: Agregar o actualizar pruebas
- `chore`: Cambios en el proceso de build, dependencias o herramientas
- `ci`: Cambios en integración continua
- `build`: Cambios en el sistema de build

**Alcances** (ejemplos):

- `auth`: Módulo de autenticación
- `users`: Módulo de usuarios
- `database`: Configuración de base de datos
- `api`: Endpoints de la API
- `config`: Archivos de configuración

**Ejemplos**:

```bash
feat(auth): agregar funcionalidad de refresh token JWT
fix(users): resolver problema con validación de registro de usuario
docs(readme): actualizar instrucciones de instalación
refactor(auth): simplificar lógica de generación de tokens
test(users): agregar pruebas unitarias para servicio de usuarios
chore(deps): actualizar dependencias a las últimas versiones
```

**Reglas**:

1. Usa tiempo presente ("agregar función" no "agregada función")
2. Usa minúsculas para tipo y alcance
3. Mantén el resumen bajo 72 caracteres
4. Agrega un cuerpo si necesitas explicar el "qué" y "por qué"
5. Referencia issues y pull requests en el pie de página (ej: `Closes #123`)

### Convención de Nombrado de Ramas

Usa nombres de rama descriptivos en kebab-case que indiquen claramente el propósito:

**Format**: `<type>/<short-description>`

**Tipos**:

- `feature/` - Nuevas funcionalidades
- `bugfix/` - Corrección de errores
- `hotfix/` - Correcciones críticas para producción
- `refactor/` - Refactorización de código
- `docs/` - Actualizaciones de documentación
- `test/` - Adición o actualización de pruebas
- `chore/` - Tareas de mantenimiento

**Ejemplos**:

```bash
feature/autenticacion-usuarios
feature/agregar-control-acceso-basado-roles
bugfix/corregir-error-validacion-login
hotfix/parche-seguridad-critico
refactor/optimizar-consultas-base-datos
docs/actualizar-documentacion-api
test/agregar-pruebas-servicio-usuarios
chore/actualizar-dependencias
```

**Reglas**:

1. Usa letras minúsculas
2. Usa guiones para separar palabras
3. Sé descriptivo pero conciso
4. Evita usar solo números de issue (agrega contexto)
5. Mantén los nombres de rama bajo 50 caracteres cuando sea posible

### Flujo de Trabajo Git

#### 1. Iniciar Nuevo Trabajo

```bash
# Actualizar tu rama main local
git checkout main
git pull origin main

# Crear una nueva rama
git checkout -b feature/nombre-de-tu-funcionalidad
```

#### 2. Realizar Cambios

```bash
# Preparar tus cambios
git add .

# Hacer commit con mensaje convencional
git commit -m "feat(users): agregar endpoint de perfil de usuario"

# Subir a remoto
git push origin feature/nombre-de-tu-funcionalidad
```

#### 3. Mantener tu Rama Actualizada

```bash
# Obtener últimos cambios de main
git checkout main
git pull origin main

# Volver a tu rama y hacer rebase
git checkout feature/nombre-de-tu-funcionalidad
git rebase main

# Resolver conflictos si los hay, luego continuar
git rebase --continue

# Force push si hiciste rebase (solo en tus propias ramas)
git push origin feature/nombre-de-tu-funcionalidad --force-with-lease
```

#### 4. Crear un Pull Request

1. Sube tu rama al repositorio remoto
2. Ve a tu repositorio en GitHub/GitLab/Bitbucket
3. Haz clic en "New Pull Request" o "Create Merge Request"
4. Selecciona tu rama para fusionar en `main`
5. Completa la plantilla de PR:
   - **Título**: Usa formato de commit convencional
   - **Descripción**: Explica qué y por qué
   - **Capturas**: Agrega si es relevante
   - **Issues Relacionados**: Vincula issues relacionados
6. Solicita revisores
7. Asegúrate de que las comprobaciones de CI/CD pasen

#### 5. Proceso de Revisión de Código

**Como Autor**:

- Responde a todos los comentarios
- Realiza los cambios solicitados en nuevos commits
- Sube las actualizaciones a la misma rama
- Solicita revisión nuevamente después de atender el feedback

**Como Revisor**:

- Revisa el código en cuanto a lógica, estilo y mejores prácticas
- Prueba los cambios localmente si es necesario
- Deja comentarios constructivos
- Aprueba cuando estés satisfecho

#### 6. Fusionar Pull Requests

**Antes de Fusionar**:

- ✅ Todas las comprobaciones de CI/CD pasan
- ✅ Al menos una aprobación de un miembro del equipo
- ✅ Sin conflictos de fusión
- ✅ La rama está actualizada con main

**Estrategia de Fusión**:

Usamos **Squash and Merge** para un historial limpio:

```bash
# GitHub hará esto automáticamente, pero manualmente:
git checkout main
git merge --squash feature/nombre-de-tu-funcionalidad
git commit -m "feat(users): agregar endpoint de perfil de usuario"
git push origin main
```

**Después de Fusionar**:

```bash
# Eliminar la rama remota (GitHub lo hace automáticamente)
git push origin --delete feature/nombre-de-tu-funcionalidad

# Eliminar tu rama local
git checkout main
git branch -d feature/nombre-de-tu-funcionalidad

# Obtener el último main
git pull origin main
```

#### 7. Manejo de Hotfixes

Para correcciones críticas en producción:

```bash
# Crear rama hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-bug-critico

# Hacer tu corrección y commit
git commit -m "fix(auth): resolver vulnerabilidad crítica de seguridad"

# Subir y crear PR inmediatamente
git push origin hotfix/descripcion-bug-critico

# Después de la aprobación, fusionar y desplegar
# Etiquetar el release
git tag -a v1.0.1 -m "Hotfix: parche crítico de seguridad"
git push origin v1.0.1
```

### Mejores Prácticas de Git

1. **Hacer Commits Frecuentes**: Realiza commits pequeños y atómicos
2. **Escribir Mensajes Claros**: Sigue commits convencionales
3. **Pull Antes de Push**: Siempre obtén los últimos cambios antes de subir
4. **Revisar tus Cambios**: Usa `git diff` antes de hacer commit
5. **No Subas Secretos**: Nunca hagas commit de archivos `.env` o claves API
6. **Usar .gitignore**: Mantén tu repositorio limpio
7. **Probar Antes de Subir**: Ejecuta las pruebas localmente antes de hacer push
8. **Mantén Ramas de Corta Duración**: Fusiona en pocos días
9. **Comunicar**: Discute cambios importantes con el equipo
10. **Usar Ramas Protegidas**: Protege `main` de pushes directos

---

## 🚀 Despliegue

El backend se despliega en **[Render.com](https://render.com)**, con un servicio independiente por ambiente:

| Rama    | Ambiente  | Base de datos |
|---------|-----------|----------------|
| `dev`   | Desarrollo | propia (Neon Postgres) |
| `staging` | Staging  | propia |
| `prod`  | Producción | propia |

- Cada push a `dev`/`staging`/`prod` dispara un build en Render (Build Command configurado en el dashboard de Render, no hay `render.yaml` en el repo).
- `npm run deploy:prod` (`build:prod` + `migration:run`) es lo que Render ejecuta para arrancar: **las migraciones pendientes se aplican automáticamente en cada deploy**. Por eso toda migración debe probarse primero en `dev`, y cualquier script de mantenimiento que necesite correr (ver [Scripts de Mantenimiento](#scripts-de-mantenimiento)) se ejecuta manualmente después, ambiente por ambiente.
- Reglas de rama estrictas en los tres ambientes (`dev`/`staging`/`prod`): sin bypass, ni para administradores. La promoción siempre sigue el orden `dev` → `staging` → `prod`, nunca directo a `prod`.
- Variables de entorno (incluyendo `ENCRYPTION_KEY`/`PHONE_HASH_SECRET`) se configuran por separado en cada servicio de Render — nunca se comparten entre ambientes.

## 📚 Recursos

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [Render.com](https://render.com) — plataforma de despliegue de este proyecto
