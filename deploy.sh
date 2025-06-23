#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "❌ ERROR: JWT_SECRET environment variable is not set"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed database if needed (only for initial deployment)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx ts-node scripts/seed.ts
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "✅ Deployment completed successfully!"
echo "🌟 Application is ready to start with: npm run start:prod" 