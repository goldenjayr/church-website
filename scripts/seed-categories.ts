import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_CATEGORIES = [
  {
    name: 'Devotional',
    slug: 'devotional',
    description: 'Daily devotions and spiritual reflections',
    color: '#3b82f6',
    order: 0,
    active: true,
  },
  {
    name: 'Sermon',
    slug: 'sermon',
    description: 'Sunday sermons and biblical teachings',
    color: '#ef4444',
    order: 1,
    active: true,
  },
  {
    name: 'Bible Study',
    slug: 'bible-study',
    description: 'In-depth Bible studies and theological exploration',
    color: '#f59e0b',
    order: 2,
    active: true,
  },
  {
    name: 'Testimony',
    slug: 'testimony',
    description: 'Personal testimonies and faith stories',
    color: '#8b5cf6',
    order: 3,
    active: true,
  },
  {
    name: 'Prayer & Worship',
    slug: 'prayer-worship',
    description: 'Prayer requests, worship resources, and spiritual guidance',
    color: '#ec4899',
    order: 4,
    active: true,
  },
  {
    name: 'Community Life',
    slug: 'community-life',
    description: 'Community events, fellowship, and church family activities',
    color: '#06b6d4',
    order: 5,
    active: true,
  },
  {
    name: 'Youth & Family',
    slug: 'youth-family',
    description: 'Youth ministry, family resources, and children programs',
    color: '#84cc16',
    order: 6,
    active: true,
  },
  {
    name: 'Missions & Outreach',
    slug: 'missions-outreach',
    description: 'Mission trips, community outreach, and evangelism',
    color: '#f97316',
    order: 7,
    active: true,
  },
  {
    name: 'Church News',
    slug: 'church-news',
    description: 'Important church announcements and updates',
    color: '#10b981',
    order: 8,
    active: true,
  },
  {
    name: 'Leadership Insights',
    slug: 'leadership-insights',
    description: 'Pastoral messages and leadership reflections',
    color: '#6366f1',
    order: 9,
    active: true,
  },
  {
    name: 'Faith & Culture',
    slug: 'faith-culture',
    description: 'Christian perspectives on contemporary issues',
    color: '#14b8a6',
    order: 10,
    active: true,
  },
  {
    name: 'Spiritual Growth',
    slug: 'spiritual-growth',
    description: 'Resources for personal spiritual development',
    color: '#eab308',
    order: 11,
    active: true,
  },
]

async function seedCategories() {
  console.log('🌱 Seeding blog categories...')

  try {
    // Check if categories already exist
    const existingCategories = await prisma.blogCategory.findMany()
    
    if (existingCategories.length > 0) {
      console.log('📋 Categories already exist, skipping seeding.')
      return
    }

    // Create categories
    for (const category of INITIAL_CATEGORIES) {
      await prisma.blogCategory.create({
        data: category,
      })
      console.log(`✅ Created category: ${category.name}`)
    }

    console.log('🎉 Successfully seeded blog categories!')
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('✨ Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}

export default seedCategories