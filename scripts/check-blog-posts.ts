import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlogPosts() {
  try {
    console.log('🔍 Checking blog posts in database...')
    
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        author: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${blogPosts.length} blog posts:`)
    
    blogPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Author: ${post.author.name}`)
      console.log(`   Category: ${post.category?.name || 'No category'}`)
      console.log(`   Published: ${post.published}`)
      console.log(`   Featured: ${post.featured}`)
      console.log(`   Tags: ${post.tags.join(', ')}`)
      console.log(`   Created: ${post.createdAt}`)
    })

    // Also check categories
    console.log('\n📁 Checking categories...')
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { blogPosts: true }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    console.log(`📊 Found ${categories.length} categories:`)
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category._count.blogPosts} posts)`)
    })

    // Check users
    console.log('\n👥 Checking users...')
    const users = await prisma.user.findMany()
    console.log(`📊 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    })

  } catch (error) {
    console.error('❌ Error checking blog posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBlogPosts()