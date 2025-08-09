import { Redis } from '@upstash/redis';

// Lazy initialize Redis client to handle build time and missing env vars
let redis: Redis | null = null;

// Check if we're in static generation mode
function isStaticGeneration(): boolean {
  // During build, Next.js sets NODE_ENV to 'production' but we can check for build-specific conditions
  // If we're generating static pages, we should skip Redis
  return typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME;
}

function getRedisClient(): Redis | null {
  // Skip Redis during static generation
  if (isStaticGeneration()) {
    return null;
  }
  
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_RUNTIME) {
        console.error('[Redis] Missing required environment variables in production runtime');
      }
      return null;
    }
    
    try {
      redis = new Redis({ url, token });
    } catch (error) {
      console.error('[Redis] Failed to initialize client:', error);
      return null;
    }
  }
  return redis;
}

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60,           // 1 minute - for rapidly changing data
  MEDIUM: 300,         // 5 minutes - for moderately changing data
  LONG: 900,           // 15 minutes - for slowly changing data
  HOUR: 3600,          // 1 hour - for stable data
  DAY: 86400,          // 24 hours - for very stable data
  WEEK: 604800,        // 7 days - for static data
} as const;

export class RedisService {
  /**
   * Generic cache getter with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;
    
    try {
      const data = await client.get(key);
      if (data && typeof data === 'string') {
        try {
          return JSON.parse(data) as T;
        } catch {
          return data as T;
        }
      }
      return data as T;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Generic cache setter with TTL
   */
  static async set(key: string, value: any, ttlSeconds: number = CacheTTL.MEDIUM): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const dataToStore = typeof value === 'string' ? value : JSON.stringify(value);
      await client.set(key, dataToStore, { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cache entry
   */
  static async delete(key: string | string[]): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      if (Array.isArray(key)) {
        if (key.length === 0) return true;
        await client.del(...key);
      } else {
        await client.del(key);
      }
      return true;
    } catch (error) {
      console.error(`Redis DELETE error:`, error);
      return false;
    }
  }

  /**
   * Delete multiple cache entries by pattern
   * WARNING: Use sparingly as KEYS command can be expensive
   */
  static async deletePattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;
    
    try {
      // For Upstash, we need to use scan instead of keys for better performance
      const keys: string[] = [];
      let cursor = 0;
      
      do {
        const result = await client.scan(cursor, { match: pattern, count: 100 });
        cursor = result[0];
        keys.push(...(result[1] || []));
      } while (cursor !== 0);
      
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Redis DELETE pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate related caches
   */
  static async invalidateCache(patterns: string[]): Promise<void> {
    try {
      for (const pattern of patterns) {
        await this.deletePattern(pattern);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Check rate limit with sliding window
   */
  static async checkRateLimit(
    identifier: string,
    resource: string,
    maxRequests: number = 10,
    windowSeconds: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const client = getRedisClient();
    if (!client) {
      // If Redis is not available, allow the request
      return { allowed: true, remaining: maxRequests, resetIn: 0 };
    }
    
    const key = `ratelimit:${resource}:${identifier}`;
    
    try {
      const count = await client.incr(key);
      
      if (count === 1) {
        await client.expire(key, windowSeconds);
      }
      
      const ttl = await client.ttl(key);
      
      return {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetIn: ttl > 0 ? ttl : windowSeconds
      };
    } catch (error) {
      console.error(`Rate limit check error:`, error);
      // Allow request on error to avoid blocking users
      return { allowed: true, remaining: maxRequests, resetIn: 0 };
    }
  }

  /**
   * Cache with automatic fetch if miss (with stale-while-revalidate pattern)
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CacheTTL.MEDIUM,
    options?: {
      staleTTL?: number; // How long to serve stale data while revalidating
      lockTimeout?: number; // Prevent thundering herd
    }
  ): Promise<T> {
    const client = getRedisClient();
    
    // If Redis is not available, always fetch fresh data
    if (!client) {
      return fetcher();
    }
    
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        // Check if we should revalidate in background
        if (options?.staleTTL) {
          const staleKey = `${key}:stale`;
          const isStale = await this.get(staleKey);
          if (!isStale) {
            // Set stale marker and revalidate in background
            await this.set(staleKey, '1', options.staleTTL);
            fetcher().then(freshData => {
              this.set(key, freshData, ttlSeconds);
            }).catch(console.error);
          }
        }
        return cached;
      }

      // Prevent thundering herd with lock
      if (options?.lockTimeout) {
        const lockKey = `${key}:lock`;
        const acquired = await this.setNX(lockKey, '1', options.lockTimeout);
        
        if (!acquired) {
          // Another process is fetching, wait a bit and try cache again
          await new Promise(resolve => setTimeout(resolve, 100));
          const cached = await this.get<T>(key);
          if (cached !== null) return cached;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Store in cache
      await this.set(key, freshData, ttlSeconds);
      
      return freshData;
    } catch (error) {
      console.error(`Cache getOrSet error for key ${key}:`, error);
      // Return fresh data on error
      return fetcher();
    }
  }

  /**
   * Session management with automatic refresh
   */
  static async setSession(
    userId: string, 
    sessionData: any, 
    ttlSeconds: number = CacheTTL.DAY
  ): Promise<string> {
    const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionKey = `session:${sessionId}`;
    
    await this.set(sessionKey, {
      ...sessionData,
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }, ttlSeconds);
    
    // Also store user's active sessions
    const client = getRedisClient();
    if (client) {
      const userSessionsKey = `user:sessions:${userId}`;
      await client.sadd(userSessionsKey, sessionId);
      await client.expire(userSessionsKey, ttlSeconds);
    }
    
    return sessionId;
  }

  static async getSession<T = any>(sessionId: string): Promise<T | null> {
    const sessionKey = `session:${sessionId}`;
    const session = await this.get<T>(sessionKey);
    
    if (session) {
      // Update last activity
      await this.set(sessionKey, {
        ...session,
        lastActivity: new Date().toISOString()
      }, CacheTTL.DAY);
    }
    
    return session;
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    const sessionKey = `session:${sessionId}`;
    const session = await this.get<any>(sessionKey);
    
    if (session?.userId) {
      // Remove from user's active sessions
      const client = getRedisClient();
      if (client) {
        const userSessionsKey = `user:sessions:${session.userId}`;
        await client.srem(userSessionsKey, sessionId);
      }
    }
    
    return this.delete(sessionKey);
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    
    const userSessionsKey = `user:sessions:${userId}`;
    const sessions = await client.smembers(userSessionsKey);
    
    if (sessions && sessions.length > 0) {
      const sessionKeys = sessions.map(sid => `session:${sid}`);
      await this.delete(sessionKeys);
      await this.delete(userSessionsKey);
    }
  }

  /**
   * Increment counter with automatic expiry
   */
  static async increment(
    key: string, 
    ttlSeconds?: number,
    incrementBy: number = 1
  ): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;
    
    try {
      const count = await client.incrby(key, incrementBy);
      if (ttlSeconds && count === incrementBy) {
        await client.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      console.error(`Redis INCREMENT error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set with NX (only if not exists) - useful for locks and deduplication
   */
  static async setNX(key: string, value: any, ttlSeconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const dataToStore = typeof value === 'string' ? value : JSON.stringify(value);
      const result = await client.set(key, dataToStore, { ex: ttlSeconds, nx: true });
      return result === 'OK';
    } catch (error) {
      console.error(`Redis SETNX error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Batch get multiple keys efficiently
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const client = getRedisClient();
    if (!client) return keys.map(() => null);
    
    try {
      if (keys.length === 0) return [];
      const values = await client.mget(...keys);
      return values.map(v => {
        if (v && typeof v === 'string') {
          try {
            return JSON.parse(v) as T;
          } catch {
            return v as T;
          }
        }
        return v as T | null;
      });
    } catch (error) {
      console.error(`Redis MGET error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Get TTL of a key
   */
  static async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return -1;
    
    try {
      return await client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Extend TTL of existing key
   */
  static async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const result = await client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Add to set (useful for tracking unique items)
   */
  static async sadd(key: string, member: string | string[], ttlSeconds?: number): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;
    
    try {
      const result = Array.isArray(member) 
        ? await client.sadd(key, ...member)
        : await client.sadd(key, member);
      
      if (ttlSeconds) {
        await client.expire(key, ttlSeconds);
      }
      
      return result;
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get all members of a set
   */
  static async smembers(key: string): Promise<string[]> {
    const client = getRedisClient();
    if (!client) return [];
    
    try {
      const members = await client.smembers(key);
      return members || [];
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Check if member exists in set
   */
  static async sismember(key: string, member: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const result = await client.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Health check
   */
  static async ping(): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  /**
   * Get Redis info (for monitoring)
   */
  static async getInfo(): Promise<{
    connected: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const start = Date.now();
      const connected = await this.ping();
      const latency = Date.now() - start;
      
      return { connected, latency };
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export cache key generators for consistency
export const CacheKeys = {
  // Blog
  blogPost: (slug: string) => `blog:post:${slug}`,
  blogPostById: (id: string) => `blog:post:id:${id}`,
  blogList: (category?: string, page: number = 1) => 
    category ? `blog:list:${category}:${page}` : `blog:list:all:${page}`,
  blogStats: (postId: string) => `blog:stats:${postId}`,
  blogTrending: () => 'blog:trending',
  blogCategories: () => 'blog:categories',
  blogFeatured: () => 'blog:featured',
  blogRelated: (postId: string) => `blog:related:${postId}`,
  
  // Events
  eventList: () => 'events:list:all',
  eventListUpcoming: () => 'events:list:upcoming',
  event: (id: string) => `event:${id}`,
  eventRsvps: (eventId: string) => `event:rsvps:${eventId}`,
  eventRsvpCheck: (eventId: string, email: string) => `event:rsvp:${eventId}:${email}`,
  
  // Users
  userSession: (sessionId: string) => `session:${sessionId}`,
  userSessions: (userId: string) => `user:sessions:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userAuth: (userId: string) => `user:auth:${userId}`,
  
  // Doctrines
  doctrineList: () => 'doctrines:list:all',
  doctrine: (id: string) => `doctrine:${id}`,
  doctrineCategories: () => 'doctrines:categories',
  
  // Admin
  adminDashboard: () => 'admin:dashboard:stats',
  adminStats: (type: string) => `admin:stats:${type}`,
  adminEventStats: (eventId: string) => `admin:event:stats:${eventId}`,
  
  // Rate limiting
  rateLimit: (resource: string, identifier: string) => 
    `ratelimit:${resource}:${identifier}`,
  
  // Forms
  formSubmission: (type: string, identifier: string) => 
    `form:${type}:${identifier}`,
  contactMessage: (email: string) => `contact:${email}`,
  
  // General
  homepage: () => 'page:homepage',
  aboutPage: () => 'page:about',
  
  // Search
  searchResults: (query: string, type: string) => 
    `search:${type}:${Buffer.from(query).toString('base64')}`,
};

// Rate limit configurations
export const RateLimits = {
  api: { max: 100, window: 60 },           // 100 requests per minute
  auth: { max: 5, window: 300 },           // 5 attempts per 5 minutes
  contact: { max: 3, window: 3600 },       // 3 messages per hour
  rsvp: { max: 5, window: 3600 },          // 5 RSVPs per hour
  donation: { max: 10, window: 3600 },     // 10 attempts per hour
  passwordReset: { max: 3, window: 3600 }, // 3 requests per hour
  search: { max: 30, window: 60 },         // 30 searches per minute
} as const;

export default getRedisClient;
