#!/usr/bin/env tsx
/**
 * Script to clear Redis cache
 * Run with: npx tsx scripts/clear-redis-cache.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { CacheInvalidationService } from '../lib/services/cache-invalidation.service';
import { RedisService } from '../lib/services/redis.service';
import chalk from 'chalk';

async function clearCache() {
  console.log(chalk.yellow('\n🧹 Clearing Redis cache...\n'));

  try {
    // Test connection first
    const isConnected = await RedisService.ping();
    if (!isConnected) {
      console.error(chalk.red('❌ Failed to connect to Redis'));
      process.exit(1);
    }

    console.log(chalk.green('✓ Connected to Redis'));

    // Clear specific cache types
    console.log(chalk.blue('\nClearing cache by type:'));
    
    console.log(chalk.gray('  • Clearing blog cache...'));
    await CacheInvalidationService.invalidateBlogCache({ all: true });
    
    console.log(chalk.gray('  • Clearing event cache...'));
    await CacheInvalidationService.invalidateEventCache({ all: true });
    
    console.log(chalk.gray('  • Clearing doctrine cache...'));
    await CacheInvalidationService.invalidateDoctrineCache({ all: true });
    
    console.log(chalk.gray('  • Clearing admin cache...'));
    await CacheInvalidationService.invalidateAdminCache();
    
    console.log(chalk.gray('  • Clearing page cache...'));
    await CacheInvalidationService.invalidatePageCache('all');
    
    console.log(chalk.gray('  • Clearing search cache...'));
    await CacheInvalidationService.invalidateSearchCache();

    console.log(chalk.green('\n✨ Cache cleared successfully!\n'));
  } catch (error) {
    console.error(chalk.red('\n❌ Error clearing cache:'), error);
    process.exit(1);
  }
}

// Add command line argument support
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
${chalk.bold('Redis Cache Clear Script')}

Usage:
  npx tsx scripts/clear-redis-cache.ts [options]

Options:
  --help, -h     Show this help message
  --all          Clear all caches (default)
  --blog         Clear only blog cache
  --events       Clear only events cache
  --doctrines    Clear only doctrines cache
  --admin        Clear only admin cache
  --pages        Clear only page cache
  --search       Clear only search cache

Examples:
  npx tsx scripts/clear-redis-cache.ts          # Clear all caches
  npx tsx scripts/clear-redis-cache.ts --blog   # Clear only blog cache
`);
  process.exit(0);
}

async function clearSpecificCache() {
  try {
    const isConnected = await RedisService.ping();
    if (!isConnected) {
      console.error(chalk.red('❌ Failed to connect to Redis'));
      process.exit(1);
    }

    if (command === '--blog') {
      console.log(chalk.yellow('🧹 Clearing blog cache...'));
      await CacheInvalidationService.invalidateBlogCache({ all: true });
      console.log(chalk.green('✨ Blog cache cleared!'));
    } else if (command === '--events') {
      console.log(chalk.yellow('🧹 Clearing events cache...'));
      await CacheInvalidationService.invalidateEventCache({ all: true });
      console.log(chalk.green('✨ Events cache cleared!'));
    } else if (command === '--doctrines') {
      console.log(chalk.yellow('🧹 Clearing doctrines cache...'));
      await CacheInvalidationService.invalidateDoctrineCache({ all: true });
      console.log(chalk.green('✨ Doctrines cache cleared!'));
    } else if (command === '--admin') {
      console.log(chalk.yellow('🧹 Clearing admin cache...'));
      await CacheInvalidationService.invalidateAdminCache();
      console.log(chalk.green('✨ Admin cache cleared!'));
    } else if (command === '--pages') {
      console.log(chalk.yellow('🧹 Clearing page cache...'));
      await CacheInvalidationService.invalidatePageCache('all');
      console.log(chalk.green('✨ Page cache cleared!'));
    } else if (command === '--search') {
      console.log(chalk.yellow('🧹 Clearing search cache...'));
      await CacheInvalidationService.invalidateSearchCache();
      console.log(chalk.green('✨ Search cache cleared!'));
    } else {
      // Default to clearing all
      await clearCache();
    }
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

// Execute based on command
if (command && command.startsWith('--') && command !== '--all') {
  clearSpecificCache();
} else {
  clearCache();
}
