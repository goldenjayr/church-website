import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@divinejesus.org' },
    update: {},
    create: {
      id: 'admin1',
      email: 'admin@divinejesus.org',
      password: 'admin123', // In production, this should be properly hashed
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', adminUser.email);

  // Create sample daily verse
  const dailyVerse = await prisma.dailyVerse.upsert({
    where: { date: new Date('2024-01-15') },
    update: {},
    create: {
      verse: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
      reference: 'Jeremiah 29:11',
      date: new Date('2024-01-15'),
    },
  });
  console.log('Created daily verse:', dailyVerse.reference);

  // Create sample blog posts
  const blogPost1 = await prisma.blogPost.upsert({
    where: { slug: 'walking-in-faith-daily' },
    update: {},
    create: {
      title: 'Walking in Faith Daily',
      slug: 'walking-in-faith-daily',
      content: '<p>Faith is not just a Sunday experience, but a daily walk with God. In this devotional, we explore how to maintain a strong relationship with Christ throughout the week...</p>',
      excerpt: 'Discover how to make faith a daily practice in your life and maintain a strong relationship with Christ throughout the week.',
      published: true,
      featured: true,
      tags: ['faith', 'daily-walk', 'spiritual-growth'],
      category: 'DEVOTIONAL',
      contentType: 'HTML',
      authorId: adminUser.id,
    },
  });
  console.log('Created blog post:', blogPost1.title);

  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: 'the-power-of-prayer' },
    update: {},
    create: {
      title: 'The Power of Prayer',
      slug: 'the-power-of-prayer',
      content: '<p>Prayer is our direct line of communication with God. It is through prayer that we find strength, guidance, and peace in our daily lives...</p>',
      excerpt: 'Learn about the transformative power of prayer in your spiritual journey and how it can change your life.',
      published: true,
      featured: false,
      tags: ['prayer', 'spiritual-discipline', 'communication'],
      category: 'DEVOTIONAL',
      contentType: 'HTML',
      authorId: adminUser.id,
    },
  });
  console.log('Created blog post:', blogPost2.title);

  // Create sample doctrines
  const existingDoctrine1 = await prisma.doctrine.findFirst({
    where: { title: 'The Trinity' }
  });
  
  if (!existingDoctrine1) {
    const doctrine1 = await prisma.doctrine.create({
      data: {
        title: 'The Trinity',
        content: '<p>We believe in one God who exists eternally in three persons: Father, Son, and Holy Spirit. Each person is fully God, yet there is only one God.</p>',
        category: 'Core Beliefs',
        order: 1,
        published: true,
        contentType: 'HTML',
      },
    });
    console.log('Created doctrine:', doctrine1.title);
  }

  const existingDoctrine2 = await prisma.doctrine.findFirst({
    where: { title: 'Salvation by Grace' }
  });
  
  if (!existingDoctrine2) {
    const doctrine2 = await prisma.doctrine.create({
      data: {
        title: 'Salvation by Grace',
        content: '<p>We believe that salvation is by grace alone through faith alone in Christ alone. It is not earned by works but is a gift from God.</p>',
        category: 'Core Beliefs',
        order: 2,
        published: true,
        contentType: 'HTML',
      },
    });
    console.log('Created doctrine:', doctrine2.title);
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
