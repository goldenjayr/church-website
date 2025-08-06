'use server'

import { prisma } from '@/lib/prisma-client'

export async function getDashboardData() {
  try {
    const [ 
      totalMembers, 
      totalBlogPosts, 
      upcomingEventsCount,
      activePrayerRequestsCount,
      unreadMessages,
      recentBlogPosts,
      recentEvents,
      recentMembers,
      recentMessages,
      blogPostStats,
      eventStats,
      galleryStats,
      doctrineStats
    ] = await prisma.$transaction([
      prisma.member.count(),
      prisma.blogPost.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.prayerRequest.count({ where: { status: 'ACTIVE' } }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.blogPost.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 2, 
        include: { author: true }
      }),
      prisma.event.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 2 
      }),
      prisma.member.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 2 
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2
      }),
      prisma.blogPost.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.event.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.gallery.groupBy({ by: ['published'], _count: { _all: true } }),
      prisma.doctrine.groupBy({ by: ['published'], _count: { _all: true } })
    ])

    const recentActivity = [
      ...recentBlogPosts.map(p => ({ type: 'blog', title: p.title, description: `By ${p.authorName || p.author.name}`, createdAt: p.createdAt, user: p.authorName || p.author.name })),
      ...recentEvents.map(e => ({ type: 'event', title: e.title, description: e.location, createdAt: e.createdAt, user: e.author.name })),
      ...recentMembers.map(m => ({ type: 'member', title: `${m.firstName} ${m.lastName}`, description: m.position?.name || 'New Member', createdAt: m.createdAt, user: 'System' })),
      ...recentMessages.map(msg => ({ type: 'message', title: `Message from ${msg.firstName} ${msg.lastName}`, description: msg.subject, createdAt: msg.createdAt, user: msg.email })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const parseStats = (stats: any[]) => ({ 
      published: stats.find(s => s.published)?._count._all || 0,
      drafts: stats.find(s => !s.published)?._count._all || 0,
      total: stats.reduce((acc, s) => acc + s._count._all, 0)
    });

    return {
      stats: {
        totalMembers,
        totalBlogPosts,
        upcomingEvents: upcomingEventsCount,
        prayerRequests: activePrayerRequestsCount,
        unreadMessages,
      },
      recentActivity,
      contentOverview: {
        blogPosts: parseStats(blogPostStats),
        events: parseStats(eventStats),
        galleryImages: parseStats(galleryStats),
        doctrines: parseStats(doctrineStats),
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return null
  }
}
