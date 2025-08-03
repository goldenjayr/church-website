import { getPublishedDoctrines, getDoctrineCategories } from "@/lib/public-doctrine-actions"
import { getFeaturedBlogPosts } from "@/lib/public-blog-actions"
import type { Doctrine } from "@prisma/client"
import { DoctrinesPage } from "@/components/doctrines-page"

interface DoctrineCategory {
  name: string
  doctrines: Doctrine[]
}

export default async function Page() {

  const [doctrines, blogs] = await Promise.all([
    getPublishedDoctrines(),
    getFeaturedBlogPosts(3)
  ])

  // Group doctrines by category
  const grouped = doctrines.reduce((acc: { [key: string]: Doctrine[] }, doctrine) => {
    if (!acc[doctrine.category]) {
      acc[doctrine.category] = []
    }
    acc[doctrine.category].push(doctrine)
    return acc
  }, {})

  const categories: DoctrineCategory[] = Object.entries(grouped).map(([name, doctrines]) => ({
    name,
    doctrines: doctrines.sort((a, b) => a.order - b.order)
  }))


  return (
    <DoctrinesPage doctrineCategories={categories} featuredBlogs={blogs} />
  )

}
