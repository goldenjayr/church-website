import { RedisService, CacheKeys } from './redis.service';

/**
 * Service to handle cache invalidation when data changes
 */
export class CacheInvalidationService {
  /**
   * Invalidate blog-related caches
   */
  static async invalidateBlogCache(options?: {
    postId?: string;
    slug?: string;
    categoryId?: string;
    all?: boolean;
  }) {
    const keysToDelete: string[] = [];

    if (options?.all) {
      // Invalidate all blog caches
      await RedisService.deletePattern('blog:*');
      return;
    }

    // Always invalidate list caches
    keysToDelete.push(
      CacheKeys.blogList(),
      CacheKeys.blogFeatured(),
      CacheKeys.blogTrending(),
      CacheKeys.blogCategories()
    );

    // Invalidate specific post caches
    if (options?.postId) {
      keysToDelete.push(
        CacheKeys.blogPostById(options.postId),
        CacheKeys.blogStats(options.postId),
        CacheKeys.blogRelated(options.postId)
      );
    }

    if (options?.slug) {
      keysToDelete.push(CacheKeys.blogPost(options.slug));
    }

    // Invalidate category-specific caches
    if (options?.categoryId) {
      // Delete all pages for this category
      for (let i = 1; i <= 10; i++) {
        keysToDelete.push(CacheKeys.blogList(options.categoryId, i));
      }
    }

    await RedisService.delete(keysToDelete);
  }

  /**
   * Invalidate event-related caches
   */
  static async invalidateEventCache(options?: {
    eventId?: string;
    all?: boolean;
  }) {
    if (options?.all) {
      await RedisService.deletePattern('event*');
      return;
    }

    const keysToDelete: string[] = [
      CacheKeys.eventList(),
      CacheKeys.eventListUpcoming()
    ];

    if (options?.eventId) {
      keysToDelete.push(
        CacheKeys.event(options.eventId),
        CacheKeys.eventRsvps(options.eventId),
        CacheKeys.adminEventStats(options.eventId)
      );
      
      // Also delete RSVP check keys for this event
      await RedisService.deletePattern(`event:rsvp:${options.eventId}:*`);
    }

    await RedisService.delete(keysToDelete);
  }

  /**
   * Invalidate doctrine-related caches
   */
  static async invalidateDoctrineCache(options?: {
    doctrineId?: string;
    all?: boolean;
  }) {
    if (options?.all) {
      await RedisService.deletePattern('doctrine*');
      return;
    }

    const keysToDelete: string[] = [
      CacheKeys.doctrineList(),
      CacheKeys.doctrineCategories()
    ];

    if (options?.doctrineId) {
      keysToDelete.push(CacheKeys.doctrine(options.doctrineId));
    }

    await RedisService.delete(keysToDelete);
  }

  /**
   * Invalidate user-related caches
   */
  static async invalidateUserCache(userId: string, options?: {
    profile?: boolean;
    sessions?: boolean;
    auth?: boolean;
  }) {
    const keysToDelete: string[] = [];

    if (options?.profile !== false) {
      keysToDelete.push(CacheKeys.userProfile(userId));
    }

    if (options?.auth !== false) {
      keysToDelete.push(CacheKeys.userAuth(userId));
    }

    if (options?.sessions) {
      await RedisService.deleteAllUserSessions(userId);
    }

    if (keysToDelete.length > 0) {
      await RedisService.delete(keysToDelete);
    }
  }

  /**
   * Invalidate admin dashboard caches
   */
  static async invalidateAdminCache(type?: string) {
    const keysToDelete: string[] = [
      CacheKeys.adminDashboard()
    ];

    if (type) {
      keysToDelete.push(CacheKeys.adminStats(type));
    } else {
      // Invalidate all admin stats
      await RedisService.deletePattern('admin:stats:*');
    }

    await RedisService.delete(keysToDelete);
  }

  /**
   * Invalidate page caches
   */
  static async invalidatePageCache(page: 'homepage' | 'about' | 'all') {
    if (page === 'all') {
      await RedisService.deletePattern('page:*');
      return;
    }

    const keyMap = {
      homepage: CacheKeys.homepage(),
      about: CacheKeys.aboutPage()
    };

    await RedisService.delete(keyMap[page]);
  }

  /**
   * Invalidate search caches
   */
  static async invalidateSearchCache(type?: string) {
    if (type) {
      await RedisService.deletePattern(`search:${type}:*`);
    } else {
      await RedisService.deletePattern('search:*');
    }
  }

  /**
   * Clear all application caches (use with caution!)
   */
  static async clearAllCaches() {
    console.warn('Clearing all application caches...');
    
    const patterns = [
      'blog:*',
      'event*',
      'doctrine*',
      'user:*',
      'admin:*',
      'page:*',
      'search:*',
      'form:*',
      'contact:*'
    ];

    for (const pattern of patterns) {
      await RedisService.deletePattern(pattern);
    }

    console.log('All caches cleared');
  }

  /**
   * Smart cache warmup - pre-populate important caches
   */
  static async warmupCaches() {
    console.log('Warming up caches...');
    
    try {
      // Import necessary functions
      const { getPublishedBlogPosts, getFeaturedBlogPosts, getPublishedBlogCategories } = await import('@/lib/public-blog-actions');
      const { getPublicEvents } = await import('@/lib/public-event-actions');
      
      // Warm up blog caches
      await Promise.all([
        getPublishedBlogPosts(),
        getFeaturedBlogPosts(),
        getPublishedBlogCategories()
      ]);

      // Warm up event caches
      await getPublicEvents();

      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Cache warmup error:', error);
    }
  }
}

export default CacheInvalidationService;
