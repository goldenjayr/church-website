/**
 * Script to backup current view counts to a JSON file
 * Run this before resetting view counts if you want to preserve the data
 * 
 * Usage: npx tsx scripts/backup-view-counts.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

interface ViewCountBackup {
  timestamp: string
  statistics: {
    totalChurchPosts: number
    totalUserPosts: number
    totalChurchViews: number
    totalUserViews: number
    totalViews: number
  }
  churchBlogPosts: Array<{
    id: string
    title: string
    slug: string
    viewCount: number
  }>
  userBlogPosts: Array<{
    id: string
    title: string
    slug: string
    viewCount: number
  }>
}

async function backupViewCounts() {
  console.log(`\n${colors.cyan}${colors.bright}=================================`)
  console.log(`VIEW COUNT BACKUP SCRIPT`)
  console.log(`=================================${colors.reset}\n`)

  try {
    console.log(`${colors.blue}Fetching current view counts...${colors.reset}`)
    
    // Fetch church/admin blog posts with view counts
    const churchBlogPosts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true
      },
      orderBy: {
        viewCount: 'desc'
      }
    })
    
    // Fetch user/community blog posts with view counts
    const userBlogPosts = await prisma.userBlogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true
      },
      orderBy: {
        viewCount: 'desc'
      }
    })
    
    const totalChurchViews = churchBlogPosts.reduce((sum, post) => sum + post.viewCount, 0)
    const totalUserViews = userBlogPosts.reduce((sum, post) => sum + post.viewCount, 0)
    const totalViews = totalChurchViews + totalUserViews
    
    console.log(`\n${colors.bright}Current Statistics:${colors.reset}`)
    console.log(`├─ Church/Admin Blog Posts: ${colors.yellow}${churchBlogPosts.length}${colors.reset} posts`)
    console.log(`│  └─ Total Views: ${colors.yellow}${totalChurchViews.toLocaleString()}${colors.reset}`)
    console.log(`├─ Community/User Blog Posts: ${colors.yellow}${userBlogPosts.length}${colors.reset} posts`)
    console.log(`│  └─ Total Views: ${colors.yellow}${totalUserViews.toLocaleString()}${colors.reset}`)
    console.log(`└─ Combined Total Views: ${colors.bright}${colors.yellow}${totalViews.toLocaleString()}${colors.reset}`)
    
    // Create backup data structure
    const timestamp = new Date().toISOString()
    const backupData: ViewCountBackup = {
      timestamp,
      statistics: {
        totalChurchPosts: churchBlogPosts.length,
        totalUserPosts: userBlogPosts.length,
        totalChurchViews,
        totalUserViews,
        totalViews
      },
      churchBlogPosts: churchBlogPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        viewCount: post.viewCount
      })),
      userBlogPosts: userBlogPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        viewCount: post.viewCount
      }))
    }
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups', 'view-counts')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
      console.log(`\n${colors.green}Created backups directory: ${backupsDir}${colors.reset}`)
    }
    
    // Generate filename with timestamp
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].slice(0, 8)
    const filename = `view-counts-backup-${dateStr}-${timeStr}.json`
    const filepath = path.join(backupsDir, filename)
    
    // Write backup file
    console.log(`\n${colors.blue}Creating backup file...${colors.reset}`)
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2))
    
    console.log(`${colors.green}${colors.bright}✓ SUCCESS: Backup created successfully!${colors.reset}`)
    console.log(`\n${colors.bright}Backup Details:${colors.reset}`)
    console.log(`├─ File: ${colors.cyan}${filename}${colors.reset}`)
    console.log(`├─ Location: ${colors.cyan}${backupsDir}${colors.reset}`)
    console.log(`├─ Size: ${colors.yellow}${(fs.statSync(filepath).size / 1024).toFixed(2)} KB${colors.reset}`)
    console.log(`└─ Timestamp: ${colors.cyan}${timestamp}${colors.reset}`)
    
    // Show top 5 most viewed posts in backup
    const allPosts = [
      ...churchBlogPosts.map(p => ({ ...p, type: 'Church' })),
      ...userBlogPosts.map(p => ({ ...p, type: 'Community' }))
    ].sort((a, b) => b.viewCount - a.viewCount)
    
    const topPosts = allPosts.slice(0, 5).filter(p => p.viewCount > 0)
    
    if (topPosts.length > 0) {
      console.log(`\n${colors.bright}Top 5 Most Viewed Posts (backed up):${colors.reset}`)
      topPosts.forEach((post, index) => {
        console.log(`${index + 1}. [${post.type}] "${post.title.substring(0, 50)}${post.title.length > 50 ? '...' : ''}" - ${colors.green}${post.viewCount} views${colors.reset}`)
      })
    }
    
    console.log(`\n${colors.cyan}You can now safely run the reset script if needed.${colors.reset}`)
    console.log(`${colors.cyan}To restore from this backup later, use: npx tsx scripts/restore-view-counts.ts ${filename}${colors.reset}`)
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ ERROR:${colors.reset}`, error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
console.log(`${colors.bright}Starting View Count Backup Script...${colors.reset}`)
backupViewCounts()
  .then(() => {
    console.log(`\n${colors.cyan}Script execution completed.${colors.reset}\n`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error)
    process.exit(1)
  })
