"use client"

import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"
import { UnifiedBlogPost } from "@/components/blog/unified-blog-post"

type BlogPostWithAuthor = BlogPost & {
  author: UserType
  member?: {
    id: string
    firstName: string
    lastName: string
    imageUrl?: string | null
    position?: {
      id: string
      name: string
      color: string
    } | null
  } | null
  category: BlogCategory | null
}

interface BlogPostClientProps {
  post: BlogPostWithAuthor
  relatedPosts: BlogPostWithAuthor[]
}

export function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {

  return (
    <UnifiedBlogPost 
      post={post} 
      relatedPosts={relatedPosts}
      postType="church"
    />
  )
}
