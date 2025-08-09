import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface ViewTrackingData {
  blogPostId: string;
  blogType: 'admin' | 'user';
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
  shares?: number;
}

interface BlogStats {
  totalViews: number;
  totalLikes: number;
  totalComments?: number;
  hasLiked: boolean;
  lastViewedAt?: Date;
}

export class UnifiedBlogEngagementService {
  private static readonly VIEW_COOLDOWN_MINUTES = 30;
  private static readonly RATE_LIMIT_PER_HOUR = 10;
  private static readonly CACHE_DURATION_SECONDS = 300; // 5 minutes

  /**
   * Track a view for any blog post (admin or user) with comprehensive anti-bot and rate limiting
   */
  static async trackView(data: ViewTrackingData): Promise<{ success: boolean; reason?: string }> {
    try {
      // Step 1: Bot detection
      const isBot = this.detectBot(data.userAgent);
      if (isBot) {
        console.log(`Bot detected for ${data.blogType} blog: ${data.blogPostId}`);
        return { success: false, reason: 'Bot detected' };
      }

      // Step 2: Generate unique identifiers for rate limiting
      const uniqueViewKey = `${data.blogType}:view:${data.sessionId}:${data.blogPostId}`;
      const ipRateLimitKey = `${data.blogType}:ratelimit:${data.ipAddress}:${data.blogPostId}`;

      // Step 3: Check for duplicate view within cooldown period
      const isDuplicate = await redis.get(uniqueViewKey);
      if (isDuplicate) {
        console.log(`Duplicate view within ${this.VIEW_COOLDOWN_MINUTES} minutes for ${data.blogType} blog: ${data.blogPostId}`);
        return { success: false, reason: 'View already counted recently' };
      }

      // Step 4: Check IP-based rate limiting
      const viewCount = await redis.incr(ipRateLimitKey);
      if (viewCount === 1) {
        // Set expiry for 1 hour
        await redis.expire(ipRateLimitKey, 3600);
      } else if (viewCount > this.RATE_LIMIT_PER_HOUR) {
        console.log(`Rate limit exceeded for IP ${data.ipAddress} on ${data.blogType} blog: ${data.blogPostId}`);
        return { success: false, reason: 'Rate limit exceeded' };
      }

      // Step 5: Mark this view to prevent duplicates
      await redis.set(uniqueViewKey, '1', { ex: this.VIEW_COOLDOWN_MINUTES * 60 });

      // Step 6: Record the view based on blog type
      if (data.blogType === 'admin') {
        // For admin/church blog posts
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
        this.updateAdminBlogStats(data.blogPostId);
      } else {
        // For user/community blog posts
        // Increment the view count atomically
        await prisma.userBlogPost.update({
          where: { id: data.blogPostId },
          data: {
            viewCount: { increment: 1 },
            lastViewedAt: new Date(),
          },
        });

        // Clear cache for this post
        await redis.del(`${data.blogType}:stats:${data.blogPostId}`);
      }

      console.log(`Successfully tracked view for ${data.blogType} blog: ${data.blogPostId}`);
      return { success: true };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { success: false, reason: 'Internal error' };
    }
  }

  /**
   * Toggle like for any blog post (admin or user)
   */
  static async toggleLike(
    blogPostId: string,
    blogType: 'admin' | 'user',
    userId: string
  ): Promise<{ liked: boolean; likeCount: number }> {
    try {
      if (blogType === 'admin') {
        // Handle admin/church blog likes
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
        await this.updateAdminBlogStats(blogPostId);

        return { liked, likeCount };
      } else {
        // Handle user/community blog likes
        const existingLike = await prisma.userBlogPostLike.findUnique({
          where: {
            postId_userId: {
              postId: blogPostId,
              userId,
            },
          },
        });

        let liked = false;
        if (existingLike) {
          // Unlike
          await prisma.userBlogPostLike.delete({
            where: { id: existingLike.id },
          });
          await prisma.userBlogPost.update({
            where: { id: blogPostId },
            data: { likeCount: { decrement: 1 } },
          });
        } else {
          // Like
          await prisma.userBlogPostLike.create({
            data: {
              postId: blogPostId,
              userId,
            },
          });
          await prisma.userBlogPost.update({
            where: { id: blogPostId },
            data: { likeCount: { increment: 1 } },
          });
          liked = true;
        }

        // Get updated like count
        const post = await prisma.userBlogPost.findUnique({
          where: { id: blogPostId },
          select: { likeCount: true },
        });

        // Clear cache
        await redis.del(`${blogType}:stats:${blogPostId}`);

        return { liked, likeCount: post?.likeCount || 0 };
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Track user engagement metrics for any blog type
   */
  static async trackEngagement(
    blogPostId: string,
    blogType: 'admin' | 'user',
    sessionId: string,
    metrics: EngagementMetrics,
    userId?: string
  ): Promise<void> {
    try {
      if (blogType === 'admin') {
        // Track engagement for admin blogs
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
            shares: metrics.shares || 0,
          },
          update: {
            scrollDepth: Math.max(metrics.scrollDepth),
            timeOnPage: metrics.timeOnPage,
            clicks: { increment: metrics.clicks },
            shares: { increment: metrics.shares || 0 },
            updatedAt: new Date(),
          },
        });
      }
      // For user blogs, we might want to track engagement differently or skip it
      // depending on your requirements
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }

  /**
   * Get blog post stats with caching (works for both types)
   */
  static async getBlogPostStats(
    blogPostId: string,
    blogType: 'admin' | 'user',
    userId?: string
  ): Promise<BlogStats> {
    try {
      // Check cache first
      const cacheKey = `${blogType}:stats:${blogPostId}`;
      const cached = await redis.get(cacheKey);

      if (cached && typeof cached === 'string') {
        const stats = JSON.parse(cached);
        // Add user-specific data if needed
        if (userId) {
          stats.hasLiked = await this.checkUserLiked(blogPostId, blogType, userId);
        }
        return stats;
      }

      let stats: BlogStats;

      if (blogType === 'admin') {
        // Get stats for admin/church blog
        const [blogPostStats, likeCount] = await Promise.all([
          prisma.blogPostStats.findUnique({
            where: { blogPostId },
          }),
          prisma.blogPostLike.count({
            where: { blogPostId },
          }),
        ]);

        // If no stats exist, create them
        if (!blogPostStats) {
          const totalViews = await prisma.blogPostView.count({
            where: { blogPostId },
          });

          await prisma.blogPostStats.create({
            data: {
              blogPostId,
              totalViews,
              uniqueViews: totalViews,
              totalLikes: likeCount,
              registeredViews: 0,
              anonymousViews: totalViews,
              updatedAt: new Date(),
            },
          });

          stats = {
            totalViews,
            totalLikes: likeCount,
            hasLiked: false,
          };
        } else {
          stats = {
            totalViews: blogPostStats.totalViews,
            totalLikes: likeCount,
            hasLiked: false,
            lastViewedAt: blogPostStats.lastViewedAt || undefined,
          };
        }
      } else {
        // Get stats for user/community blog
        const post = await prisma.userBlogPost.findUnique({
          where: { id: blogPostId },
          select: {
            viewCount: true,
            likeCount: true,
            lastViewedAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
        });

        if (!post) {
          return {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            hasLiked: false,
          };
        }

        stats = {
          totalViews: post.viewCount,
          totalLikes: post.likeCount,
          totalComments: post._count.comments,
          hasLiked: false,
          lastViewedAt: post.lastViewedAt || undefined,
        };
      }

      // Check if user has liked (if userId provided)
      if (userId) {
        stats.hasLiked = await this.checkUserLiked(blogPostId, blogType, userId);
      }

      // Cache for 5 minutes (without user-specific data)
      const cacheData = { ...stats, hasLiked: false };
      await redis.set(cacheKey, JSON.stringify(cacheData), { 
        ex: this.CACHE_DURATION_SECONDS 
      });

      return stats;
    } catch (error) {
      console.error('Error getting blog post stats:', error);
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        hasLiked: false,
      };
    }
  }

  /**
   * Check if a user has liked a post
   */
  private static async checkUserLiked(
    blogPostId: string,
    blogType: 'admin' | 'user',
    userId: string
  ): Promise<boolean> {
    try {
      if (blogType === 'admin') {
        const like = await prisma.blogPostLike.findUnique({
          where: {
            blogPostId_userId: {
              blogPostId,
              userId,
            },
          },
        });
        return !!like;
      } else {
        const like = await prisma.userBlogPostLike.findUnique({
          where: {
            postId_userId: {
              postId: blogPostId,
              userId,
            },
          },
        });
        return !!like;
      }
    } catch (error) {
      console.error('Error checking user like:', error);
      return false;
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
      /headless/i,
      /phantom/i,
      /puppeteer/i,
      /playwright/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Helper: Update admin blog post statistics
   */
  private static async updateAdminBlogStats(blogPostId: string): Promise<void> {
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
      await redis.del(`admin:stats:${blogPostId}`);
    } catch (error) {
      console.error('Error updating admin blog post stats:', error);
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
   * Get trending posts for both blog types
   */
  static async getTrendingPosts(
    blogType: 'admin' | 'user' | 'both',
    limit: number = 5
  ): Promise<any[]> {
    try {
      const cacheKey = `trending:${blogType}`;
      const cached = await redis.get(cacheKey);

      if (cached && typeof cached === 'string') {
        return JSON.parse(cached);
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let trending: any[] = [];

      if (blogType === 'admin' || blogType === 'both') {
        const adminTrending = await prisma.$queryRaw`
          SELECT
            bp.id,
            bp.title,
            bp.slug,
            bp.excerpt,
            bp."imageUrl",
            'admin' as "blogType",
            COALESCE(bps."totalViews", 0) as "totalViews",
            COALESCE(bps."totalLikes", 0) as "totalLikes"
          FROM "BlogPost" bp
          LEFT JOIN "BlogPostStats" bps ON bp.id = bps."blogPostId"
          WHERE bp.published = true
            AND (bps."lastViewedAt" IS NULL OR bps."lastViewedAt" > ${sevenDaysAgo})
          ORDER BY COALESCE(bps."totalViews", 0) DESC, COALESCE(bps."totalLikes", 0) DESC
          LIMIT ${blogType === 'both' ? Math.floor(limit / 2) : limit}
        `;
        trending = trending.concat(adminTrending);
      }

      if (blogType === 'user' || blogType === 'both') {
        const userTrending = await prisma.userBlogPost.findMany({
          where: {
            published: true,
            lastViewedAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            imageUrl: true,
            viewCount: true,
            likeCount: true,
          },
          orderBy: [
            { viewCount: 'desc' },
            { likeCount: 'desc' },
          ],
          take: blogType === 'both' ? Math.ceil(limit / 2) : limit,
        });

        const formattedUserTrending = userTrending.map(post => ({
          ...post,
          blogType: 'user',
          totalViews: post.viewCount,
          totalLikes: post.likeCount,
        }));

        trending = trending.concat(formattedUserTrending);
      }

      // Sort combined results if needed
      if (blogType === 'both') {
        trending.sort((a, b) => b.totalViews - a.totalViews);
        trending = trending.slice(0, limit);
      }

      // Cache for 1 hour
      await redis.set(cacheKey, JSON.stringify(trending), { ex: 3600 });

      return trending;
    } catch (error) {
      console.error('Error getting trending posts:', error);
      return [];
    }
  }
}
