import seedCategories from './seed-categories'
import seedSampleBlogPost from './seed-sample-blog'

async function seedAll() {
  console.log('🚀 Starting comprehensive database seeding...')
  console.log('=' .repeat(50))

  try {
    // First seed categories
    console.log('Step 1: Seeding categories...')
    await seedCategories()
    console.log('✅ Categories seeded successfully!')
    console.log('')

    // Then seed sample blog post
    console.log('Step 2: Creating sample blog post...')
    await seedSampleBlogPost()
    console.log('✅ Sample blog post created successfully!')
    console.log('')

    console.log('=' .repeat(50))
    console.log('🎉 All seeding completed successfully!')
    console.log('')
    console.log('What was created:')
    console.log('📁 12 diverse blog categories with colors and descriptions')
    console.log('📝 1 comprehensive sample blog post showcasing all rich text features')
    console.log('🏷️ 15 sample tags demonstrating tag functionality')
    console.log('🎨 Full color-coded category system')
    console.log('')
    console.log('Next steps:')
    console.log('1. Visit /admin/blog/categories to manage categories')
    console.log('2. Visit /admin/blog to see the sample post')
    console.log('3. Edit the sample post to test all rich text features')
    console.log('4. Create new posts using the dynamic category system')

  } catch (error) {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  seedAll()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default seedAll