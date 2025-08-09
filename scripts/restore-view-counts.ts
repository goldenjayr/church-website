/**
 * Script to restore view counts from a backup file
 * 
 * Usage: npx tsx scripts/restore-view-counts.ts [backup-filename]
 * Example: npx tsx scripts/restore-view-counts.ts view-counts-backup-2024-01-15-14-30-45.json
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
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

async function restoreViewCounts(filename?: string) {
  console.log(`\n${colors.cyan}${colors.bright}=================================`)
  console.log(`VIEW COUNT RESTORE SCRIPT`)
  console.log(`=================================${colors.reset}\n`)

  try {
    // Determine backup file to use
    const backupsDir = path.join(process.cwd(), 'backups', 'view-counts')
    let backupFile: string
    
    if (filename) {
      // Use provided filename
      backupFile = path.join(backupsDir, filename)
    } else {
      // Find the most recent backup
      if (!fs.existsSync(backupsDir)) {
        console.log(`${colors.red}❌ No backups directory found.${colors.reset}`)
        console.log(`${colors.yellow}Please run the backup script first: npx tsx scripts/backup-view-counts.ts${colors.reset}`)
        rl.close()
        await prisma.$disconnect()
        return
      }
      
      const files = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('view-counts-backup-') && f.endsWith('.json'))
        .sort()
        .reverse()
      
      if (files.length === 0) {
        console.log(`${colors.red}❌ No backup files found.${colors.reset}`)
        console.log(`${colors.yellow}Please run the backup script first: npx tsx scripts/backup-view-counts.ts${colors.reset}`)
        rl.close()
        await prisma.$disconnect()
        return
      }
      
      // Show available backups
      console.log(`${colors.bright}Available backup files:${colors.reset}`)
      files.slice(0, 10).forEach((file, index) => {
        const stats = fs.statSync(path.join(backupsDir, file))
        console.log(`${index + 1}. ${colors.cyan}${file}${colors.reset} (${(stats.size / 1024).toFixed(2)} KB)`)
      })
      
      const choice = await askQuestion(`\n${colors.bright}Enter the number of the backup to restore (or press Enter for the most recent): ${colors.reset}`)
      
      if (choice === '') {
        backupFile = path.join(backupsDir, files[0])
        filename = files[0]
      } else {
        const index = parseInt(choice) - 1
        if (index < 0 || index >= files.length) {
          console.log(`${colors.red}Invalid selection.${colors.reset}`)
          rl.close()
          await prisma.$disconnect()
          return
        }
        backupFile = path.join(backupsDir, files[index])
        filename = files[index]
      }
    }
    
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      console.log(`${colors.red}❌ Backup file not found: ${backupFile}${colors.reset}`)
      rl.close()
      await prisma.$disconnect()
      return
    }
    
    // Load backup data
    console.log(`\n${colors.blue}Loading backup file: ${colors.cyan}${filename}${colors.reset}`)
    const backupData: ViewCountBackup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'))
    
    console.log(`\n${colors.bright}Backup Information:${colors.reset}`)
    console.log(`├─ Created: ${colors.cyan}${backupData.timestamp}${colors.reset}`)
    console.log(`├─ Church Posts: ${colors.yellow}${backupData.statistics.totalChurchPosts}${colors.reset} (${backupData.statistics.totalChurchViews.toLocaleString()} views)`)
    console.log(`├─ Community Posts: ${colors.yellow}${backupData.statistics.totalUserPosts}${colors.reset} (${backupData.statistics.totalUserViews.toLocaleString()} views)`)
    console.log(`└─ Total Views to Restore: ${colors.bright}${colors.yellow}${backupData.statistics.totalViews.toLocaleString()}${colors.reset}`)
    
    // Show current state
    console.log(`\n${colors.blue}Checking current view counts...${colors.reset}`)
    
    const currentChurchViews = await prisma.blogPost.aggregate({
      _sum: { viewCount: true }
    })
    
    const currentUserViews = await prisma.userBlogPost.aggregate({
      _sum: { viewCount: true }
    })
    
    const currentTotal = (currentChurchViews._sum.viewCount || 0) + (currentUserViews._sum.viewCount || 0)
    
    console.log(`\n${colors.bright}Current View Counts:${colors.reset}`)
    console.log(`└─ Total: ${colors.yellow}${currentTotal.toLocaleString()}${colors.reset} views`)
    
    // Confirmation
    console.log(`\n${colors.yellow}${colors.bright}⚠️  WARNING: This will replace ALL current view counts with the backup data${colors.reset}`)
    console.log(`${colors.yellow}Current views (${currentTotal.toLocaleString()}) will be replaced with backup views (${backupData.statistics.totalViews.toLocaleString()})${colors.reset}`)
    
    const answer = await askQuestion(`\n${colors.bright}Do you want to proceed? (type 'yes' to confirm, anything else to cancel): ${colors.reset}`)
    
    if (answer.toLowerCase() !== 'yes') {
      console.log(`\n${colors.green}✓ Operation cancelled. No changes were made.${colors.reset}`)
      rl.close()
      await prisma.$disconnect()
      return
    }
    
    // Restore view counts
    console.log(`\n${colors.blue}Restoring view counts...${colors.reset}`)
    
    let churchUpdated = 0
    let churchSkipped = 0
    let userUpdated = 0
    let userSkipped = 0
    
    // Restore church/admin blog posts
    for (const post of backupData.churchBlogPosts) {
      try {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { viewCount: post.viewCount }
        })
        churchUpdated++
      } catch (error) {
        // Post might have been deleted
        churchSkipped++
      }
    }
    
    console.log(`${colors.green}✓${colors.reset} Church/Admin posts: ${colors.yellow}${churchUpdated}${colors.reset} updated, ${churchSkipped} skipped`)
    
    // Restore user/community blog posts
    for (const post of backupData.userBlogPosts) {
      try {
        await prisma.userBlogPost.update({
          where: { id: post.id },
          data: { viewCount: post.viewCount }
        })
        userUpdated++
      } catch (error) {
        // Post might have been deleted
        userSkipped++
      }
    }
    
    console.log(`${colors.green}✓${colors.reset} Community/User posts: ${colors.yellow}${userUpdated}${colors.reset} updated, ${userSkipped} skipped`)
    
    // Verify restoration
    console.log(`\n${colors.blue}Verifying restoration...${colors.reset}`)
    
    const newChurchViews = await prisma.blogPost.aggregate({
      _sum: { viewCount: true }
    })
    
    const newUserViews = await prisma.userBlogPost.aggregate({
      _sum: { viewCount: true }
    })
    
    const newTotal = (newChurchViews._sum.viewCount || 0) + (newUserViews._sum.viewCount || 0)
    
    console.log(`\n${colors.green}${colors.bright}✓ SUCCESS: View counts restored from backup!${colors.reset}`)
    console.log(`\n${colors.bright}Summary:${colors.reset}`)
    console.log(`├─ Posts Updated: ${colors.green}${churchUpdated + userUpdated}${colors.reset}`)
    console.log(`├─ Posts Skipped: ${colors.yellow}${churchSkipped + userSkipped}${colors.reset} (likely deleted)`)
    console.log(`├─ Previous Total Views: ${colors.yellow}${currentTotal.toLocaleString()}${colors.reset}`)
    console.log(`├─ Restored Total Views: ${colors.green}${newTotal.toLocaleString()}${colors.reset}`)
    console.log(`└─ Restored from: ${colors.cyan}${filename}${colors.reset}`)
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ ERROR:${colors.reset}`, error)
    console.log(`\n${colors.yellow}Restoration may be incomplete due to the error.${colors.reset}`)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Get filename from command line arguments
const filename = process.argv[2]

// Run the script
console.log(`${colors.bright}Starting View Count Restore Script...${colors.reset}`)
restoreViewCounts(filename)
  .then(() => {
    console.log(`\n${colors.cyan}Script execution completed.${colors.reset}\n`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error)
    process.exit(1)
  })
