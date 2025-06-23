# 🚀 Instrucciones de Instalación - Alanis Backend

## 📋 **Resumen del Estado Actual**

✅ **Ya Implementado:**
- ✅ Módulo de Quotes completo
- ✅ Módulo de Contact/Email completo 
- ✅ Sistema de autenticación multi-tenant
- ✅ Variables de entorno configuradas
- ✅ Scripts de configuración creados

❌ **Pendiente:**
- ❌ Iniciar base de datos PostgreSQL
- ❌ Ejecutar migraciones de Prisma
- ❌ Seed de datos iniciales
- ❌ Pruebas de integración

## 🛠️ **Pasos para Completar la Instalación**

### **Opción 1: Con Docker (Recomendado)**

#### **1. Iniciar Docker Desktop**
```bash
# Si Docker Desktop no está iniciado, abrirlo manualmente
# O desde terminal:
open /Applications/Docker.app
```

#### **2. Una vez que Docker esté corriendo:**
```bash
# Iniciar servicios de base de datos
docker-compose -f docker-compose.dev.yml up -d

# Verificar que estén corriendo
docker-compose -f docker-compose.dev.yml ps
```

#### **3. Ejecutar migraciones y configuración:**
```bash
# Ejecutar migraciones
npx prisma migrate dev --name add-contact-forms

# Ejecutar seed de datos
npm run db:seed

# Iniciar servidor de desarrollo
npm run start:dev
```

### **Opción 2: Sin Docker (PostgreSQL local)**

Si no quieres usar Docker, puedes instalar PostgreSQL localmente:

#### **1. Instalar PostgreSQL con Homebrew:**
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar servicio
brew services start postgresql@15

# Crear base de datos y usuario
psql postgres
```

#### **2. En el prompt de PostgreSQL:**
```sql
-- Crear usuario
CREATE USER alanis_user WITH PASSWORD 'alanis_password';

-- Crear base de datos
CREATE DATABASE alanis_backend_dev OWNER alanis_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE alanis_backend_dev TO alanis_user;

-- Salir
\q
```

#### **3. Ejecutar configuración:**
```bash
# Ejecutar migraciones
npx prisma migrate dev --name add-contact-forms

# Ejecutar seed
npm run db:seed

# Iniciar servidor
npm run start:dev
```

## 🧪 **Verificar que Todo Funciona**

### **1. Verificar que el servidor esté corriendo:**
```bash
curl http://localhost:3000/health
```

### **2. Crear una cotización (público):**
```bash
curl -X POST http://localhost:3000/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Test User",
    "clientEmail": "test@ejemplo.com",
    "projectName": "Test Project",
    "projectType": "web",
    "services": [{"id": "web_basic", "name": "Web Básico", "price": 15000}],
    "subtotal": 15000,
    "total": 15000
  }'
```

### **3. Enviar formulario de contacto (público):**
```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@ejemplo.com",
    "message": "Test message",
    "subject": "Test subject"
  }'
```

### **4. Ver documentación de API:**
Abrir en navegador: http://localhost:3000/api/docs

## 🔗 **Configurar Frontend**

Una vez que el backend esté funcionando:

### **1. Ir al proyecto frontend:**
```bash
cd /Users/ealanis/Development/current-projects/alanis-saas-upgrade/
```

### **2. Configurar variables de entorno del frontend:**
```bash
# Crear archivo .env.local
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local
```

### **3. Instalar dependencias e iniciar:**
```bash
# Instalar dependencias
npm install

# Iniciar frontend
npm run dev
```

## 📊 **Estado de Implementación**

### **✅ Backend Completado:**
- **Quotes Module:** Endpoints públicos y privados
- **Contact Module:** Formulario público y gestión admin
- **Auth System:** JWT multi-tenant completo
- **Database:** Prisma con PostgreSQL
- **API Docs:** Swagger implementado

### **🔄 Frontend Integration:**
- **API Client:** Configurado para conectar con backend
- **Auth Integration:** Pendiente de implementar
- **Forms Integration:** Listo para conectar

### **⏳ Próximas Fases:**
1. **Stripe Integration:** Para pagos
2. **Email Service:** SendGrid para notificaciones
3. **Dashboard Auth:** Autenticación completa del admin
4. **Production Deploy:** Configuración para producción

## 🚀 **Testing Completo**

### **1. Backend funcionando:**
- ✅ Quotes públicas
- ✅ Contact form público
- ✅ Autenticación admin
- ✅ CRUD de recursos

### **2. Frontend funcionando:**
- ✅ Cotizador conectado al backend
- ✅ Formulario de contacto conectado
- ⏳ Dashboard admin (próximo)

### **3. Integración completa:**
- ⏳ Auth frontend-backend
- ⏳ Payments con Stripe
- ⏳ Email notifications

---

## 📞 **Soporte Inmediato**

Si tienes algún problema en cualquier paso:

1. **Docker no inicia:** Verificar que Docker Desktop esté instalado y corriendo
2. **Database connection error:** Verificar credenciales en .env
3. **Module not found:** Ejecutar `npm install` y `npx prisma generate`
4. **Port already in use:** Cambiar PORT en .env o matar proceso: `lsof -ti:3000 | xargs kill -9`

**¡Ya tienes todo listo para completar la integración!** 🎉 