import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-actions"
import { prisma } from "@/lib/prisma-client"
import { AdminCommentsClient } from "./admin-comments-client"

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  // Fetch all comments with related data
  const comments = await prisma.blogComment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      blogPost: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      reports: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          replies: true,
          commentLikes: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // Show pending/flagged first
      { createdAt: "desc" },
    ],
  })

  // Get stats
  const [totalComments, pendingComments, flaggedComments, totalReports] = await Promise.all([
    prisma.blogComment.count(),
    prisma.blogComment.count({ where: { status: "PENDING" } }),
    prisma.blogComment.count({ where: { status: "FLAGGED" } }),
    prisma.commentReport.count({ where: { status: "PENDING" } }),
  ])

  const stats = {
    total: totalComments,
    pending: pendingComments,
    flagged: flaggedComments,
    reports: totalReports,
  }

  return (
    <AdminCommentsClient
      user={user}
      initialComments={JSON.parse(JSON.stringify(comments))}
      initialStats={stats}
    />
  )
}
