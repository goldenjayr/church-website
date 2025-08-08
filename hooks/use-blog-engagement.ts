import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-actions';
import type { User } from '@prisma/client';

interface BlogEngagementData {
  views: number;
  likes: number;
  hasLiked: boolean;
  isLoading: boolean;
}

interface EngagementMetrics {
  scrollDepth: number;
  timeOnPage: number;
  clicks: number;
}

// Custom debounce implementation to avoid lodash dependency
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

// Custom throttle for scroll events
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

export function useBlogEngagement(slug: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<BlogEngagementData>({
    views: 0,
    likes: 0,
    hasLiked: false,
    isLoading: true,
  });
  
  const startTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const clickCount = useRef<number>(0);
  const viewTracked = useRef<boolean>(false);
  const engagementInterval = useRef<NodeJS.Timeout>();
  const lastEngagementUpdate = useRef<number>(0);
  const pendingEngagement = useRef<boolean>(false);

  // Memoize session ID to avoid repeated storage access
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // Load current user with caching
  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      const cachedUser = sessionStorage.getItem('cached_user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {}
      }
      
      const freshUser = await getCurrentUser();
      if (!cancelled) {
        setUser(freshUser);
        if (freshUser) {
          sessionStorage.setItem('cached_user', JSON.stringify(freshUser));
        }
      }
    };
    loadUser();
    return () => { cancelled = true; };
  }, []);

  // Optimized view tracking with request coalescing
  const trackView = useCallback(async () => {
    if (viewTracked.current) return;
    
    try {
      // Use requestIdleCallback for non-critical tracking
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (!viewTracked.current) {
            sendViewRequest();
          }
        });
      } else {
        sendViewRequest();
      }
      
      async function sendViewRequest() {
        const response = await fetch(`/api/blog/${slug}/views`, {
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
          // Update session ID if server provided a new one
          if (data.sessionId && data.sessionId !== sessionId) {
            sessionStorage.setItem('blog_session_id', data.sessionId);
          }
        } else if (data.cached) {
          viewTracked.current = true;
        }
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [slug, sessionId]);

  // Optimized engagement tracking with batching
  const trackEngagement = useCallback(async () => {
    // Avoid tracking if less than 10 seconds since last update
    const now = Date.now();
    if (now - lastEngagementUpdate.current < 10000) return;
    
    // Prevent concurrent requests
    if (pendingEngagement.current) return;
    pendingEngagement.current = true;
    
    const timeOnPage = Math.floor((now - startTime.current) / 1000);
    lastEngagementUpdate.current = now;
    
    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      await fetch(`/api/blog/${slug}/engagement`, {
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
  }, [slug, sessionId]);

  // Optimized debounced tracking
  const debouncedTrackEngagement = useMemo(
    () => debounce(trackEngagement, 5000),
    [trackEngagement]
  );

  // Load stats immediately, track view in background
  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        // Load stats immediately - don't wait for view tracking
        const statsResponse = await fetch(`/api/blog/${slug}/stats`);
        
        if (!cancelled && statsResponse.ok) {
          const stats = await statsResponse.json();
          setData({
            views: stats.totalViews || 0,
            likes: stats.totalLikes || 0,
            hasLiked: stats.hasLiked || false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading blog stats:', error);
        if (!cancelled) {
          setData(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    // Load stats immediately
    loadData();
    
    // Track view in background - completely independent
    trackView().catch(err => {
      console.error('Error tracking view:', err);
      // Don't affect UI - view tracking is non-critical
    });
    
    return () => { cancelled = true; };
  }, [slug, trackView]);

  // Optimized scroll tracking with throttling and passive listener
  useEffect(() => {
    // Pre-calculate values that don't change
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

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedTrackEngagement]);

  // Optimized click tracking with delegation
  useEffect(() => {
    const handleClick = throttle((e: MouseEvent) => {
      // Only track meaningful clicks (not on empty space)
      if (e.target && (e.target as HTMLElement).tagName) {
        clickCount.current++;
        debouncedTrackEngagement();
      }
    }, 1000);

    // Use capture phase for better performance
    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [debouncedTrackEngagement]);

  // Smart interval management - only track when page is visible
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const startTracking = () => {
      if (!interval && document.visibilityState === 'visible') {
        interval = setInterval(() => {
          trackEngagement();
        }, 45000); // Increased to 45 seconds to reduce server load
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
        // Track engagement when page becomes hidden
        trackEngagement();
      }
    };
    
    // Start tracking if page is visible
    startTracking();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackEngagement]);

  // Optimized beforeunload tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Only send if we have meaningful data
      if (timeOnPage > 2 || maxScrollDepth.current > 5 || clickCount.current > 0) {
        const data = new FormData();
        data.append('sessionId', sessionId);
        data.append('timeOnPage', timeOnPage.toString());
        data.append('scrollDepth', maxScrollDepth.current.toString());
        data.append('clicks', clickCount.current.toString());
        
        navigator.sendBeacon(`/api/blog/${slug}/engagement`, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [slug, sessionId]);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(async () => {
    if (!user) {
      router.push(`/login?redirect=/blog/${slug}`);
      return;
    }

    // Optimistic update
    const previousData = data;
    setData(prev => ({
      ...prev,
      likes: prev.hasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      hasLiked: !prev.hasLiked,
    }));

    try {
      const response = await fetch(`/api/blog/${slug}/likes`, {
        method: previousData.hasLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Update with server data
        setData(prev => ({
          ...prev,
          likes: result.likeCount,
          hasLiked: result.liked,
        }));
        
        // Fetch fresh stats to ensure consistency
        // Small delay to allow cache invalidation to propagate
        setTimeout(async () => {
          try {
            const statsResponse = await fetch(`/api/blog/${slug}/stats`);
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              setData({
                views: stats.totalViews || 0,
                likes: stats.totalLikes || 0,
                hasLiked: stats.hasLiked || false,
                isLoading: false,
              });
            }
          } catch (error) {
            console.error('Error refreshing stats:', error);
          }
        }, 500);
      } else {
        // Revert on error
        setData(previousData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setData(previousData);
    }
  }, [user, data, slug, router]);

  return {
    ...data,
    toggleLike,
    isAuthenticated: !!user,
  };
}

// Helper function to get or create session ID
function getOrCreateSessionId(): string {
  const SESSION_KEY = 'blog_session_id';
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

// Hook for tracking share events
export function useBlogShare(slug: string) {
  const trackShare = useCallback(async (platform: string) => {
    try {
      await fetch(`/api/blog/${slug}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          sessionId: getOrCreateSessionId(),
        }),
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [slug]);

  const shareOnTwitter = useCallback(() => {
    const url = `${window.location.origin}/blog/${slug}`;
    const text = document.title;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
    trackShare('twitter');
  }, [slug, trackShare]);

  const shareOnFacebook = useCallback(() => {
    const url = `${window.location.origin}/blog/${slug}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('facebook');
  }, [slug, trackShare]);

  const shareOnLinkedIn = useCallback(() => {
    const url = `${window.location.origin}/blog/${slug}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('linkedin');
  }, [slug, trackShare]);

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      trackShare('copy');
      return true;
    } catch (error) {
      console.error('Error copying link:', error);
      return false;
    }
  }, [slug, trackShare]);

  return {
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
    copyLink,
  };
}
