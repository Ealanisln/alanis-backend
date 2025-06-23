import { PrismaClient, TenantType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedInitialData() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create Alanis Web Dev tenant
    const alanisWebDevTenant = await prisma.tenant.upsert({
      where: { slug: 'alanis-web-dev' },
      update: {},
      create: {
        name: 'Alanis Web Development',
        slug: 'alanis-web-dev',
        type: TenantType.ALANIS_WEB_DEV,
        domain: 'alanis.dev',
        settings: {
          theme: 'default',
          features: ['project-management', 'time-tracking', 'invoicing'],
        },
      },
    });

    console.log('✅ Created Alanis Web Dev tenant');

    // Create Cherry Pop Design tenant
    const cherryPopTenant = await prisma.tenant.upsert({
      where: { slug: 'cherry-pop-design' },
      update: {},
      create: {
        name: 'Cherry Pop Design',
        slug: 'cherry-pop-design',
        type: TenantType.CHERRY_POP_DESIGN,
        domain: 'cherrypop.design',
        settings: {
          theme: 'cherry',
          features: [
            'design-portfolio',
            'client-gallery',
            'project-management',
          ],
        },
      },
    });

    console.log('✅ Created Cherry Pop Design tenant');

    // Create admin user for Alanis Web Dev
    const adminPassword = await bcrypt.hash('admin123!', 12);

    await prisma.user.upsert({
      where: { email: 'admin@alanis.dev' },
      update: {},
      create: {
        email: 'admin@alanis.dev',
        password: adminPassword,
        firstName: 'Emmanuel',
        lastName: 'Alanis',
        role: UserRole.SUPER_ADMIN,
        tenantId: alanisWebDevTenant.id,
      },
    });

    console.log('✅ Created admin user for Alanis Web Dev');

    // Create admin user for Cherry Pop Design
    await prisma.user.upsert({
      where: { email: 'admin@cherrypop.design' },
      update: {},
      create: {
        email: 'admin@cherrypop.design',
        password: adminPassword,
        firstName: 'Cherry',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        tenantId: cherryPopTenant.id,
      },
    });

    console.log('✅ Created admin user for Cherry Pop Design');

    // Create sample client for Alanis Web Dev
    const sampleClient = await prisma.client.upsert({
      where: {
        id: 'sample-client-id',
      },
      update: {},
      create: {
        id: 'sample-client-id',
        name: 'Sample Client',
        email: 'client@example.com',
        company: 'Example Corp',
        phone: '+1234567890',
        tenantId: alanisWebDevTenant.id,
      },
    });

    console.log('✅ Created sample client');

    // Create sample project
    await prisma.project.upsert({
      where: {
        id: 'sample-project-id',
      },
      update: {},
      create: {
        id: 'sample-project-id',
        name: 'Sample Web Development Project',
        description: 'A sample project for demonstration purposes',
        quotedHours: 40,
        hourlyRate: 75.0,
        tenantId: alanisWebDevTenant.id,
        clientId: sampleClient.id,
      },
    });

    console.log('✅ Created sample project');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Alanis Web Dev tenant: ${alanisWebDevTenant.id}`);
    console.log(`- Cherry Pop Design tenant: ${cherryPopTenant.id}`);
    console.log(`- Admin users created with password: admin123!`);
    console.log(`- Sample client and project created`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedInitialData().catch((error) => {
  console.error(error);
  process.exit(1);
});
