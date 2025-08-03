import { BlogPage } from "@/components/blog-page";
import { getPublishedBlogPosts, getPublishedBlogCategories } from "@/lib/public-blog-actions"
import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"
import { BlogPostWithAuthor } from "@/lib/types"

export default async function Page() {
  const [posts, categoriesData] = await Promise.all([
    getPublishedBlogPosts(),
    getPublishedBlogCategories()
  ])

  return (
    <BlogPage blogPosts={posts as BlogPostWithAuthor[]} categories={categoriesData as BlogCategory[]} />
  )
}
