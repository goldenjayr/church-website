'use client';

import { useEffect, useState } from 'react';
import { BlogEngagement, BlogEngagementCompact } from '@/components/blog/blog-engagement';
import { useBlogEngagement, useBlogShare } from '@/hooks/use-blog-engagement';

/**
 * Example Blog Post Page with Full Engagement Tracking
 * 
 * This example shows how to integrate the view/likes system
 * into your blog post pages.
 */
export default function BlogPostExample({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Hook automatically tracks views and provides engagement data
  const { 
    views, 
    likes, 
    hasLiked, 
    isLoading, 
    toggleLike, 
    isAuthenticated 
  } = useBlogEngagement(slug);
  
  // Social sharing functionality
  const { 
    shareOnTwitter, 
    shareOnFacebook, 
    shareOnLinkedIn, 
    copyLink 
  } = useBlogShare(slug);

  // Example: Show a thank you message after liking
  const [showThankYou, setShowThankYou] = useState(false);

  const handleLike = async () => {
    await toggleLike();
    if (!hasLiked && isAuthenticated) {
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Blog Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Your Blog Post Title</h1>
        
        {/* Engagement Stats at the Top */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="text-gray-600">
            <span>Published on January 1, 2024</span>
            <span className="mx-2">•</span>
            <span>By John Doe</span>
          </div>
          
          {/* Compact view/like display for header */}
          <BlogEngagementCompact slug={slug} />
        </div>
      </header>

      {/* Blog Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <p>
          This is your blog post content. As users read this content,
          the system automatically tracks:
        </p>
        <ul>
          <li>Page views (both anonymous and authenticated)</li>
          <li>Time spent on page</li>
          <li>Scroll depth</li>
          <li>User interactions (clicks)</li>
        </ul>
        
        <h2>Features Being Tracked</h2>
        <p>
          The view tracking happens automatically when the page loads.
          It includes:
        </p>
        <ul>
          <li>Bot detection to filter out crawlers</li>
          <li>Rate limiting (max 10 views per IP per hour)</li>
          <li>Duplicate prevention (30-minute window)</li>
          <li>Session-based tracking for accuracy</li>
        </ul>

        <h2>Real-time Statistics</h2>
        <div className="bg-gray-100 p-4 rounded-lg not-prose">
          <h3 className="font-semibold mb-2">Current Stats:</h3>
          <ul className="space-y-1">
            <li>👁 Views: {views}</li>
            <li>❤️ Likes: {likes}</li>
            <li>👤 You {hasLiked ? 'liked' : "haven't liked"} this post</li>
            <li>🔐 Authentication: {isAuthenticated ? 'Logged in' : 'Guest'}</li>
          </ul>
        </div>

        <h2>How Likes Work</h2>
        <p>
          Only authenticated users can like posts. If you're not logged in,
          clicking the like button will redirect you to the login page.
          Users can toggle their likes on and off.
        </p>
      </div>

      {/* Engagement Section at Bottom */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Enjoyed this article?</h3>
          
          {/* Full engagement component with all features */}
          <BlogEngagement slug={slug} />
        </div>

        {/* Thank you message */}
        {showThankYou && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4 animate-fade-in">
            Thank you for liking this post! 🎉
          </div>
        )}

        {/* Share buttons example (alternative implementation) */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-3">Share this article:</h4>
          <div className="flex gap-3">
            <button
              onClick={shareOnTwitter}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Share on Twitter
            </button>
            <button
              onClick={shareOnFacebook}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            >
              Share on Facebook
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Share on LinkedIn
            </button>
            <button
              onClick={async () => {
                const success = await copyLink();
                if (success) alert('Link copied!');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Custom Like Button Example */}
        <div className="mt-6 p-6 bg-purple-50 rounded-lg">
          <h4 className="font-semibold mb-3">Custom Like Implementation:</h4>
          <button
            onClick={handleLike}
            disabled={!isAuthenticated || isLoading}
            className={`
              px-6 py-3 rounded-lg font-semibold transition-all
              ${hasLiked 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50'
              }
              ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {hasLiked ? '❤️ Liked' : '🤍 Like'} ({likes})
          </button>
          {!isAuthenticated && (
            <p className="text-sm text-gray-600 mt-2">
              Please <a href="/login" className="text-blue-600 underline">login</a> to like this post
            </p>
          )}
        </div>
      </div>

      {/* Related Posts Section */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
        <div className="grid gap-4">
          {/* Example related post cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold mb-2">Related Post Title {i}</h4>
                  <p className="text-gray-600 text-sm">
                    Brief description of the related post...
                  </p>
                </div>
                {/* Use compact engagement display for list items */}
                <BlogEngagementCompact slug={`related-post-${i}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import the components and hooks:
 *    - BlogEngagement: Full engagement UI (views, likes, share)
 *    - BlogEngagementCompact: Compact version for lists
 *    - useBlogEngagement: Hook for engagement data and actions
 *    - useBlogShare: Hook for social sharing
 * 
 * 2. The useBlogEngagement hook automatically:
 *    - Tracks the page view when component mounts
 *    - Monitors scroll depth and time on page
 *    - Provides real-time stats
 *    - Handles like/unlike functionality
 * 
 * 3. Place BlogEngagement component where you want the UI:
 *    - At the top of the article
 *    - At the bottom as a CTA
 *    - In a floating sidebar
 * 
 * 4. Use BlogEngagementCompact for:
 *    - Blog post lists
 *    - Related articles sections
 *    - Archive pages
 * 
 * 5. The system handles:
 *    - Anonymous users (views only)
 *    - Authenticated users (views + likes)
 *    - Rate limiting automatically
 *    - Caching for performance
 */
