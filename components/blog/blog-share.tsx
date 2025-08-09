'use client';

import React, { useState } from 'react';
import { Share2, Link2, Twitter, Facebook, MessageCircle, Send, LinkIcon, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface BlogShareProps {
  title: string;
  excerpt?: string;
  slug: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function BlogShare({ title, excerpt, slug, className, variant = 'outline', size = 'default' }: BlogShareProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/community-blogs/${slug}`
    : '';
  
  const shareOnTwitter = () => {
    const text = `Check out this blog: ${title}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
    trackShare('twitter');
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    trackShare('facebook');
  };

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    trackShare('linkedin');
  };

  const shareOnMessenger = () => {
    // Facebook Messenger share - requires FB App ID in production
    // For now, we'll use the mobile-friendly messenger link
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_FB_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`;
    window.open(
      messengerUrl,
      '_blank',
      'width=600,height=400'
    );
    trackShare('messenger');
  };

  const shareViaEmail = () => {
    const subject = `Interesting blog: ${title}`;
    const body = `I thought you might enjoy this blog post:\n\n${title}\n\n${excerpt || ''}\n\nRead more: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    trackShare('email');
  };

  const shareViaWhatsApp = () => {
    const text = `Check out this blog: ${title}\n${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
    trackShare('whatsapp');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('✨ Link copied to clipboard!');
      trackShare('copy');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt || `Check out this blog post: ${title}`,
          url: shareUrl,
        });
        trackShare('native');
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copying link
      copyLink();
    }
  };

  // Track share events for analytics
  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/user-blogs/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          platform,
        }),
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          size={size}
          className={cn(
            "transition-all duration-200",
            className
          )}
        >
          <Share2 className={size === 'icon' ? 'w-4 h-4' : 'w-4 h-4 mr-2'} />
          {size !== 'icon' && 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 bg-white/95 backdrop-blur-lg border border-gray-200/60 shadow-xl rounded-xl"
      >
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share Blog</p>
        </div>
        <DropdownMenuSeparator className="bg-gray-200/60" />
        
        {/* Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <>
            <DropdownMenuItem 
              onClick={nativeShare}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Share</p>
                <p className="text-xs text-gray-500">Use system share</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-gray-200/60" />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={shareOnTwitter}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <Twitter className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Twitter</p>
            <p className="text-xs text-gray-500">Share on X</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareOnFacebook}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Facebook className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Facebook</p>
            <p className="text-xs text-gray-500">Share with friends</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={shareOnLinkedIn}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-sky-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">LinkedIn</p>
            <p className="text-xs text-gray-500">Share professionally</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={shareViaWhatsApp}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">WhatsApp</p>
            <p className="text-xs text-gray-500">Send message</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={shareViaEmail}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-500">Send email</p>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1 bg-gray-200/60" />
        
        <DropdownMenuItem 
          onClick={copyLink}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
            {copiedLink ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-400"
              >
                ✓
              </motion.div>
            ) : (
              <LinkIcon className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {copiedLink ? 'Copied!' : 'Copy link'}
            </p>
            <p className="text-xs text-gray-500">
              {copiedLink ? 'Link copied to clipboard' : 'Share anywhere'}
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
