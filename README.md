# 🚀 Sistema de Gestión Multi-tenant - Alanis Backend

Un sistema centralizado de gestión de clientes y proyectos que sirve a múltiples marcas (Alanis Web Dev y Cherry Pop Design) con control de horas, facturación e integraciones.

## 🏗️ Stack Tecnológico

- **Backend**: NestJS + TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT + Refresh Tokens
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator + class-transformer
- **Integraciones**: Invoice Ninja + n8n + EventEmitter
- **Eventos**: Sistema de eventos personalizado

## 📋 Características Implementadas

### ✅ Fase 0: Setup y Preparación
- [x] Estructura del proyecto NestJS
- [x] Configuración de Prisma con PostgreSQL
- [x] Variables de entorno configuradas
- [x] Dependencias instaladas
- [x] Scripts de build y deployment configurados

### ✅ Fase 1: Sistema de Autenticación Multi-tenant
- [x] Modelos de base de datos multi-tenant completos
- [x] Módulo de autenticación completo
- [x] Estrategias JWT (access + refresh tokens)
- [x] Guards y decoradores personalizados
- [x] Sistema de roles y permisos
- [x] Controladores con documentación Swagger
- [x] Validación de tenant en cada request

### ✅ Fase 2: Gestión de Clientes y Proyectos
- [x] CRUD completo de clientes por tenant
- [x] CRUD completo de proyectos
- [x] Asignación de usuarios a proyectos (ProjectUser)
- [x] DTOs con validaciones robustas
- [x] Filtros y queries avanzadas
- [x] Estados de proyecto (QUOTED, APPROVED, IN_PROGRESS, etc.)
- [x] Control de horas cotizadas vs utilizadas

### ✅ Fase 3: Control de Tiempo y Actividades
- [x] Sistema completo de registro de tiempo (TimeEntry)
- [x] Categorización de actividades (DEVELOPMENT, DESIGN, MEETING, etc.)
- [x] Control de tareas (Task model)
- [x] Reportes de tiempo por proyecto
- [x] Seguimiento de horas facturables vs no facturables
- [x] API completa con filtros avanzados
- [x] Actualización automática de horas usadas en proyectos

### ✅ Fase 4: Facturación e Integraciones
- [x] Integración completa con Invoice Ninja
  - [x] Sincronización automática de clientes
  - [x] Creación automática de facturas desde proyectos
  - [x] Agrupación inteligente de time entries
  - [x] Control de estado de sincronización
- [x] Integración completa con n8n
  - [x] Webhooks para workflows automatizados
  - [x] Reportes semanales automáticos
  - [x] Notificaciones de horas bajas en proyectos
  - [x] Alertas de proyectos aprobados
- [x] Sistema de eventos robusto
  - [x] Event listeners para proyectos
  - [x] Manejo automático de estado
  - [x] Notificaciones en tiempo real

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **Tenant**: Organizaciones (Alanis Web Dev, Cherry Pop Design)
- **User**: Usuarios del sistema con roles específicos
- **Client**: Clientes de cada tenant con integración Invoice Ninja
- **Project**: Proyectos con control de horas y facturación
- **ProjectUser**: Relación many-to-many entre usuarios y proyectos
- **TimeEntry**: Registro detallado de tiempo con facturación
- **Task**: Tareas específicas dentro de proyectos
- **Activity**: Registro de actividades generales
- **RefreshToken**: Manejo seguro de tokens de actualización

### Estados y Enums

- **ProjectStatus**: `QUOTED`, `APPROVED`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`
- **ActivityType**: `DEVELOPMENT`, `DESIGN`, `MEETING`, `TESTING`, `DOCUMENTATION`, `OTHER`
- **SyncStatus**: `PENDING`, `SYNCING`, `SYNCED`, `ERROR`
- **UserRole**: `SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `CLIENT`, `USER`

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

# Invoice Ninja Integration
INVOICE_NINJA_URL="https://your-invoice-ninja-instance.com"
INVOICE_NINJA_API_KEY="your-invoice-ninja-api-key"

# n8n Integration
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook"
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

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/clients` | Crear cliente |
| GET | `/clients` | Listar clientes (con filtros) |
| GET | `/clients/:id` | Obtener cliente específico |
| PATCH | `/clients/:id` | Actualizar cliente |
| DELETE | `/clients/:id` | Eliminar cliente |

### Proyectos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/projects` | Crear proyecto |
| GET | `/projects` | Listar proyectos |
| GET | `/projects/:id` | Obtener proyecto específico |
| PATCH | `/projects/:id` | Actualizar proyecto |
| DELETE | `/projects/:id` | Eliminar proyecto |

### Control de Tiempo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/time-tracking/entries` | Crear entrada de tiempo |
| GET | `/time-tracking/my-entries` | Mis entradas de tiempo |
| GET | `/time-tracking/projects/:id/report` | Reporte de tiempo por proyecto |
| PATCH | `/time-tracking/entries/:id` | Actualizar entrada de tiempo |
| DELETE | `/time-tracking/entries/:id` | Eliminar entrada de tiempo |

### Integraciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/integrations/invoice-ninja/sync-client/:id` | Sincronizar cliente |
| POST | `/integrations/invoice-ninja/create-invoice/:id` | Crear factura |
| POST | `/integrations/n8n/weekly-report` | Generar reporte semanal |
| GET | `/integrations/invoice-ninja/test-connection` | Test Invoice Ninja |
| GET | `/integrations/n8n/test-connection` | Test n8n |
| GET | `/integrations/status` | Estado de integraciones |

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

#### Crear Proyecto
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Nuevo Proyecto Web",
    "description": "Desarrollo de sitio web corporativo",
    "clientId": "client-id-here",
    "quotedHours": 40,
    "hourlyRate": 75.00,
    "status": "QUOTED"
  }'
```

#### Registrar Tiempo
```bash
curl -X POST http://localhost:3000/time-tracking/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "projectId": "project-id-here",
    "taskId": "task-id-here",
    "hours": 2.5,
    "description": "Desarrollo de componente de login",
    "date": "2024-01-15",
    "billable": true
  }'
```

## 🔒 Sistema de Seguridad

### Autenticación Multi-tenant

- Cada usuario pertenece a un tenant específico
- Los tokens JWT incluyen información del tenant
- Validación automática de tenant en cada request
- Guards personalizados para control de acceso
- Decoradores para obtener usuario y tenant actual

### Roles y Permisos

```typescript
// Ejemplo de uso de decoradores
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
async createProject(
  @CurrentUser() user: JwtPayload,
  @CurrentTenant() tenantId: string
) {
  // Solo admins y PMs pueden crear proyectos
}
```

### Sistema de Eventos

El sistema incluye un robusto sistema de eventos que permite:

- **Eventos de Proyecto**: Aprobación, cambios de estado
- **Eventos de Tiempo**: Registro automático, alertas de horas
- **Eventos de Facturación**: Creación automática, sincronización
- **Listeners Inteligentes**: Procesamiento automático de eventos

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Iniciar en modo desarrollo |
| `npm run build` | Compilar para producción |
| `npm run start:prod` | Iniciar en producción |
| `npm run lint` | Ejecutar linter |
| `npm run test` | Ejecutar tests |
| `npm run test:e2e` | Ejecutar tests end-to-end |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:migrate` | Ejecutar migraciones |
| `npm run db:seed` | Poblar datos iniciales |
| `npm run db:reset` | Resetear y repoblar BD |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run deploy:prod` | Deploy completo a producción |

## 📊 Datos de Prueba

Después de ejecutar `npm run db:seed`, tendrás:

### Tenants
- **Alanis Web Dev** (slug: `alanis-web-dev`)
- **Cherry Pop Design** (slug: `cherry-pop-design`)

### Usuarios de Prueba
- **Super Admin Alanis**: `admin@alanis.dev` / `admin123!`
- **Admin Cherry**: `admin@cherrypop.design` / `admin123!`

### Datos de Ejemplo
- Cliente de muestra con proyecto asociado
- Estructura completa para pruebas de integración

## 📚 Documentación API

Una vez iniciado el servidor, accede a:
- **Swagger UI**: http://localhost:3000/api
- **JSON Schema**: http://localhost:3000/api-json

## 🔮 Estado Actual y Funcionalidades

### ✅ Completamente Implementado
- ✅ **Sistema Multi-tenant** completo con aislamiento de datos
- ✅ **Autenticación y Autorización** robusta con JWT
- ✅ **Gestión de Clientes** con validaciones avanzadas
- ✅ **Gestión de Proyectos** con estados y control de horas
- ✅ **Control de Tiempo** detallado con facturación
- ✅ **Integraciones** funcionales con Invoice Ninja y n8n
- ✅ **Sistema de Eventos** para automatización
- ✅ **API RESTful** completa con documentación Swagger

### 🚀 Características Avanzadas
- **Sincronización Automática**: Clientes con Invoice Ninja
- **Facturación Inteligente**: Creación automática desde time entries
- **Reportes Automatizados**: Semanales via n8n
- **Alertas Proactivas**: Notificaciones de horas bajas
- **Eventos en Tiempo Real**: Sistema de listeners automáticos
- **Validaciones Robustas**: DTOs con class-validator
- **Documentación Completa**: Swagger/OpenAPI integrado

## 🏆 Arquitectura y Patrones

### Patrones Implementados
- **Repository Pattern**: Via Prisma Service
- **Event-Driven Architecture**: Sistema de eventos personalizado
- **Multi-tenancy**: Aislamiento completo por tenant
- **Clean Architecture**: Separación clara de responsabilidades
- **Dependency Injection**: NestJS IoC container
- **Strategy Pattern**: Guards y strategies personalizados

### Integraciones de Terceros
- **Invoice Ninja**: API completa para facturación
- **n8n**: Automatización via webhooks
- **Prisma**: ORM con type safety
- **JWT**: Autenticación stateless
- **Swagger**: Documentación automática

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
