'use client';

import React, { useState } from 'react';
import { Share2, Link2, Twitter, Facebook, MessageCircle, Send, LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface EventShareProps {
  eventId: string;
  eventTitle: string;
  className?: string;
}

export function EventShare({ eventId, eventTitle, className }: EventShareProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareOnTwitter = () => {
    const text = `Join us for ${eventTitle} at Divine Jesus Church!`;
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
    const subject = `Invitation: ${eventTitle}`;
    const body = `I'd like to invite you to ${eventTitle} at Divine Jesus Church!\n\nCheck it out here: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    trackShare('email');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: '✨ Link copied!',
        description: 'Share this event with your friends.',
      });
      trackShare('copy');
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Track share events for analytics
  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/events/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
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
          variant="outline" 
          size="lg" 
          className={cn(
            "hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-200",
            className
          )}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Event
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 bg-white/95 backdrop-blur-lg border border-gray-200/60 shadow-xl rounded-xl"
      >
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share Event</p>
        </div>
        <DropdownMenuSeparator className="bg-gray-200/60" />
        
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
          onClick={shareOnMessenger}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Messenger</p>
            <p className="text-xs text-gray-500">Send directly</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={shareViaEmail}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-500">Send invitation</p>
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
