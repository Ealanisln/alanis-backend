#!/bin/bash

echo "🚀 Configurando entorno de desarrollo para Alanis Backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    show_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    show_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Iniciar servicios de base de datos
echo "🐘 Iniciando PostgreSQL y Redis..."
docker-compose -f docker-compose.dev.yml up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar conexión a PostgreSQL
if docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U alanis_user -d alanis_backend_dev &> /dev/null; then
    show_message "PostgreSQL está listo"
else
    show_error "PostgreSQL no está respondiendo. Verifica la configuración."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    show_error "Ni pnpm ni npm están instalados. Por favor instala uno de ellos."
    exit 1
fi

# Generar cliente Prisma
echo "🔄 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🏗️  Ejecutando migraciones..."
npx prisma migrate dev --name init-database

# Ejecutar seed de datos iniciales
echo "🌱 Ejecutando seed de datos iniciales..."
npm run db:seed

show_message "¡Entorno de desarrollo configurado exitosamente!"
echo ""
echo "🎉 Para iniciar el servidor de desarrollo, ejecuta:"
echo "   npm run start:dev"
echo ""
echo "📚 Documentación de API disponible en:"
echo "   http://localhost:3000/api/docs"
echo ""
echo "🗄️  Base de datos PostgreSQL:"
echo "   Host: localhost:5432"
echo "   Database: alanis_backend_dev"
echo "   User: alanis_user"
echo "   Password: alanis_password"
echo ""
echo "📡 Redis:"
echo "   Host: localhost:6379" 