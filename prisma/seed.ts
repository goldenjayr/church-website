import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@divinejesus.org' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        id: 'admin1',
        email: 'admin@divinejesus.org',
        password: 'admin123', // In production, this should be properly hashed
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:', adminUser.email);
  } else {
    console.log('Admin user already exists.');
  }

  // Create sample daily verse
  const verseDate = new Date('2024-01-15');
  const dailyVerseExists = await prisma.dailyVerse.findFirst({
    where: { date: verseDate },
  });

  if (!dailyVerseExists) {
    const dailyVerse = await prisma.dailyVerse.create({
      data: {
        verse: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
        reference: 'Jeremiah 29:11',
        date: verseDate,
      },
    });
    console.log('Created daily verse:', dailyVerse.reference);
  } else {
    console.log('Daily verse for this date already exists.');
  }

  // Create sample blog posts
  const blogPost1Exists = await prisma.blogPost.findUnique({
    where: { slug: 'walking-in-faith-daily' },
  });

  if (!blogPost1Exists) {
    const blogPost1 = await prisma.blogPost.create({
      data: {
        title: 'Walking in Faith Daily',
        slug: 'walking-in-faith-daily',
        content: '<p>Faith is not just a Sunday experience, but a daily walk with God. In this devotional, we explore how to maintain a strong relationship with Christ throughout the week...</p>',
        excerpt: 'Discover how to make faith a daily practice in your life and maintain a strong relationship with Christ throughout the week.',
        published: true,
        featured: true,
        tags: ['faith', 'daily-walk', 'spiritual-growth'],
        contentType: 'HTML',
        authorId: adminUser.id,
      },
    });
    console.log('Created blog post:', blogPost1.title);
  } else {
    console.log('Blog post "Walking in Faith Daily" already exists.');
  }

  const blogPost2Exists = await prisma.blogPost.findUnique({
    where: { slug: 'the-power-of-prayer' },
  });

  if (!blogPost2Exists) {
    const blogPost2 = await prisma.blogPost.create({
      data: {
        title: 'The Power of Prayer',
        slug: 'the-power-of-prayer',
        content: '<p>Prayer is our direct line of communication with God. It is through prayer that we find strength, guidance, and peace in our daily lives...</p>',
        excerpt: 'Learn about the transformative power of prayer in your spiritual journey and how it can change your life.',
        published: true,
        featured: false,
        tags: ['prayer', 'spiritual-discipline', 'communication'],
        contentType: 'HTML',
        authorId: adminUser.id,
      },
    });
    console.log('Created blog post:', blogPost2.title);
  } else {
    console.log('Blog post "The Power of Prayer" already exists.');
  }

  // Create sample positions
  let pastorPosition = await prisma.position.findUnique({
    where: { name: 'Pastor' },
  });
  if (!pastorPosition) {
    pastorPosition = await prisma.position.create({
      data: {
        name: 'Pastor',
        description: 'Senior pastor and spiritual leader of the church',
        color: '#8b5cf6',
        order: 1,
      },
    });
    console.log('Created position:', pastorPosition.name);
  } else {
    console.log('Position "Pastor" already exists.');
  }

  let elderPosition = await prisma.position.findUnique({
    where: { name: 'Elder' },
  });
  if (!elderPosition) {
    elderPosition = await prisma.position.create({
      data: {
        name: 'Elder',
        description: 'Church elder providing spiritual guidance and leadership',
        color: '#3b82f6',
        order: 2,
      },
    });
    console.log('Created position:', elderPosition.name);
  } else {
    console.log('Position "Elder" already exists.');
  }

  let musicDirectorPosition = await prisma.position.findUnique({
    where: { name: 'Music Director' },
  });
  if (!musicDirectorPosition) {
    musicDirectorPosition = await prisma.position.create({
      data: {
        name: 'Music Director',
        description: 'Leader of the church worship and music ministry',
        color: '#22c55e',
        order: 3,
      },
    });
    console.log('Created position:', musicDirectorPosition.name);
  } else {
    console.log('Position "Music Director" already exists.');
  }

  // Create sample members
  const pastorMemberExists = await prisma.member.findUnique({
    where: { email: 'pastor@divinejesus.org' },
  });

  if (!pastorMemberExists) {
    const pastorMember = await prisma.member.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'pastor@divinejesus.org',
        phone: '(555) 123-4567',
        bio: 'Pastor John has been leading our church for over 10 years with a heart for community service and spiritual growth.',
        positionId: pastorPosition.id,
        featured: true,
        joinDate: new Date('2014-01-15'),
      },
    });
    console.log('Created member:', `${pastorMember.firstName} ${pastorMember.lastName}`);
  } else {
    console.log('Member "John Smith" already exists.');
  }

  const elderMemberExists = await prisma.member.findUnique({
    where: { email: 'elder.mary@divinejesus.org' },
  });

  if (!elderMemberExists) {
    const elderMember = await prisma.member.create({
      data: {
        firstName: 'Mary',
        lastName: 'Johnson',
        email: 'elder.mary@divinejesus.org',
        phone: '(555) 987-6543',
        bio: 'Elder Mary brings wisdom and compassion to our church community and leads our prayer ministry.',
        positionId: elderPosition.id,
        featured: true,
        joinDate: new Date('2016-03-20'),
      },
    });
    console.log('Created member:', `${elderMember.firstName} ${elderMember.lastName}`);
  } else {
    console.log('Member "Mary Johnson" already exists.');
  }

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