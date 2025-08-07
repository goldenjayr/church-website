# 📊 Blog Engagement System - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Next.js 14+ project
- PostgreSQL database
- Node.js 18+
- pnpm package manager

### Step 1: Install Dependencies
```bash
pnpm add @upstash/redis request-ip ua-parser-js lodash zod
pnpm add -D @types/lodash @types/ua-parser-js
```

### Step 2: Setup Upstash Redis

1. **Create Account**: Go to [console.upstash.com](https://console.upstash.com)
2. **Create Database**: 
   - Click "Create Database"
   - Choose region closest to your users
   - Select "Regional" for better performance
   - Use default settings

3. **Get Credentials**:
   - Click on your database
   - Go to "REST API" tab
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

4. **Add to `.env`**:
```env
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Step 3: Run Database Migration
```bash
pnpm prisma migrate dev --name add_views_and_likes_system
pnpm prisma generate
```

## 📁 File Structure

```
your-project/
├── prisma/
│   └── schema.prisma          # Updated with new models
├── lib/
│   └── services/
│       └── blog-engagement.service.ts  # Core service
├── hooks/
│   └── use-blog-engagement.ts          # React hooks
├── components/
│   └── blog/
│       └── blog-engagement.tsx         # UI components
├── app/
│   └── api/
│       └── blog/
│           └── [slug]/
│               ├── views/
│               │   └── route.ts        # View tracking API
│               ├── likes/
│               │   └── route.ts        # Like toggle API
│               └── engagement/
│                   └── route.ts        # Engagement metrics API
└── .env                                # Environment variables
```

## 🎯 Basic Usage

### In Your Blog Post Page

```tsx
// app/blog/[slug]/page.tsx
import { BlogEngagement } from '@/components/blog/blog-engagement';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  // Fetch your blog post data
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      
      {/* Add engagement UI at top or bottom */}
      <BlogEngagement slug={params.slug} />
      
      <div>{post.content}</div>
    </article>
  );
}
```

### In Blog List/Archive Page

```tsx
// app/blog/page.tsx
import { BlogEngagementCompact } from '@/components/blog/blog-engagement';

export default async function BlogList() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id} className="border-b pb-4 mb-4">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          
          {/* Compact view for lists */}
          <BlogEngagementCompact slug={post.slug} />
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Advanced Configuration

### Custom Styling

```tsx
// Pass className prop for custom styling
<BlogEngagement 
  slug={slug} 
  className="bg-gray-100 p-4 rounded-lg"
/>
```

### Custom Implementation with Hooks

```tsx
'use client';

import { useBlogEngagement } from '@/hooks/use-blog-engagement';

export function CustomBlogStats({ slug }: { slug: string }) {
  const { views, likes, hasLiked, toggleLike, isAuthenticated } = useBlogEngagement(slug);
  
  return (
    <div className="custom-stats">
      <span>{views} views</span>
      <button onClick={toggleLike}>
        {hasLiked ? '❤️' : '🤍'} {likes}
      </button>
    </div>
  );
}
```

### Social Sharing Integration

```tsx
'use client';

import { useBlogShare } from '@/hooks/use-blog-engagement';

export function ShareButtons({ slug }: { slug: string }) {
  const { shareOnTwitter, shareOnFacebook, copyLink } = useBlogShare(slug);
  
  return (
    <div className="share-buttons">
      <button onClick={shareOnTwitter}>Twitter</button>
      <button onClick={shareOnFacebook}>Facebook</button>
      <button onClick={copyLink}>Copy Link</button>
    </div>
  );
}
```

## 📊 Analytics & Reporting

### Get Trending Posts

```ts
// app/api/blog/trending/route.ts
import { BlogEngagementService } from '@/lib/services/blog-engagement.service';

export async function GET() {
  const trending = await BlogEngagementService.getTrendingPosts(10);
  return NextResponse.json(trending);
}
```

### Display Trending Posts

```tsx
// components/trending-posts.tsx
export async function TrendingPosts() {
  const trending = await fetch('/api/blog/trending').then(r => r.json());
  
  return (
    <div>
      <h2>Trending Posts</h2>
      {trending.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <span>{post.uniqueViews} views</span>
        </div>
      ))}
    </div>
  );
}
```

## 🔒 Security Features

### Rate Limiting
- **Views**: Max 10 views per IP per hour
- **Duplicate Prevention**: 30-minute window
- **Bot Detection**: Filters common crawlers

### Authentication
- Views: Available for all users
- Likes: Requires authentication
- Session tracking: Anonymous users tracked via session ID

## 🎨 Customization Options

### Modify Rate Limits

```ts
// lib/services/blog-engagement.service.ts
// Change from 10 to 20 views per hour
if (viewCount > 20) {
  return { success: false, reason: 'Rate limit exceeded' };
}
```

### Adjust Cache Times

```ts
// Change stats cache from 5 minutes to 10 minutes
await redis.set(cacheKey, JSON.stringify(stats), { ex: 600 });
```

### Custom Bot Detection

```ts
// Add more bot patterns
const botPatterns = [
  /bot/i,
  /your-custom-pattern/i,
  // ...
];
```

## 🐛 Troubleshooting

### Common Issues

1. **"Redis connection failed"**
   - Check your Upstash credentials in `.env`
   - Ensure no spaces in the token
   - Verify the URL includes `https://`

2. **"Views not tracking"**
   - Check browser console for errors
   - Verify API routes are accessible
   - Ensure database migrations ran successfully

3. **"Likes not working"**
   - Confirm authentication is set up
   - Check user session is available
   - Verify database relations are correct

### Debug Mode

Enable debug logging:

```ts
// lib/services/blog-engagement.service.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Tracking view:', { blogPostId, ipAddress, sessionId });
}
```

## 📈 Performance Optimization

### Database Indexes
Already included in migration:
- `blogPostId` index for fast lookups
- `sessionId` index for unique counting
- `createdAt` index for time-based queries

### Caching Strategy
- **Stats**: 5-minute cache
- **Trending**: 1-hour cache
- **User-specific**: No cache (real-time)

### Scaling Considerations
- Use Upstash Global for multi-region
- Consider database read replicas for high traffic
- Implement CDN for static assets

## 🔄 Maintenance

### Clean Old Data

```sql
-- Remove views older than 90 days
DELETE FROM "BlogPostView" 
WHERE "createdAt" < NOW() - INTERVAL '90 days';

-- Clean up rate limit entries
DELETE FROM "RateLimit" 
WHERE "windowStart" < NOW() - INTERVAL '2 hours';
```

### Monitor Performance

```ts
// Add monitoring endpoint
// app/api/blog/stats/health/route.ts
export async function GET() {
  const stats = {
    totalViews: await prisma.blogPostView.count(),
    totalLikes: await prisma.blogPostLike.count(),
    redisStatus: await redis.ping(),
  };
  
  return NextResponse.json(stats);
}
```

## 🎉 Features Checklist

- [x] Anonymous view tracking
- [x] Authenticated view tracking
- [x] Like/unlike functionality
- [x] Bot detection
- [x] Rate limiting
- [x] Duplicate prevention
- [x] Session tracking
- [x] Engagement metrics (scroll, time)
- [x] Social sharing
- [x] Trending posts
- [x] Real-time updates
- [x] Performance caching
- [x] Analytics ready

## 📚 API Reference

### Track View
```
POST /api/blog/[slug]/views
Body: { referrer?, sessionId }
```

### Toggle Like
```
POST /api/blog/[slug]/likes   # Like
DELETE /api/blog/[slug]/likes # Unlike
```

### Track Engagement
```
POST /api/blog/[slug]/engagement
Body: { sessionId, scrollDepth, timeOnPage, clicks }
```

### Get Stats
```
GET /api/blog/[slug]/stats
Response: { totalViews, totalLikes, hasLiked }
```

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review the example implementation
3. Check browser console for errors
4. Verify all environment variables are set

## 📝 License

This implementation is part of your church-website project.
