#!/usr/bin/env tsx
/**
 * Test script for Redis implementation
 * Run with: tsx scripts/test-redis-implementation.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { RedisService, CacheKeys, CacheTTL, RateLimits } from '../lib/services/redis.service';
import { CacheInvalidationService } from '../lib/services/cache-invalidation.service';
import chalk from 'chalk';

const log = {
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  title: (msg: string) => console.log(chalk.bold.cyan(`\n${msg}`)),
};

async function testRedisConnection() {
  log.title('Testing Redis Connection');
  
  try {
    const isConnected = await RedisService.ping();
    if (isConnected) {
      log.success('Redis connected successfully');
      
      const info = await RedisService.getInfo();
      log.info(`Latency: ${info.latency}ms`);
      return true;
    } else {
      log.error('Redis connection failed');
      return false;
    }
  } catch (error) {
    log.error(`Connection error: ${error}`);
    return false;
  }
}

async function testBasicOperations() {
  log.title('Testing Basic Redis Operations');
  
  try {
    // Test SET
    const setResult = await RedisService.set('test:key', { value: 'test data' }, 60);
    if (setResult) {
      log.success('SET operation successful');
    } else {
      log.error('SET operation failed');
      return false;
    }
    
    // Test GET
    const getResult = await RedisService.get<{ value: string }>('test:key');
    if (getResult?.value === 'test data') {
      log.success('GET operation successful');
    } else {
      log.error('GET operation failed');
      return false;
    }
    
    // Test EXISTS
    const exists = await RedisService.exists('test:key');
    if (exists) {
      log.success('EXISTS operation successful');
    } else {
      log.error('EXISTS operation failed');
      return false;
    }
    
    // Test DELETE
    const deleteResult = await RedisService.delete('test:key');
    if (deleteResult) {
      log.success('DELETE operation successful');
    } else {
      log.error('DELETE operation failed');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Basic operations error: ${error}`);
    return false;
  }
}

async function testCaching() {
  log.title('Testing Cache Operations');
  
  try {
    let fetchCount = 0;
    const fetcher = async () => {
      fetchCount++;
      return { data: 'fetched data', timestamp: Date.now() };
    };
    
    // First call should fetch
    const result1 = await RedisService.getOrSet('test:cache', fetcher, 60);
    log.info(`First call - Fetch count: ${fetchCount}`);
    
    // Second call should use cache
    const result2 = await RedisService.getOrSet('test:cache', fetcher, 60);
    log.info(`Second call - Fetch count: ${fetchCount}`);
    
    if (fetchCount === 1 && result1.timestamp === result2.timestamp) {
      log.success('Cache getOrSet working correctly');
    } else {
      log.error('Cache getOrSet not working as expected');
      return false;
    }
    
    // Clean up
    await RedisService.delete('test:cache');
    
    return true;
  } catch (error) {
    log.error(`Caching error: ${error}`);
    return false;
  }
}

async function testRateLimiting() {
  log.title('Testing Rate Limiting');
  
  try {
    const identifier = 'test-user';
    const resource = 'test-api';
    
    // Clear any existing rate limit
    await RedisService.delete(CacheKeys.rateLimit(resource, identifier));
    
    // Test within limit
    for (let i = 1; i <= 5; i++) {
      const result = await RedisService.checkRateLimit(identifier, resource, 5, 60);
      if (i <= 5) {
        if (!result.allowed) {
          log.error(`Request ${i} should be allowed but was blocked`);
          return false;
        }
        log.info(`Request ${i}/5 allowed. Remaining: ${result.remaining}`);
      }
    }
    
    // Test exceeding limit
    const result = await RedisService.checkRateLimit(identifier, resource, 5, 60);
    if (result.allowed) {
      log.error('Request 6 should be blocked but was allowed');
      return false;
    } else {
      log.success(`Rate limiting working correctly. Reset in ${result.resetIn}s`);
    }
    
    // Clean up
    await RedisService.delete(CacheKeys.rateLimit(resource, identifier));
    
    return true;
  } catch (error) {
    log.error(`Rate limiting error: ${error}`);
    return false;
  }
}

async function testSessionManagement() {
  log.title('Testing Session Management');
  
  try {
    const userId = 'test-user-123';
    const sessionData = {
      email: 'test@example.com',
      role: 'USER',
    };
    
    // Create session
    const sessionId = await RedisService.setSession(userId, sessionData, 60);
    log.info(`Session created: ${sessionId}`);
    
    // Get session
    const retrievedSession = await RedisService.getSession(sessionId);
    if (retrievedSession && retrievedSession.email === sessionData.email) {
      log.success('Session retrieved successfully');
    } else {
      log.error('Session retrieval failed');
      return false;
    }
    
    // Delete session
    const deleteResult = await RedisService.deleteSession(sessionId);
    if (deleteResult) {
      log.success('Session deleted successfully');
    } else {
      log.error('Session deletion failed');
      return false;
    }
    
    // Clean up user sessions
    await RedisService.deleteAllUserSessions(userId);
    
    return true;
  } catch (error) {
    log.error(`Session management error: ${error}`);
    return false;
  }
}

async function testCacheKeys() {
  log.title('Testing Cache Key Generation');
  
  try {
    const tests = [
      { key: CacheKeys.blogPost('test-slug'), expected: 'blog:post:test-slug' },
      { key: CacheKeys.eventList(), expected: 'events:list:all' },
      { key: CacheKeys.userProfile('user123'), expected: 'user:profile:user123' },
      { key: CacheKeys.doctrineList(), expected: 'doctrines:list:all' },
    ];
    
    let allPassed = true;
    for (const test of tests) {
      if (test.key === test.expected) {
        log.success(`Key generation: ${test.expected}`);
      } else {
        log.error(`Key generation failed: Expected ${test.expected}, got ${test.key}`);
        allPassed = false;
      }
    }
    
    return allPassed;
  } catch (error) {
    log.error(`Cache key generation error: ${error}`);
    return false;
  }
}

async function testCacheInvalidation() {
  log.title('Testing Cache Invalidation');
  
  try {
    // Set some test cache entries
    await RedisService.set(CacheKeys.blogPost('test-post'), { title: 'Test Post' }, 60);
    await RedisService.set(CacheKeys.blogList(), [{ id: 1 }], 60);
    await RedisService.set(CacheKeys.blogFeatured(), [{ id: 2 }], 60);
    
    // Test blog cache invalidation
    await CacheInvalidationService.invalidateBlogCache({ slug: 'test-post' });
    
    const blogPost = await RedisService.get(CacheKeys.blogPost('test-post'));
    const blogList = await RedisService.get(CacheKeys.blogList());
    
    if (!blogPost && !blogList) {
      log.success('Blog cache invalidation successful');
    } else {
      log.error('Blog cache invalidation failed');
      return false;
    }
    
    // Set event cache
    await RedisService.set(CacheKeys.event('event123'), { title: 'Test Event' }, 60);
    await RedisService.set(CacheKeys.eventList(), [{ id: 1 }], 60);
    
    // Test event cache invalidation
    await CacheInvalidationService.invalidateEventCache({ eventId: 'event123' });
    
    const event = await RedisService.get(CacheKeys.event('event123'));
    const eventList = await RedisService.get(CacheKeys.eventList());
    
    if (!event && !eventList) {
      log.success('Event cache invalidation successful');
    } else {
      log.error('Event cache invalidation failed');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Cache invalidation error: ${error}`);
    return false;
  }
}

async function testSetOperations() {
  log.title('Testing Set Operations');
  
  try {
    const setKey = 'test:set';
    
    // Add members to set
    await RedisService.sadd(setKey, ['member1', 'member2', 'member3'], 60);
    log.info('Added members to set');
    
    // Check if member exists
    const exists = await RedisService.sismember(setKey, 'member2');
    if (exists) {
      log.success('SISMEMBER operation successful');
    } else {
      log.error('SISMEMBER operation failed');
      return false;
    }
    
    // Get all members
    const members = await RedisService.smembers(setKey);
    if (members.length === 3) {
      log.success(`SMEMBERS operation successful: ${members.join(', ')}`);
    } else {
      log.error('SMEMBERS operation failed');
      return false;
    }
    
    // Clean up
    await RedisService.delete(setKey);
    
    return true;
  } catch (error) {
    log.error(`Set operations error: ${error}`);
    return false;
  }
}

async function runAllTests() {
  console.log(chalk.bold.magenta('\n🚀 Starting Redis Implementation Tests\n'));
  
  const tests = [
    { name: 'Redis Connection', fn: testRedisConnection },
    { name: 'Basic Operations', fn: testBasicOperations },
    { name: 'Caching', fn: testCaching },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Session Management', fn: testSessionManagement },
    { name: 'Cache Keys', fn: testCacheKeys },
    { name: 'Cache Invalidation', fn: testCacheInvalidation },
    { name: 'Set Operations', fn: testSetOperations },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
        log.warn(`${test.name} test failed`);
      }
    } catch (error) {
      failed++;
      log.error(`${test.name} test error: ${error}`);
    }
  }
  
  console.log(chalk.bold.magenta('\n📊 Test Results\n'));
  console.log(chalk.green(`  Passed: ${passed}`));
  console.log(chalk.red(`  Failed: ${failed}`));
  console.log(chalk.blue(`  Total:  ${tests.length}`));
  
  if (failed === 0) {
    console.log(chalk.bold.green('\n✨ All tests passed! Redis implementation is working correctly.\n'));
  } else {
    console.log(chalk.bold.red(`\n❌ ${failed} test(s) failed. Please check the implementation.\n`));
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
