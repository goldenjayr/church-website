import type { BlogPost, User as UserType, BlogCategory } from "@prisma/client"

export interface IVerse {
  text: string
  reference: string
}

export type BlogPostWithAuthor = BlogPost & {
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