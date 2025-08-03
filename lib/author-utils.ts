// Utility functions for handling blog post authors

export function getAuthorDisplay(post: any) {
  // If there's a member assigned, use member info
  if (post.member) {
    return {
      name: `${post.member.firstName} ${post.member.lastName}`,
      position: post.member.position?.name || null,
      positionColor: post.member.position?.color || null,
      avatar: post.member.imageUrl || null,
      email: post.member.email || null,
      bio: post.member.bio || null,
      type: 'member' as const
    }
  }
  
  // If there's a custom author name, use that
  if (post.authorName) {
    return {
      name: post.authorName,
      position: null,
      positionColor: null,
      avatar: null,
      email: null,
      bio: null,
      type: 'custom' as const
    }
  }
  
  // Fall back to the logged-in user who created the post
  return {
    name: post.author?.name || 'Unknown Author',
    position: null,
    positionColor: null,
    avatar: null,
    email: post.author?.email || null,
    bio: null,
    type: 'user' as const
  }
}

export function getAuthorInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}