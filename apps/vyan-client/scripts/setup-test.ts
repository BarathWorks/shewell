import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 1. Manual Column Fix ---');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Session" ADD COLUMN "maxBookings" INTEGER;');
    console.log('Column "maxBookings" added to "Session" table.');
  } catch (e: any) {
    if (e.message.includes('already exists')) {
      console.log('Column "maxBookings" already exists.');
    } else {
      console.error('Error adding column:', e.message);
    }
  }

  console.log('\n--- 2. Ensure Testing Session exists with maxBookings: 1 ---');
  const session = await prisma.session.upsert({
    where: { slug: 'testing' },
    update: {
      maxBookings: 1,
      status: 'PUBLISHED',
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
    },
    create: {
      title: 'Testing Concurrency Session',
      slug: 'testing',
      price: 100,
      status: 'PUBLISHED',
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
      maxBookings: 1,
      categoryId: (await prisma.sessionCategory.findFirst())?.id || 'temp-cat-id',
    },
  });
  console.log('Session "testing" is ready with maxBookings:', session.maxBookings);

  console.log('\n--- 3. Clean up existing registrations for testing ---');
  await prisma.sessionRegistration.deleteMany({
    where: { sessionId: session.id },
  });
  console.log('Cleaned up registrations for "testing" session.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
