import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
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

  // Load current user
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  // Track page view
  const trackView = useCallback(async () => {
    if (viewTracked.current) return;
    
    try {
      const sessionId = getOrCreateSessionId();
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
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('blog_session_id', data.sessionId);
          }
        }
      } else if (data.cached) {
        // View was already counted in this session
        viewTracked.current = true;
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [slug]);

  // Track engagement metrics
  const trackEngagement = useCallback(async () => {
    const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
    
    try {
      await fetch(`/api/blog/${slug}/engagement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          scrollDepth: maxScrollDepth.current,
          timeOnPage,
          clicks: clickCount.current,
        }),
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }, [slug]);

  // Debounced engagement tracking
  const debouncedTrackEngagement = useCallback(
    debounce(trackEngagement, 5000),
    [trackEngagement]
  );

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/blog/${slug}/stats`);
        if (response.ok) {
          const stats = await response.json();
          setData({
            views: stats.totalViews || 0,
            likes: stats.totalLikes || 0,
            hasLiked: stats.hasLiked || false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading blog stats:', error);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
    trackView();
  }, [slug, trackView]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight * 100;
      
      maxScrollDepth.current = Math.max(maxScrollDepth.current, Math.min(100, scrollPercentage));
      debouncedTrackEngagement();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedTrackEngagement]);

  // Track clicks
  useEffect(() => {
    const handleClick = () => {
      clickCount.current++;
      debouncedTrackEngagement();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [debouncedTrackEngagement]);

  // Track time on page with periodic updates
  useEffect(() => {
    engagementInterval.current = setInterval(() => {
      trackEngagement();
    }, 30000); // Every 30 seconds

    return () => {
      if (engagementInterval.current) {
        clearInterval(engagementInterval.current);
      }
    };
  }, [trackEngagement]);

  // Track when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
      
      // Use sendBeacon for reliable tracking on page leave
      const data = new FormData();
      data.append('sessionId', getOrCreateSessionId());
      data.append('timeOnPage', timeOnPage.toString());
      data.append('scrollDepth', maxScrollDepth.current.toString());
      data.append('clicks', clickCount.current.toString());
      
      navigator.sendBeacon(`/api/blog/${slug}/engagement`, data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [slug]);

  // Toggle like function
  const toggleLike = async () => {
    if (!user) {
      // Redirect to login
      router.push(`/login?redirect=/blog/${slug}`);
      return;
    }

    try {
      const response = await fetch(`/api/blog/${slug}/likes`, {
        method: data.hasLiked ? 'DELETE' : 'POST',
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
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

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
