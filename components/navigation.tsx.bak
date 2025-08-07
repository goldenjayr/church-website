import { getCurrentUser, logout } from "@/lib/auth-actions"
import { NavigationClient } from "./navigation-client"


export async function Navigation() {
  const currentUser = await getCurrentUser()

  return (
    <NavigationClient user={currentUser} />
  )
}
