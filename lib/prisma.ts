// Remove Prisma dependency and create mock data structure instead

export interface User {
  id: string
  email: string
  name: string
  role: "USER" | "ADMIN"
}

export interface DailyVerse {
  id: string
  verse: string
  reference: string
  date: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  published: boolean
  featured: boolean
  tags: string[]
  category: "DEVOTIONAL" | "SERMON" | "ARTICLE" | "ANNOUNCEMENT"
  author: string
  createdAt: string
  updatedAt: string
}

export interface Doctrine {
  id: string
  title: string
  content: string
  category: string
  order: number
  published: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image?: string
  maxAttendees?: number
  published: boolean
  author: string
  attendees: number
}

export interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  eventDate?: string
  published: boolean
}

export interface SabbathSchedule {
  id: string
  date: string
  theme: string
  speaker: string
  scripture?: string
  notes?: string
  published: boolean
}

// Mock data
export const mockData = {
  dailyVerses: [
    {
      id: "1",
      verse:
        "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
      reference: "Jeremiah 29:11",
      date: "2024-01-15",
    },
    {
      id: "2",
      verse:
        "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
      reference: "Proverbs 3:5-6",
      date: "2024-01-16",
    },
  ] as DailyVerse[],

  blogPosts: [
    {
      id: "1",
      title: "Walking in Faith Daily",
      slug: "walking-in-faith-daily",
      content:
        "Faith is not just a Sunday experience, but a daily walk with God. In this devotional, we explore how to maintain a strong relationship with Christ throughout the week...",
      excerpt:
        "Discover how to make faith a daily practice in your life and maintain a strong relationship with Christ throughout the week.",
      published: true,
      featured: true,
      tags: ["faith", "daily-walk", "spiritual-growth"],
      category: "DEVOTIONAL" as const,
      author: "Pastor John Smith",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
    },
    {
      id: "2",
      title: "The Power of Prayer",
      slug: "the-power-of-prayer",
      content:
        "Prayer is our direct line of communication with God. It is through prayer that we find strength, guidance, and peace in our daily lives...",
      excerpt:
        "Learn about the transformative power of prayer in your spiritual journey and how it can change your life.",
      published: true,
      featured: false,
      tags: ["prayer", "spiritual-discipline", "communication"],
      category: "DEVOTIONAL" as const,
      author: "Elder Mary Johnson",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-08",
    },
  ] as BlogPost[],
}

// Create admin user (password should be hashed in real implementation)
export const mockAdmin = {
  id: "admin1",
  email: "admin@divinejesus.org",
  password: "admin123", // In real app, this would be hashed
  name: "Admin User",
  role: "ADMIN" as const,
}

// Mock authentication functions
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  if (email === mockAdmin.email && password === mockAdmin.password) {
    return {
      id: mockAdmin.id,
      email: mockAdmin.email,
      name: mockAdmin.name,
      role: mockAdmin.role,
    }
  }
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would check session/token
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  }
  return null
}

export function setCurrentUser(user: User | null) {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentUser")
    }
  }
}

// Mock API functions
export async function getDailyVerse(): Promise<DailyVerse> {
  // Return today's verse or the first one as fallback
  return mockData.dailyVerses[0]
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return mockData.blogPosts
}
