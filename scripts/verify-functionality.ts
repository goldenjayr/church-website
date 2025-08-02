import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyFunctionality() {
  console.log('🔍 Verifying all blog functionality...\n')

  try {
    // Check 1: Categories
    console.log('1️⃣ Checking Categories:')
    const categories = await prisma.blogCategory.findMany({
      include: { _count: { select: { blogPosts: true } } },
      orderBy: { order: 'asc' }
    })
    
    console.log(`✅ ${categories.length} categories found`)
    categories.forEach(cat => {
      console.log(`   📁 ${cat.name} (${cat.color}) - ${cat._count.blogPosts} posts`)
    })

    // Check 2: Sample Blog Post
    console.log('\n2️⃣ Checking Sample Blog Post:')
    const samplePost = await prisma.blogPost.findFirst({
      where: { slug: 'complete-guide-faith-community-spiritual-growth' },
      include: { author: true, category: true }
    })

    if (samplePost) {
      console.log('✅ Sample blog post found:')
      console.log(`   📝 Title: ${samplePost.title}`)
      console.log(`   👤 Author: ${samplePost.author.name}`)
      console.log(`   📁 Category: ${samplePost.category?.name}`)
      console.log(`   🏷️ Tags: ${samplePost.tags.join(', ')}`)
      console.log(`   📊 Published: ${samplePost.published}`)
      console.log(`   ⭐ Featured: ${samplePost.featured}`)
      console.log(`   📏 Content length: ${samplePost.content.length} characters`)
      
      // Check if content has rich text features
      const hasH1 = samplePost.content.includes('<h1>')
      const hasH2 = samplePost.content.includes('<h2>')
      const hasH3 = samplePost.content.includes('<h3>')
      const hasBold = samplePost.content.includes('<strong>')
      const hasItalic = samplePost.content.includes('<em>')
      const hasLists = samplePost.content.includes('<ol>') || samplePost.content.includes('<ul>')
      const hasBlockquote = samplePost.content.includes('<blockquote>')
      
      console.log('   🎨 Rich text features:')
      console.log(`      H1 headings: ${hasH1 ? '✅' : '❌'}`)
      console.log(`      H2 headings: ${hasH2 ? '✅' : '❌'}`)
      console.log(`      H3 headings: ${hasH3 ? '✅' : '❌'}`)
      console.log(`      Bold text: ${hasBold ? '✅' : '❌'}`)
      console.log(`      Italic text: ${hasItalic ? '✅' : '❌'}`)
      console.log(`      Lists: ${hasLists ? '✅' : '❌'}`)
      console.log(`      Blockquotes: ${hasBlockquote ? '✅' : '❌'}`)
    } else {
      console.log('❌ Sample blog post not found')
    }

    // Check 3: Admin User
    console.log('\n3️⃣ Checking Admin User:')
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:')
      console.log(`   👤 Name: ${adminUser.name}`)
      console.log(`   📧 Email: ${adminUser.email}`)
      console.log(`   🔑 Role: ${adminUser.role}`)
    } else {
      console.log('❌ No admin user found')
    }

    // Check 4: All Blog Posts
    console.log('\n4️⃣ All Blog Posts:')
    const allPosts = await prisma.blogPost.findMany({
      include: { author: true, category: true },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`✅ ${allPosts.length} total blog posts:`)
    allPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" by ${post.author.name}`)
      console.log(`      📁 Category: ${post.category?.name || 'No category'}`)
      console.log(`      🔗 Slug: /blog/${post.slug}`)
      console.log(`      📊 Status: ${post.published ? 'Published' : 'Draft'}${post.featured ? ' (Featured)' : ''}`)
    })

    console.log('\n🎉 Verification Complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. Start the dev server: npm run dev')
    console.log('2. Visit: http://localhost:3000/admin')
    console.log('3. Login with: admin@divinejesus.org')
    console.log('4. Go to Blog section to see all posts')
    console.log('5. Go to Blog Categories to manage categories')
    console.log('6. Edit the sample post to test rich text editor')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyFunctionality()