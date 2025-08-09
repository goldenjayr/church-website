import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  getUserBlogPostBySlug,
  getRelatedUserBlogPosts
} from "@/lib/user-blog-actions"
import { getCurrentUser } from "@/lib/auth-actions"
import type { Metadata } from "next"
import { CommunityBlogPostClient } from "./community-blog-post-client"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getUserBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found | Community Blogs",
      description: "The blog post you're looking for doesn't exist."
    }
  }

  return {
    title: `${post.title} | Community Blogs`,
    description: post.excerpt || `Read ${post.title} by ${(post as any).author?.name || 'Community Member'}`,
    keywords: post.tags?.join(', '),
    authors: [{ name: (post as any).author?.name || 'Community Member' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [(post as any).author?.name || 'Community Member'],
      tags: post.tags,
      ...(post.coverImage && { images: [{ url: post.coverImage, alt: post.title }] })
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      ...(post.coverImage && { images: [post.coverImage] })
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [post, currentUser] = await Promise.all([
    getUserBlogPostBySlug(slug),
    getCurrentUser()
  ])

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/community-blogs">Back to Community Blogs</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get related posts
  const relatedPosts = await getRelatedUserBlogPosts(post.id, post.tags || [])

  return (
    <CommunityBlogPostClient
      post={post as any}
      relatedPosts={relatedPosts.slice(0, 3)}
      currentUser={currentUser}
    />
  )
}
