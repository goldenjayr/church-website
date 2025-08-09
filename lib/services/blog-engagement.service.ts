import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import UAParser from 'ua-parser-js';
import { Redis } from '@upstash/redis';
import requestIp from 'request-ip';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface ViewTrackingData {
  blogPostId: string;
  userId?: string | null;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  sessionId: string;
  viewDuration?: number;
}

interface EngagementMetrics {
  scrollDepth: number;
  timeOnPage: number;
  clicks: number;
  shares: number;
}

export class BlogEngagementService {
  /**
   * Track a view for a blog post with anti-bot and rate limiting
   */
  static async trackView(data: ViewTrackingData): Promise<{ success: boolean; reason?: string }> {
    try {
      // Check if it's a bot
      const isBot = this.detectBot(data.userAgent);
      if (isBot) {
        return { success: false, reason: 'Bot detected' };
      }

      // Rate limiting check
      const rateLimitKey = `view:${data.ipAddress}:${data.blogPostId}`;
      const viewCount = await redis.incr(rateLimitKey);
      
      if (viewCount === 1) {
        // Set expiry for 1 hour
        await redis.expire(rateLimitKey, 3600);
      } else if (viewCount > 10) {
        // More than 10 views from same IP in an hour
        return { success: false, reason: 'Rate limit exceeded' };
      }

      // Check for duplicate view in the last 30 minutes
      const duplicateKey = `duplicate:${data.sessionId}:${data.blogPostId}`;
      const isDuplicate = await redis.get(duplicateKey);
      
      if (isDuplicate) {
        return { success: false, reason: 'Duplicate view' };
      }

      // Mark this view to prevent duplicates
      await redis.set(duplicateKey, '1', { ex: 1800 }); // 30 minutes

      // Parse user agent for analytics
      const parser = new UAParser(data.userAgent);
      const browser = parser.getBrowser();
      const os = parser.getOS();
      const device = parser.getDevice();

      // Record the view
      await prisma.blogPostView.create({
        data: {
          blogPostId: data.blogPostId,
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referrer: data.referrer,
          isBot: false,
          viewDuration: data.viewDuration,
        },
      });

      // Update aggregated stats asynchronously
      this.updateBlogPostStats(data.blogPostId);

      return { success: true };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { success: false, reason: 'Internal error' };
    }
  }

  /**
   * Toggle like for a blog post
   */
  static async toggleLike(blogPostId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    try {
      const existingLike = await prisma.blogPostLike.findUnique({
        where: {
          blogPostId_userId: {
            blogPostId,
            userId,
          },
        },
      });

      let liked = false;

      if (existingLike) {
        // Unlike
        await prisma.blogPostLike.delete({
          where: { id: existingLike.id },
        });
      } else {
        // Like
        await prisma.blogPostLike.create({
          data: {
            blogPostId,
            userId,
          },
        });
        liked = true;
      }

      // Get updated like count
      const likeCount = await prisma.blogPostLike.count({
        where: { blogPostId },
      });

      // Update stats
      await prisma.blogPostStats.upsert({
        where: { blogPostId },
        create: {
          blogPostId,
          totalLikes: likeCount,
          totalViews: 0,
          uniqueViews: 0,
          registeredViews: 0,
          anonymousViews: 0,
          updatedAt: new Date(),
        },
        update: {
          totalLikes: likeCount,
          updatedAt: new Date(),
        },
      });

      // Clear cache
      await redis.del(`blog:stats:${blogPostId}`);

      return { liked, likeCount };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Track user engagement metrics
   */
  static async trackEngagement(
    blogPostId: string,
    sessionId: string,
    metrics: EngagementMetrics,
    userId?: string
  ): Promise<void> {
    try {
      await prisma.userEngagement.upsert({
        where: {
          sessionId_blogPostId: {
            sessionId,
            blogPostId,
          },
        },
        create: {
          userId,
          sessionId,
          blogPostId,
          scrollDepth: metrics.scrollDepth,
          timeOnPage: metrics.timeOnPage,
          clicks: metrics.clicks,
          shares: metrics.shares,
        },
        update: {
          scrollDepth: Math.max(metrics.scrollDepth),
          timeOnPage: metrics.timeOnPage,
          clicks: { increment: metrics.clicks },
          shares: { increment: metrics.shares },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  /**
   * Get blog post stats with caching
   */
  static async getBlogPostStats(blogPostId: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = `blog:stats:${blogPostId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get from database
      let stats = await prisma.blogPostStats.findUnique({
        where: { blogPostId },
      });

      if (!stats) {
        // Create initial stats if not exists
        const [totalViews, uniqueViews, totalLikes] = await Promise.all([
          prisma.blogPostView.count({ where: { blogPostId } }),
          prisma.blogPostView.groupBy({
            by: ['sessionId'],
            where: { blogPostId },
            _count: true,
          }).then(groups => groups.length),
          prisma.blogPostLike.count({ where: { blogPostId } }),
        ]);

        stats = await prisma.blogPostStats.create({
          data: {
            blogPostId,
            totalViews,
            uniqueViews,
            totalLikes,
            registeredViews: 0,
            anonymousViews: totalViews,
            updatedAt: new Date(),
          },
        });
      }

      // Cache for 5 minutes
      await redis.set(cacheKey, JSON.stringify(stats), { ex: 300 });

      return stats;
    } catch (error) {
      console.error('Error getting blog post stats:', error);
      return null;
    }
  }

  /**
   * Get trending posts based on recent engagement
   */
  static async getTrendingPosts(limit: number = 5): Promise<any[]> {
    try {
      const cacheKey = 'blog:trending';
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached as string);
      }

      // Get posts with most views in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const trending = await prisma.$queryRaw`
        SELECT 
          bp.id,
          bp.title,
          bp.slug,
          bp.excerpt,
          bp."imageUrl",
          COUNT(DISTINCT bpv."sessionId") as "uniqueViews",
          COUNT(bpl.id) as "likeCount"
        FROM "BlogPost" bp
        LEFT JOIN "BlogPostView" bpv ON bp.id = bpv."blogPostId" 
          AND bpv."createdAt" > ${sevenDaysAgo}
        LEFT JOIN "BlogPostLike" bpl ON bp.id = bpl."blogPostId"
        WHERE bp.published = true
        GROUP BY bp.id
        ORDER BY "uniqueViews" DESC, "likeCount" DESC
        LIMIT ${limit}
      `;

      // Cache for 1 hour
      await redis.set(cacheKey, JSON.stringify(trending), { ex: 3600 });

      return trending;
    } catch (error) {
      console.error('Error getting trending posts:', error);
      return [];
    }
  }

  /**
   * Helper: Detect if user agent is a bot
   */
  private static detectBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /slackbot/i,
      /telegram/i,
      /discord/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Helper: Update blog post statistics
   */
  private static async updateBlogPostStats(blogPostId: string): Promise<void> {
    try {
      const [totalViews, uniqueViews, registeredViews, totalLikes] = await Promise.all([
        prisma.blogPostView.count({ where: { blogPostId } }),
        prisma.blogPostView.groupBy({
          by: ['sessionId'],
          where: { blogPostId },
          _count: true,
        }).then(groups => groups.length),
        prisma.blogPostView.count({ 
          where: { 
            blogPostId,
            userId: { not: null }
          } 
        }),
        prisma.blogPostLike.count({ where: { blogPostId } }),
      ]);

      const anonymousViews = totalViews - registeredViews;

      // Calculate average view duration
      const avgDuration = await prisma.blogPostView.aggregate({
        where: { 
          blogPostId,
          viewDuration: { not: null }
        },
        _avg: { viewDuration: true },
      });

      await prisma.blogPostStats.upsert({
        where: { blogPostId },
        create: {
          blogPostId,
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration: avgDuration._avg.viewDuration || 0,
          lastViewedAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          totalViews,
          uniqueViews,
          registeredViews,
          anonymousViews,
          totalLikes,
          avgViewDuration: avgDuration._avg.viewDuration || 0,
          lastViewedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Clear cache
      await redis.del(`blog:stats:${blogPostId}`);
    } catch (error) {
      console.error('Error updating blog post stats:', error);
    }
  }

  /**
   * Generate session ID for anonymous users
   */
  static generateSessionId(ipAddress: string, userAgent: string): string {
    const data = `${ipAddress}-${userAgent}-${new Date().toDateString()}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Track a view for a community blog post with anti-bot and rate limiting
   */
  static async trackCommunityView(data: ViewTrackingData): Promise<{ success: boolean; reason?: string }> {
    try {
      // Check if it's a bot
      const isBot = this.detectBot(data.userAgent);
      if (isBot) {
        return { success: false, reason: 'Bot detected' };
      }

      // Rate limiting check
      const rateLimitKey = `community-view:${data.ipAddress}:${data.blogPostId}`;
      const viewCount = await redis.incr(rateLimitKey);
      
      if (viewCount === 1) {
        // Set expiry for 1 hour
        await redis.expire(rateLimitKey, 3600);
      } else if (viewCount > 10) {
        // More than 10 views from same IP in an hour
        return { success: false, reason: 'Rate limit exceeded' };
      }

      // Check for duplicate view in the last 30 minutes
      const duplicateKey = `community-duplicate:${data.sessionId}:${data.blogPostId}`;
      const isDuplicate = await redis.get(duplicateKey);
      
      if (isDuplicate) {
        return { success: false, reason: 'Duplicate view' };
      }

      // Mark this view to prevent duplicates
      await redis.set(duplicateKey, '1', { ex: 1800 }); // 30 minutes

      // For community blogs, we're updating the view count directly in the route
      // This method just handles the anti-bot and rate limiting
      return { success: true };
    } catch (error) {
      console.error('Error tracking community view:', error);
      return { success: false, reason: 'Internal error' };
    }
  }
}
