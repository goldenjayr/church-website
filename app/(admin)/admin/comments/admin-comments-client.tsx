"use client"

import { useState } from "react"
import type { User } from "@prisma/client"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { CommentsManagement } from "./comments-management"

interface AdminCommentsClientProps {
  user: User
  initialComments: any[]
  initialStats: {
    total: number
    pending: number
    flagged: number
    reports: number
  }
}

export function AdminCommentsClient({ user, initialComments, initialStats }: AdminCommentsClientProps) {
  const [currentUser, setCurrentUser] = useState(user)

  const handleLogout = () => {
    setCurrentUser(null as any)
    window.location.href = "/login"
  }

  return (
    <AdminPageLayout user={currentUser} onLogout={handleLogout}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CommentsManagement 
          initialComments={initialComments}
          initialStats={initialStats}
        />
      </main>
    </AdminPageLayout>
  )
}
