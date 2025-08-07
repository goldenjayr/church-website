'use server'

import { prisma } from '@/lib/prisma-client'

export async function getDashboardData() {
  try {
    const [ 
      totalMembers, 
      totalBlogPosts, 
      upcomingEventsCount,
      unreadMessages,
      recentBlogPosts,
      recentEvents,
      recentMembers,
      recentMessages,
      blogPostStats,
      eventStats,
      doctrineStats,
      memberStats,
      positionStats,
      monthlyMembers,
      todayMessages
    ] = await prisma.$transaction([
      prisma.member.count(),
      prisma.blogPost.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.blogPost.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3, 
        include: { author: true }
      }),
      prisma.event.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        include: { author: true }
      }),
      prisma.member.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 3,
        include: { position: true }
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
      }),
      prisma.blogPost.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.event.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.doctrine.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.member.groupBy({ by: ['active'], _count: { _all: true } }),
      prisma.position.groupBy({ by: ['active'], _count: { _all: true } }),
      // Get members joined this month
      prisma.member.count({ 
        where: { 
          joinDate: { 
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      }),
      // Get messages from today
      prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    const recentActivity = [
      ...recentBlogPosts.map(p => ({ 
        type: 'blog', 
        title: 'New blog post published', 
        description: p.title, 
        createdAt: p.createdAt, 
        user: p.authorName || p.author?.name || 'Admin' 
      })),
      ...recentEvents.map(e => ({ 
        type: 'event', 
        title: 'Event created', 
        description: e.title, 
        createdAt: e.createdAt, 
        user: e.author?.name || 'Admin' 
      })),
      ...recentMembers.map(m => ({ 
        type: 'member', 
        title: 'New member joined', 
        description: `${m.firstName} ${m.lastName}`, 
        createdAt: m.createdAt, 
        user: 'System' 
      })),
      ...recentMessages.map(msg => ({ 
        type: 'message', 
        title: `Message from ${msg.firstName} ${msg.lastName}`, 
        description: msg.subject, 
        createdAt: msg.createdAt, 
        user: msg.email 
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

    const parseStats = (stats: any[]) => ({ 
      published: stats.find(s => s.published)?._count._all || 0,
      drafts: stats.find(s => !s.published)?._count._all || 0,
      total: stats.reduce((acc, s) => acc + s._count._all, 0)
    });

    const parseActiveStats = (stats: any[]) => ({ 
      active: stats.find(s => s.active)?._count._all || 0,
      inactive: stats.find(s => !s.active)?._count._all || 0,
      total: stats.reduce((acc, s) => acc + s._count._all, 0)
    });

    return {
      stats: {
        totalMembers,
        totalBlogPosts,
        upcomingEvents: upcomingEventsCount,
        unreadMessages,
        monthlyMembers,
        todayMessages
      },
      recentActivity,
      contentOverview: {
        blogPosts: parseStats(blogPostStats),
        events: parseStats(eventStats),
        doctrines: parseStats(doctrineStats),
        members: parseActiveStats(memberStats),
        positions: parseActiveStats(positionStats),
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    // Return default data structure to prevent UI errors
    return {
      stats: {
        totalMembers: 0,
        totalBlogPosts: 0,
        upcomingEvents: 0,
        unreadMessages: 0,
        monthlyMembers: 0,
        todayMessages: 0
      },
      recentActivity: [],
      contentOverview: {
        blogPosts: { published: 0, drafts: 0, total: 0 },
        events: { published: 0, drafts: 0, total: 0 },
        doctrines: { published: 0, drafts: 0, total: 0 },
        members: { active: 0, inactive: 0, total: 0 },
        positions: { active: 0, inactive: 0, total: 0 },
      }
    }
  }
}

// Quick action functions
export async function getQuickStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    
    const [todayStats, weekStats] = await prisma.$transaction([
      prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM "ContactMessage" WHERE "createdAt" >= ${today}) as messages,
          (SELECT COUNT(*) FROM "Member" WHERE "createdAt" >= ${today}) as members,
          (SELECT COUNT(*) FROM "PrayerRequest" WHERE "createdAt" >= ${today}) as prayers
      `,
      prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM "BlogPost" WHERE "createdAt" >= ${thisWeek}) as posts,
          (SELECT COUNT(*) FROM "Event" WHERE "createdAt" >= ${thisWeek}) as events,
          (SELECT COUNT(*) FROM "Gallery" WHERE "createdAt" >= ${thisWeek}) as images
      `
    ])
    
    return { todayStats, weekStats }
  } catch (error) {
    console.error("Error fetching quick stats:", error)
    return null
  }
}
