import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// First, let's create the categories based on existing blog post categories
const LEGACY_CATEGORY_MAPPING = {
  'DEVOTIONAL': { name: 'Devotional', color: '#3b82f6' },
  'SERMON': { name: 'Sermon', color: '#ef4444' },
  'ARTICLE': { name: 'Article', color: '#f59e0b' },
  'ANNOUNCEMENT': { name: 'Announcement', color: '#10b981' },
  'TESTIMONY': { name: 'Testimony', color: '#8b5cf6' },
  'BIBLE_STUDY': { name: 'Bible Study', color: '#ec4899' },
  'PRAYER': { name: 'Prayer', color: '#06b6d4' },
  'COMMUNITY': { name: 'Community', color: '#84cc16' },
  'YOUTH': { name: 'Youth', color: '#f97316' },
  'MISSIONS': { name: 'Missions', color: '#6366f1' },
  'WORSHIP': { name: 'Worship', color: '#14b8a6' },
  'LIFE_TIPS': { name: 'Life Tips', color: '#eab308' },
}

async function migrateBlogCategories() {
  console.log('🔄 Starting blog category migration...')

  try {
    // First, let's see what categories are currently in use
    console.log('📊 Analyzing existing blog posts...')
    
    // Use raw SQL to get existing categories from BlogPost table
    const existingCategories = await prisma.$queryRaw`
      SELECT DISTINCT category FROM "BlogPost" WHERE category IS NOT NULL;
    ` as Array<{ category: string }>

    console.log('Found existing categories:', existingCategories.map(c => c.category))

    // Create BlogCategory records for each existing category
    console.log('📁 Creating category records...')
    const categoryMap = new Map<string, string>()

    for (const [index, { category }] of existingCategories.entries()) {
      const categoryInfo = LEGACY_CATEGORY_MAPPING[category as keyof typeof LEGACY_CATEGORY_MAPPING] || {
        name: category,
        color: '#6366f1'
      }

      const slug = categoryInfo.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\\s+/g, '-')

      const blogCategory = await prisma.blogCategory.upsert({
        where: { slug },
        update: {},
        create: {
          name: categoryInfo.name,
          slug,
          description: `Migrated from legacy category: ${category}`,
          color: categoryInfo.color,
          order: index,
          active: true,
        }
      })

      categoryMap.set(category, blogCategory.id)
      console.log(`✅ Created/found category: ${categoryInfo.name} (${blogCategory.id})`)
    }

    // Now update all blog posts to use the new categoryId
    console.log('🔄 Updating blog post references...')
    
    for (const [oldCategory, newCategoryId] of categoryMap.entries()) {
      await prisma.$executeRaw`
        UPDATE "BlogPost" 
        SET "categoryId" = ${newCategoryId}
        WHERE category = ${oldCategory};
      `
      console.log(`✅ Updated posts with category ${oldCategory} to use categoryId ${newCategoryId}`)
    }

    console.log('🎉 Migration completed successfully!')
    console.log(`📊 Created ${categoryMap.size} categories and updated all blog post references.`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  migrateBlogCategories()
    .then(() => {
      console.log('✨ Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export default migrateBlogCategories