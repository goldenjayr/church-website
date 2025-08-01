import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default service data
  const services = [
    { id: 1, name: 'Storefront', service_type: 'storefront' },
    { id: 2, name: 'Dashboard', service_type: 'dashboard' },
    { id: 3, name: 'Export Service', service_type: 'export-service' },
    { id: 4, name: 'Design Studio', service_type: 'design-studio' },
    { id: 5, name: 'Mockup Generator', service_type: 'mockup-generator' },
  ];

  for (const service of services) {
    try {
      await prisma.service.upsert({
        where: { id: service.id },
        update: {},
        create: service,
      });
      console.log(`Inserted: ${service.name}`);
    } catch (e) {
      console.error(`Failed to insert ${service.name}:`, e);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
