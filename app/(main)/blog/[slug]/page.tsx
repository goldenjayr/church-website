import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/public-blog-actions"
import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"
import type { Metadata } from "next"
import { BlogPostClient } from "./blog-post-client"

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

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found | Divine Jesus Church",
      description: "The blog post you're looking for doesn't exist."
    }
  }

  return {
    title: `${post.title} | Divine Jesus Church Blog`,
    description: post.metaDescription || post.excerpt || `Read ${post.title} - a ${(post as any).category?.name.toLowerCase() || 'blog post'} by ${(post as any).author?.name || 'Divine Jesus Church'}`,
    keywords: post.tags.join(', '),
    authors: [{ name: (post as any).author?.name || 'Divine Jesus Church' }],
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt || '',
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [(post as any).author?.name || 'Divine Jesus Church'],
      tags: post.tags,
      ...(post.imageUrl && { images: [{ url: post.imageUrl, alt: post.title }] })
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt || '',
      ...(post.imageUrl && { images: [post.imageUrl] })
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get related posts
  const relatedPosts = await getRelatedBlogPosts(post.id, post.categoryId, 3)

  return (
    <BlogPostClient
      post={post as BlogPostWithAuthor}
      relatedPosts={relatedPosts as BlogPostWithAuthor[]}
    />
  )
}
