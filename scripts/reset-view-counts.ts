/**
 * Safe script to reset view counts for all blog posts
 * This script ONLY modifies view count fields and preserves all other data
 * 
 * Usage: npx tsx scripts/reset-view-counts.ts
 */

import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function resetViewCounts() {
  console.log(`\n${colors.cyan}${colors.bright}=================================`)
  console.log(`VIEW COUNT RESET SCRIPT`)
  console.log(`=================================${colors.reset}\n`)

  try {
    // First, let's check the current state
    console.log(`${colors.blue}Checking current blog posts...${colors.reset}`)
    
    // Count church/admin blog posts with their stats
    const churchBlogPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        stats: {
          select: {
            totalViews: true
          }
        }
      }
    })
    
    // Count user/community blog posts
    const userBlogPosts = await prisma.userBlogPost.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true
      }
    })
    
    const totalChurchViews = churchBlogPosts.reduce((sum, post) => sum + (post.stats?.totalViews || 0), 0)
    const totalUserViews = userBlogPosts.reduce((sum, post) => sum + post.viewCount, 0)
    const totalViews = totalChurchViews + totalUserViews
    
    console.log(`\n${colors.bright}Current Statistics:${colors.reset}`)
    console.log(`├─ Church/Admin Blog Posts: ${colors.yellow}${churchBlogPosts.length}${colors.reset} posts`)
    console.log(`│  └─ Total Views: ${colors.yellow}${totalChurchViews.toLocaleString()}${colors.reset}`)
    console.log(`├─ Community/User Blog Posts: ${colors.yellow}${userBlogPosts.length}${colors.reset} posts`)
    console.log(`│  └─ Total Views: ${colors.yellow}${totalUserViews.toLocaleString()}${colors.reset}`)
    console.log(`└─ Combined Total Views: ${colors.bright}${colors.yellow}${totalViews.toLocaleString()}${colors.reset}`)
    
    if (totalViews === 0) {
      console.log(`\n${colors.green}✓ All view counts are already at 0. No action needed.${colors.reset}`)
      rl.close()
      await prisma.$disconnect()
      return
    }
    
    // Find top viewed church posts
    const topChurchPosts = churchBlogPosts
      .filter(post => (post.stats?.totalViews || 0) > 0)
      .sort((a, b) => (b.stats?.totalViews || 0) - (a.stats?.totalViews || 0))
      .slice(0, 5)
    
    // Find top viewed user posts
    const topUserPosts = userBlogPosts
      .filter(post => post.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
    
    console.log(`\n${colors.bright}Top Viewed Posts (to be reset):${colors.reset}`)
    
    if (topChurchPosts.length > 0) {
      console.log(`\n${colors.cyan}Church/Admin Posts:${colors.reset}`)
      topChurchPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. ${colors.cyan}${post.title}${colors.reset}`)
        console.log(`     └─ ${colors.yellow}${(post.stats?.totalViews || 0).toLocaleString()}${colors.reset} views`)
      })
    }
    
    if (topUserPosts.length > 0) {
      console.log(`\n${colors.cyan}Community/User Posts:${colors.reset}`)
      topUserPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. ${colors.cyan}${post.title}${colors.reset}`)
        console.log(`     └─ ${colors.yellow}${post.viewCount.toLocaleString()}${colors.reset} views`)
      })
    }
    
    // Confirmation prompt
    console.log(`\n${colors.yellow}${colors.bright}⚠️  WARNING: This action will reset ALL view counts to 0${colors.reset}`)
    console.log(`${colors.yellow}This will affect:${colors.reset}`)
    console.log(`  • ${churchBlogPosts.length} church/admin blog posts`)
    console.log(`  • ${userBlogPosts.length} community/user blog posts`)
    console.log(`  • Total of ${colors.red}${totalViews.toLocaleString()}${colors.reset} views will be reset to 0`)
    console.log(`\n${colors.cyan}Note: No other data will be modified. Only view count fields will be changed.${colors.reset}`)
    
    const answer = await askQuestion(`\n${colors.bright}Do you want to proceed? (type 'yes' to confirm, anything else to cancel): ${colors.reset}`)
    
    if (answer.toLowerCase() !== 'yes') {
      console.log(`\n${colors.green}✓ Operation cancelled. No changes were made.${colors.reset}`)
      rl.close()
      await prisma.$disconnect()
      return
    }
    
    // Proceed with reset
    console.log(`\n${colors.blue}Resetting view counts...${colors.reset}`)
    
    // Create a backup log of current view counts
    const timestamp = new Date().toISOString()
    console.log(`\n${colors.cyan}Creating backup log...${colors.reset}`)
    console.log(`Timestamp: ${timestamp}`)
    
    // Reset church/admin blog post view counts through BlogPostStats
    console.log(`${colors.blue}Resetting church/admin blog post views...${colors.reset}`)
    const churchUpdateResult = await prisma.blogPostStats.updateMany({
      data: {
        totalViews: 0,
        uniqueViews: 0,
        registeredViews: 0,
        anonymousViews: 0,
        dailyViews: {},
        hourlyViews: {},
        lastViewedAt: null
      }
    })
    console.log(`${colors.green}✓${colors.reset} Reset ${colors.yellow}${churchUpdateResult.count}${colors.reset} church/admin blog post stats`)
    
    // Reset user/community blog post view counts
    console.log(`${colors.blue}Resetting community/user blog post views...${colors.reset}`)
    const userUpdateResult = await prisma.userBlogPost.updateMany({
      data: {
        viewCount: 0,
        lastViewedAt: null
      }
    })
    console.log(`${colors.green}✓${colors.reset} Reset ${colors.yellow}${userUpdateResult.count}${colors.reset} community/user blog posts`)
    
    // Also delete all BlogPostView records for a complete reset
    console.log(`${colors.blue}Cleaning up view history records...${colors.reset}`)
    const viewRecordsDeleted = await prisma.blogPostView.deleteMany({})
    console.log(`${colors.green}✓${colors.reset} Deleted ${colors.yellow}${viewRecordsDeleted.count}${colors.reset} view history records`)
    
    // Verify the reset
    console.log(`\n${colors.blue}Verifying reset...${colors.reset}`)
    
    const verifyChurch = await prisma.blogPostStats.aggregate({
      _sum: {
        totalViews: true
      }
    })
    
    const verifyUser = await prisma.userBlogPost.aggregate({
      _sum: {
        viewCount: true
      }
    })
    
    const newTotalChurchViews = verifyChurch._sum.totalViews || 0
    const newTotalUserViews = verifyUser._sum.viewCount || 0
    const newTotalViews = newTotalChurchViews + newTotalUserViews
    
    if (newTotalViews === 0) {
      console.log(`\n${colors.green}${colors.bright}✓ SUCCESS: All view counts have been reset to 0${colors.reset}`)
      console.log(`\n${colors.bright}Summary:${colors.reset}`)
      console.log(`├─ Church/Admin posts reset: ${colors.green}${churchUpdateResult.count}${colors.reset}`)
      console.log(`├─ Community/User posts reset: ${colors.green}${userUpdateResult.count}${colors.reset}`)
      console.log(`├─ View history records deleted: ${colors.green}${viewRecordsDeleted.count}${colors.reset}`)
      console.log(`├─ Total views reset: ${colors.green}${totalViews.toLocaleString()}${colors.reset}`)
      console.log(`└─ Operation completed at: ${colors.cyan}${new Date().toLocaleString()}${colors.reset}`)
    } else {
      console.log(`${colors.red}⚠️  Warning: Verification failed. Some view counts may not have been reset.${colors.reset}`)
      console.log(`Remaining total views: ${newTotalViews}`)
    }
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ ERROR:${colors.reset}`, error)
    console.log(`\n${colors.yellow}Reset operation may be incomplete due to the error.${colors.reset}`)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Run the script
console.log(`${colors.bright}Starting View Count Reset Script...${colors.reset}`)
resetViewCounts()
  .then(() => {
    console.log(`\n${colors.cyan}Script execution completed.${colors.reset}\n`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error)
    process.exit(1)
  })
