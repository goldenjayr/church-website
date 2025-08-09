"use client"

import { UnifiedBlogPost } from "@/components/blog/unified-blog-post"

interface CommunityBlogPostClientProps {
  post: any
  relatedPosts: any[]
  currentUser?: any
}

export function CommunityBlogPostClient({ post, relatedPosts, currentUser }: CommunityBlogPostClientProps) {
  return (
    <UnifiedBlogPost 
      post={post} 
      relatedPosts={relatedPosts}
      currentUser={currentUser}
      postType="community"
    />
  )
}
