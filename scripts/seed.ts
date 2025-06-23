import { execSync } from 'child_process';

console.log('🚀 Running database seeder...');

try {
  execSync('npx ts-node src/common/seeders/initial-data.seeder.ts', {
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
} 