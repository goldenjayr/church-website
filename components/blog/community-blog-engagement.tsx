'use client';

import React, { useState } from 'react';
import { Heart, Eye, Share2, Twitter, Facebook, Linkedin, MessageCircle, LinkIcon, Sparkles } from 'lucide-react';
import { useCommunityBlogEngagement, useCommunityBlogShare } from '@/hooks/use-community-blog-engagement';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommunityBlogEngagementProps {
  slug: string;
  className?: string;
}

export function CommunityBlogEngagement({ slug, className }: CommunityBlogEngagementProps) {
  const { views, likes, comments, hasLiked, isLoading, toggleLike, isAuthenticated } = useCommunityBlogEngagement(slug);
  const { shareOnTwitter, shareOnFacebook, shareOnLinkedIn, copyLink } = useCommunityBlogShare(slug);
  const [isLiking, setIsLiking] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    if (!hasLiked) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
    
    try {
      await toggleLike();
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyLink();
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: '✨ Link copied!',
        description: 'Share this article with your community.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="h-11 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear" 
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-11 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear",
              delay: 0.2
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-11 w-11 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "linear",
              delay: 0.4 
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        className={cn('flex items-center gap-3', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          staggerChildren: 0.1
        }}
      >
        {/* Views Counter - Modern Glass Effect */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm border border-gray-200/60 rounded-full hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 cursor-default">
              <Eye className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {formatNumber(views)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white border-gray-800">
            <p className="text-xs">{views} {views === 1 ? 'person viewed' : 'people viewed'} this article</p>
          </TooltipContent>
        </Tooltip>

        {/* Comments Counter - Modern Glass Effect */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-sm border border-gray-200/60 rounded-full hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300 cursor-default">
              <MessageCircle className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {formatNumber(comments)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white border-gray-800">
            <p className="text-xs">{comments} {comments === 1 ? 'comment' : 'comments'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Like Button - Modern Animated Design */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLike}
              disabled={isLiking || !isAuthenticated}
              className={cn(
                "group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 transform active:scale-95",
                hasLiked
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25"
                  : "bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border border-gray-200/80 hover:border-pink-300 text-gray-700 hover:text-pink-600",
                (!isAuthenticated || isLiking) && "opacity-75 cursor-not-allowed"
              )}
            >
              {/* Sparkle Animation */}
              <AnimatePresence>
                {showSparkles && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                animate={{
                  scale: isLiking ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-all duration-300",
                    hasLiked && "fill-current",
                    isLiking && "animate-pulse"
                  )}
                />
              </motion.div>
              
              <span className={cn(
                "text-sm font-semibold transition-colors",
                hasLiked ? "text-white" : "text-gray-700 group-hover:text-pink-600"
              )}>
                {formatNumber(likes)}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-900 text-white border-gray-800">
            <p className="text-xs">
              {!isAuthenticated 
                ? "Sign in to like this article" 
                : hasLiked 
                  ? "You liked this article" 
                  : "Like this article"
              }
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Share Button - Modern Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Share2 className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 bg-white/95 backdrop-blur-lg border border-gray-200/60 shadow-xl rounded-xl">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share Article</p>
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
            
            <DropdownMenuSeparator className="my-1 bg-gray-200/60" />
            
            <DropdownMenuItem 
              onClick={handleCopyLink}
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
      </motion.div>
    </TooltipProvider>
  );
}

// Compact version for list views
export function CommunityBlogEngagementCompact({ slug, className }: CommunityBlogEngagementProps) {
  const { views, likes, comments, isLoading } = useCommunityBlogEngagement(slug);

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-3 text-sm text-gray-500', className)}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 text-sm text-gray-500', className)}>
      <span className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        {formatNumber(views)}
      </span>
      <span className="flex items-center gap-1">
        <Heart className="w-4 h-4" />
        {formatNumber(likes)}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" />
        {formatNumber(comments)}
      </span>
    </div>
  );
}

// Helper function to format numbers
function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) {
    return '0';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
