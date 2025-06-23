# 🚀 Configuración Local - Alanis Backend

Esta guía te ayudará a configurar el backend de Alanis localmente para desarrollo y testing.

## 📋 **Prerrequisitos**

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [pnpm](https://pnpm.io/) (recomendado) o npm

## 🛠️ **Instalación Rápida**

### **Opción 1: Script Automático (Recomendado)**
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd alanis-backend

# Ejecutar script de configuración
./scripts/setup-dev.sh
```

### **Opción 2: Configuración Manual**

#### **1. Instalar Dependencias**
```bash
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install
```

#### **2. Configurar Base de Datos**
```bash
# Iniciar PostgreSQL y Redis con Docker
docker-compose -f docker-compose.dev.yml up -d

# Verificar que estén funcionando
docker-compose -f docker-compose.dev.yml ps
```

#### **3. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables necesarias
nano .env
```

**Variables mínimas requeridas:**
```env
DATABASE_URL="postgresql://alanis_user:alanis_password@localhost:5432/alanis_backend_dev?schema=public"
JWT_SECRET="dev-jwt-secret-key-change-in-production-12345"
DEFAULT_TENANT_ID="cm123456789012345678"
```

#### **4. Configurar Base de Datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init-database

# Ejecutar seed de datos iniciales
npm run db:seed
```

#### **5. Iniciar Servidor de Desarrollo**
```bash
npm run start:dev
```

## 🎯 **URLs Importantes**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Backend** | http://localhost:3000 | Servidor principal |
| **Swagger Docs** | http://localhost:3000/api/docs | Documentación interactiva de API |
| **PostgreSQL** | localhost:5432 | Base de datos |
| **Redis** | localhost:6379 | Cache y sesiones |

## 📊 **Conexión a Base de Datos**

### **Credenciales de PostgreSQL:**
- **Host:** localhost
- **Puerto:** 5432
- **Base de datos:** alanis_backend_dev
- **Usuario:** alanis_user
- **Contraseña:** alanis_password

### **Herramientas Recomendadas:**
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)
- [TablePlus](https://tableplus.com/)

## 🧪 **Testing**

### **Ejecutar Tests**
```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Tests con coverage
npm run test:cov
```

### **Testing Manual con API**

#### **1. Crear una cotización (público):**
```bash
curl -X POST http://localhost:3000/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Juan Pérez",
    "clientEmail": "juan@ejemplo.com",
    "projectName": "Mi Sitio Web",
    "projectType": "web",
    "services": [
      {
        "id": "web_basic",
        "name": "Sitio Web Básico",
        "price": 15000
      }
    ],
    "subtotal": 15000,
    "total": 15000
  }'
```

#### **2. Enviar formulario de contacto (público):**
```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@ejemplo.com",
    "message": "Hola, me interesa cotizar un proyecto web",
    "phone": "+52 55 1234 5678",
    "subject": "Cotización proyecto web"
  }'
```

#### **3. Autenticación (para endpoints privados):**
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alanis.dev",
    "password": "tu_password"
  }'

# Usar el token en requests posteriores
curl -X GET http://localhost:3000/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 **Comandos Útiles**

### **Base de Datos**
```bash
# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡cuidado en producción!)
npx prisma migrate reset

# Abrir Prisma Studio (GUI para DB)
npx prisma studio

# Seed de datos
npm run db:seed
```

### **Docker**
```bash
# Ver logs de contenedores
docker-compose -f docker-compose.dev.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Limpiar volúmenes (resetea datos)
docker-compose -f docker-compose.dev.yml down -v
```

### **Desarrollo**
```bash
# Modo watch (reinicio automático)
npm run start:dev

# Build para producción
npm run build

# Lint y format
npm run lint
npm run format
```

## 🔍 **Troubleshooting**

### **Error: "Environment variable not found: DATABASE_URL"**
```bash
# Verificar que el archivo .env existe y tiene la variable
cat .env | grep DATABASE_URL

# Si no existe, agregarla
echo 'DATABASE_URL="postgresql://alanis_user:alanis_password@localhost:5432/alanis_backend_dev?schema=public"' >> .env
```

### **Error: "Can't reach database server"**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose -f docker-compose.dev.yml ps

# Si no está corriendo, iniciarlo
docker-compose -f docker-compose.dev.yml up -d postgres

# Verificar logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### **Error: "Module not found" o dependencias**
```bash
# Limpiar node_modules e instalar de nuevo
rm -rf node_modules
rm -rf dist
pnpm install

# Regenerar cliente Prisma
npx prisma generate
```

### **Puerto 3000 ya en uso**
```bash
# Cambiar puerto en .env
echo 'PORT=3001' >> .env

# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

## 🚀 **Próximos Pasos**

Una vez que tengas el backend funcionando:

1. **Configurar Frontend:** El frontend está en `/Users/ealanis/Development/current-projects/alanis-saas-upgrade/`
2. **Configurar Variables del Frontend:** Crear `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. **Testing Integrado:** Probar que el frontend se conecte correctamente al backend

## 📞 **Soporte**

Si tienes problemas:

1. Verifica que Docker esté corriendo
2. Verifica que el archivo `.env` esté configurado correctamente
3. Revisa los logs: `docker-compose -f docker-compose.dev.yml logs -f`
4. Verifica que no haya conflictos de puertos

---

**¡Listo!** 🎉 Tu entorno de desarrollo local debería estar funcionando correctamente. 