# 🚀 Sistema de Gestión Multi-tenant - Alanis Backend

Un sistema centralizado de gestión de clientes y proyectos que sirve a múltiples marcas (Alanis Web Dev y Cherry Pop Design) con control de horas, facturación e integraciones.

## 🏗️ Stack Tecnológico

- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT + Refresh Tokens
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator + class-transformer

## 📋 Características Implementadas

### ✅ Fase 0: Setup y Preparación
- [x] Estructura del proyecto NestJS
- [x] Configuración de Prisma con PostgreSQL
- [x] Variables de entorno configuradas
- [x] Dependencias instaladas

### ✅ Fase 1: Sistema de Autenticación Multi-tenant
- [x] Modelos de base de datos multi-tenant
- [x] Módulo de autenticación completo
- [x] Estrategias JWT (access + refresh tokens)
- [x] Guards y decoradores personalizados
- [x] Sistema de roles y permisos
- [x] Controladores con documentación Swagger

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **Tenant**: Organizaciones (Alanis Web Dev, Cherry Pop Design)
- **User**: Usuarios del sistema con roles específicos
- **Client**: Clientes de cada tenant
- **Project**: Proyectos asignados a clientes
- **Activity**: Registro de actividades y tiempo
- **RefreshToken**: Manejo seguro de tokens de actualización

### Roles de Usuario

- `SUPER_ADMIN`: Acceso completo al sistema
- `ADMIN`: Administrador de tenant
- `PROJECT_MANAGER`: Gestor de proyectos
- `DEVELOPER`: Desarrollador
- `CLIENT`: Cliente externo
- `USER`: Usuario básico

## 🚀 Instalación y Configuración

### 1. Clonar y instalar dependencias

```bash
git clone <repository-url>
cd alanis-backend
pnpm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` basado en el ejemplo:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/alanis_multi_tenant?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Application
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"
```

### 3. Configurar la base de datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos iniciales
npm run db:seed
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/refresh` | Renovar token |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/logout-all` | Cerrar todas las sesiones |
| GET | `/auth/profile` | Obtener perfil del usuario |

### Ejemplos de Uso

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alanis.dev",
    "password": "admin123!",
    "tenantSlug": "alanis-web-dev"
  }'
```

#### Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@alanis.dev",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DEVELOPER",
    "tenantId": "tenant-id-here"
  }'
```

## 🔒 Sistema de Seguridad

### Autenticación Multi-tenant

- Cada usuario pertenece a un tenant específico
- Los tokens JWT incluyen información del tenant
- Validación automática de tenant en cada request
- Guards personalizados para control de acceso

### Roles y Permisos

```typescript
// Ejemplo de uso de decoradores
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
@RequireTenant('alanis-web-dev')
async createProject(@CurrentUser() user: AuthenticatedUser) {
  // Solo admins y PMs de Alanis Web Dev pueden acceder
}
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run lint` | Ejecutar linter |
| `npm run test` | Ejecutar tests |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:migrate` | Ejecutar migraciones |
| `npm run db:seed` | Poblar datos iniciales |
| `npm run db:reset` | Resetear y repoblar BD |
| `npm run db:studio` | Abrir Prisma Studio |

## 📊 Datos de Prueba

Después de ejecutar `npm run db:seed`, tendrás:

### Tenants
- **Alanis Web Dev** (slug: `alanis-web-dev`)
- **Cherry Pop Design** (slug: `cherry-pop-design`)

### Usuarios de Prueba
- **Admin Alanis**: `admin@alanis.dev` / `admin123!`
- **Admin Cherry**: `admin@cherrypop.design` / `admin123!`

## 📚 Documentación API

Una vez iniciado el servidor, accede a:
- **Swagger UI**: http://localhost:3000/api
- **JSON Schema**: http://localhost:3000/api-json

## 🔮 Próximas Fases

### Fase 2: Gestión de Clientes y Proyectos
- [ ] CRUD de clientes por tenant
- [ ] CRUD de proyectos
- [ ] Asignación de usuarios a proyectos
- [ ] Dashboard de resumen

### Fase 3: Control de Tiempo y Actividades
- [ ] Registro de tiempo por proyecto
- [ ] Categorización de actividades
- [ ] Reportes de tiempo
- [ ] Exportación de datos

### Fase 4: Facturación e Integraciones
- [ ] Integración con Invoice Ninja
- [ ] Generación automática de facturas
- [ ] Integración con n8n
- [ ] Webhooks y notificaciones

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y pertenece a Alanis Web Development.

## 📞 Contacto

Emmanuel Alanis - [@AlanisDev](https://github.com/ealanis) - emmanuel@alanis.dev

Project Link: [https://github.com/ealanis/alanis-backend](https://github.com/ealanis/alanis-backend)
