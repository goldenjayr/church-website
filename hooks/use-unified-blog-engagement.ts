import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-actions';
import type { User } from '@prisma/client';

interface UnifiedBlogEngagementData {
  views: number;
  likes: number;
  comments?: number;
  hasLiked: boolean;
  isLoading: boolean;
  blogType?: 'admin' | 'user';
}

// Helper functions for debounce and throttle
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Unified hook for blog engagement - works with both admin and user blog posts
 * Automatically detects the blog type based on the route
 */
export function useUnifiedBlogEngagement(slug: string, forceType?: 'admin' | 'user') {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UnifiedBlogEngagementData>({
    views: 0,
    likes: 0,
    comments: 0,
    hasLiked: false,
    isLoading: true,
    blogType: forceType,
  });
  
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const clickCount = useRef<number>(0);
  const viewTracked = useRef<boolean>(false);
  const engagementInterval = useRef<NodeJS.Timeout>();
  const lastEngagementUpdate = useRef<number>(0);
  const pendingEngagement = useRef<boolean>(false);

  // Determine blog type from URL if not forced
  const blogType = useMemo(() => {
    if (forceType) return forceType;
    if (typeof window === 'undefined') return 'admin';
    
    const path = window.location.pathname;
    if (path.includes('/community-blogs/')) return 'user';
    return 'admin';
  }, [forceType]);

  // Session ID management
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return generateSessionId();
    }
    return getOrCreateSessionId(blogType);
  });
  
  useEffect(() => {
    const id = getOrCreateSessionId(blogType);
    setSessionId(id);
  }, [blogType]);

  // Load current user with caching
  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('cached_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {}
        }
      }
      
      const freshUser = await getCurrentUser();
      if (!cancelled) {
        setUser(freshUser);
        if (freshUser && typeof window !== 'undefined') {
          sessionStorage.setItem('cached_user', JSON.stringify(freshUser));
        }
      }
    };
    loadUser();
    return () => { cancelled = true; };
  }, []);

  // Track view with unified endpoint
  const trackView = useCallback(async () => {
    if (viewTracked.current) return;
    
    try {
      // Use unified endpoint
      const endpoint = blogType === 'user' 
        ? `/api/community-blogs/${slug}/views`
        : `/api/blog/${slug}/views`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referrer: document.referrer,
          sessionId,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        viewTracked.current = true;
        if (data.sessionId && data.sessionId !== sessionId) {
          const storageKey = blogType === 'user' ? 'community_blog_session_id' : 'blog_session_id';
          sessionStorage.setItem(storageKey, data.sessionId);
        }
      } else if (data.cached) {
        viewTracked.current = true;
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [slug, sessionId, blogType]);

  // Track engagement metrics
  const trackEngagement = useCallback(async () => {
    const now = Date.now();
    if (now - lastEngagementUpdate.current < 10000) return;
    if (pendingEngagement.current) return;
    
    pendingEngagement.current = true;
    lastEngagementUpdate.current = now;
    
    const timeOnPage = Math.floor((now - startTime.current) / 1000);
    
    try {
      const endpoint = blogType === 'user'
        ? `/api/community-blogs/${slug}/engagement`
        : `/api/blog/${slug}/engagement`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          scrollDepth: maxScrollDepth.current,
          timeOnPage,
          clicks: clickCount.current,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error tracking engagement:', error);
      }
    } finally {
      pendingEngagement.current = false;
    }
  }, [slug, sessionId, blogType]);

  const debouncedTrackEngagement = useMemo(
    () => debounce(trackEngagement, 5000),
    [trackEngagement]
  );

  // Load stats and track view
  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        const endpoint = blogType === 'user'
          ? `/api/community-blogs/${slug}/stats`
          : `/api/blog/${slug}/stats`;
        
        const statsResponse = await fetch(endpoint);
        
        if (!cancelled && statsResponse.ok) {
          const stats = await statsResponse.json();
          setData({
            views: stats.totalViews || 0,
            likes: stats.totalLikes || 0,
            comments: stats.totalComments,
            hasLiked: stats.hasLiked || false,
            isLoading: false,
            blogType,
          });
        }
      } catch (error) {
        console.error('Error loading blog stats:', error);
        if (!cancelled) {
          setData(prev => ({ ...prev, isLoading: false, blogType }));
        }
      }
    };

    loadData();
    trackView().catch(err => {
      console.error('Error tracking view:', err);
    });
    
    return () => { cancelled = true; };
  }, [slug, trackView, blogType]);

  // Track scroll depth
  useEffect(() => {
    let ticking = false;
    
    const updateScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = Math.min(100, (scrollTop + windowHeight) / documentHeight * 100);
      
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercentage);
      ticking = false;
    };
    
    const handleScroll = throttle(() => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
      debouncedTrackEngagement();
    }, 250);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedTrackEngagement]);

  // Track clicks
  useEffect(() => {
    const handleClick = throttle((e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).tagName) {
        clickCount.current++;
        debouncedTrackEngagement();
      }
    }, 1000);

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [debouncedTrackEngagement]);

  // Periodic engagement tracking with visibility handling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const startTracking = () => {
      if (!interval && document.visibilityState === 'visible') {
        interval = setInterval(() => {
          trackEngagement();
        }, 45000);
        engagementInterval.current = interval;
      }
    };
    
    const stopTracking = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        stopTracking();
        trackEngagement();
      }
    };
    
    startTracking();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackEngagement]);

  // Track before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
      
      if (timeOnPage > 2 || maxScrollDepth.current > 5 || clickCount.current > 0) {
        const endpoint = blogType === 'user'
          ? `/api/community-blogs/${slug}/engagement`
          : `/api/blog/${slug}/engagement`;
        
        const data = new FormData();
        data.append('sessionId', sessionId);
        data.append('timeOnPage', timeOnPage.toString());
        data.append('scrollDepth', maxScrollDepth.current.toString());
        data.append('clicks', clickCount.current.toString());
        
        navigator.sendBeacon(endpoint, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [slug, sessionId, blogType]);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(async () => {
    if (!user) {
      const redirectPath = blogType === 'user' 
        ? `/login?redirect=/community-blogs/${slug}`
        : `/login?redirect=/blog/${slug}`;
      router.push(redirectPath);
      return;
    }

    const previousData = data;
    setData(prev => ({
      ...prev,
      likes: prev.hasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      hasLiked: !prev.hasLiked,
    }));

    try {
      const endpoint = blogType === 'user'
        ? `/api/community-blogs/${slug}/likes`
        : `/api/blog/${slug}/likes`;
      
      const response = await fetch(endpoint, {
        method: previousData.hasLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(prev => ({
          ...prev,
          likes: result.likeCount,
          hasLiked: result.liked,
        }));
        
        // Refresh stats after a short delay
        setTimeout(async () => {
          try {
            const statsEndpoint = blogType === 'user'
              ? `/api/community-blogs/${slug}/stats`
              : `/api/blog/${slug}/stats`;
            
            const statsResponse = await fetch(statsEndpoint);
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              setData({
                views: stats.totalViews || 0,
                likes: stats.totalLikes || 0,
                comments: stats.totalComments,
                hasLiked: stats.hasLiked || false,
                isLoading: false,
                blogType,
              });
            }
          } catch (error) {
            console.error('Error refreshing stats:', error);
          }
        }, 500);
      } else {
        setData(previousData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setData(previousData);
    }
  }, [user, data, slug, router, blogType]);

  return {
    ...data,
    toggleLike,
    isAuthenticated: !!user,
  };
}

// Helper function to get or create session ID
function getOrCreateSessionId(blogType: 'admin' | 'user'): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }
  
  const SESSION_KEY = blogType === 'user' ? 'community_blog_session_id' : 'blog_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

// Generate a unique session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Hook for share functionality (works for both blog types)
export function useUnifiedBlogShare(slug: string, blogType?: 'admin' | 'user') {
  const type = blogType || (typeof window !== 'undefined' && window.location.pathname.includes('/community-blogs/') ? 'user' : 'admin');
  
  const trackShare = useCallback(async (platform: string) => {
    try {
      console.log(`Shared ${type} blog on ${platform}`);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [type]);

  const shareOnTwitter = useCallback(() => {
    const urlPath = type === 'user' ? `/community-blogs/${slug}` : `/blog/${slug}`;
    const url = `${window.location.origin}${urlPath}`;
    const text = document.title;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
    trackShare('twitter');
  }, [slug, trackShare, type]);

  const shareOnFacebook = useCallback(() => {
    const urlPath = type === 'user' ? `/community-blogs/${slug}` : `/blog/${slug}`;
    const url = `${window.location.origin}${urlPath}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('facebook');
  }, [slug, trackShare, type]);

  const shareOnLinkedIn = useCallback(() => {
    const urlPath = type === 'user' ? `/community-blogs/${slug}` : `/blog/${slug}`;
    const url = `${window.location.origin}${urlPath}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('linkedin');
  }, [slug, trackShare, type]);

  const copyLink = useCallback(async () => {
    const urlPath = type === 'user' ? `/community-blogs/${slug}` : `/blog/${slug}`;
    const url = `${window.location.origin}${urlPath}`;
    try {
      await navigator.clipboard.writeText(url);
      trackShare('copy');
      return true;
    } catch (error) {
      console.error('Error copying link:', error);
      return false;
    }
  }, [slug, trackShare, type]);

  return {
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    copyLink,
  };
}
