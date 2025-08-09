import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-actions';
import type { User } from '@prisma/client';

interface CommunityBlogEngagementData {
  views: number;
  likes: number;
  comments: number;
  hasLiked: boolean;
  isLoading: boolean;
}

// Reuse debounce and throttle from the original hook
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

export function useCommunityBlogEngagement(slug: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<CommunityBlogEngagementData>({
    views: 0,
    likes: 0,
    comments: 0,
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

  // Session ID management (reuse from original)
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return generateSessionId();
    }
    return getOrCreateSessionId();
  });
  
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  // Load current user
  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      const freshUser = await getCurrentUser();
      if (!cancelled) {
        setUser(freshUser);
      }
    };
    loadUser();
    return () => { cancelled = true; };
  }, []);

  // Track view
  const trackView = useCallback(async () => {
    if (viewTracked.current) return;
    
    try {
      const response = await fetch(`/api/community-blogs/${slug}/views`, {
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
          sessionStorage.setItem('community_blog_session_id', data.sessionId);
        }
      } else if (data.cached) {
        viewTracked.current = true;
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [slug, sessionId]);

  // Track engagement
  const trackEngagement = useCallback(async () => {
    const now = Date.now();
    if (now - lastEngagementUpdate.current < 10000) return;
    if (pendingEngagement.current) return;
    
    pendingEngagement.current = true;
    lastEngagementUpdate.current = now;
    
    const timeOnPage = Math.floor((now - startTime.current) / 1000);
    
    try {
      await fetch(`/api/community-blogs/${slug}/engagement`, {
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
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    } finally {
      pendingEngagement.current = false;
    }
  }, [slug, sessionId]);

  const debouncedTrackEngagement = useMemo(
    () => debounce(trackEngagement, 5000),
    [trackEngagement]
  );

  // Load stats and track view
  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        const statsResponse = await fetch(`/api/community-blogs/${slug}/stats`);
        
        if (!cancelled && statsResponse.ok) {
          const stats = await statsResponse.json();
          setData({
            views: stats.totalViews || 0,
            likes: stats.totalLikes || 0,
            comments: stats.totalComments || 0,
            hasLiked: stats.hasLiked || false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading community blog stats:', error);
        if (!cancelled) {
          setData(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    loadData();
    trackView().catch(err => {
      console.error('Error tracking view:', err);
    });
    
    return () => { cancelled = true; };
  }, [slug, trackView]);

  // Track scroll
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

  // Periodic engagement tracking
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
        const data = new FormData();
        data.append('sessionId', sessionId);
        data.append('timeOnPage', timeOnPage.toString());
        data.append('scrollDepth', maxScrollDepth.current.toString());
        data.append('clicks', clickCount.current.toString());
        
        navigator.sendBeacon(`/api/community-blogs/${slug}/engagement`, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [slug, sessionId]);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(async () => {
    if (!user) {
      router.push(`/login?redirect=/community-blogs/${slug}`);
      return;
    }

    const previousData = data;
    setData(prev => ({
      ...prev,
      likes: prev.hasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
      hasLiked: !prev.hasLiked,
    }));

    try {
      const response = await fetch(`/api/community-blogs/${slug}/likes`, {
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
        
        // Refresh stats
        setTimeout(async () => {
          try {
            const statsResponse = await fetch(`/api/community-blogs/${slug}/stats`);
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              setData({
                views: stats.totalViews || 0,
                likes: stats.totalLikes || 0,
                comments: stats.totalComments || 0,
                hasLiked: stats.hasLiked || false,
                isLoading: false,
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
  }, [user, data, slug, router]);

  return {
    ...data,
    toggleLike,
    isAuthenticated: !!user,
  };
}

// Helper functions (reuse from original)
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }
  
  const SESSION_KEY = 'community_blog_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Hook for share functionality
export function useCommunityBlogShare(slug: string) {
  const trackShare = useCallback(async (platform: string) => {
    try {
      // You can create a share tracking endpoint if needed
      console.log(`Shared on ${platform}`);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, []);

  const shareOnTwitter = useCallback(() => {
    const url = `${window.location.origin}/community-blogs/${slug}`;
    const text = document.title;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank'
    );
    trackShare('twitter');
  }, [slug, trackShare]);

  const shareOnFacebook = useCallback(() => {
    const url = `${window.location.origin}/community-blogs/${slug}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('facebook');
  }, [slug, trackShare]);

  const shareOnLinkedIn = useCallback(() => {
    const url = `${window.location.origin}/community-blogs/${slug}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    );
    trackShare('linkedin');
  }, [slug, trackShare]);

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/community-blogs/${slug}`;
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
