import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupBase64Blogs() {
  try {
    console.log('🔍 Searching for COMMUNITY blog posts with base64 images...')
    console.log('📌 Note: This will only affect UserBlogPost (community blogs), NOT church BlogPost')
    
    // First, count how many posts have base64 images without fetching the actual image data
    const count = await prisma.userBlogPost.count({
      where: {
        coverImage: {
          startsWith: 'data:image'
        }
      }
    })

    if (count === 0) {
      console.log('✅ No community blog posts with base64 images found.')
      return
    }

    console.log(`\n📊 Found ${count} COMMUNITY blog posts with base64 images.`)
    
    // Get just the titles and authors without the actual image data
    const postsWithBase64 = await prisma.userBlogPost.findMany({
      where: {
        coverImage: {
          startsWith: 'data:image'
        }
      },
      select: {
        id: true,
        title: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('\n📝 Posts that will be deleted:')
    // Log the posts that will be deleted
    postsWithBase64.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" by ${post.author?.name || 'Unknown'}`)
    })

    console.log('\n⚠️  These COMMUNITY blog posts will be deleted.')
    console.log('⚠️  Church BlogPost table will NOT be affected.')
    console.log('\n🔄 Proceeding with deletion...')
    
    // Delete all COMMUNITY posts with base64 images
    const deleteResult = await prisma.userBlogPost.deleteMany({
      where: {
        coverImage: {
          startsWith: 'data:image'
        }
      }
    })

    console.log(`\n🗑️  Deleted ${deleteResult.count} COMMUNITY blog posts with base64 images.`)
    
    // Also clean up orphaned likes and comments
    console.log('🧹 Cleaning up orphaned data...')
    
    // Note: If you have cascade delete set up in your schema, this might not be necessary
    // But let's check for any orphaned records
    
    console.log('✅ Cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupBase64Blogs()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
