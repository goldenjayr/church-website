// Helper function to determine the URL for a blog post
export function getBlogPostUrl(post: any) {
  if (post.postType === 'church') {
    return `/blog/${post.slug}`
  } else {
    return `/community-blogs/${post.slug}`
  }
}

// Function to create a combined blog card component data
export function createCombinedBlogCard(post: any) {
  const url = getBlogPostUrl(post)
  const isChurchPost = post.postType === 'church'
  
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || "No description available",
    coverImage: isChurchPost ? post.imageUrl : post.coverImage,
    tags: post.tags || [],
    author: post.author,
    publishedAt: post.publishedAt || post.createdAt,
    viewCount: post.viewCount || 0,
    likeCount: post.likeCount || 0,
    commentCount: post._count?.comments || 0,
    url,
    category: isChurchPost ? post.category : null,
    postType: post.postType
  }
}
