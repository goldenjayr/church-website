import { getCurrentUser } from "@/lib/auth-actions"
import { NavigationClient } from "./navigation-client"

export async function Navigation() {
  const user = await getCurrentUser()
  
  return <NavigationClient initialUser={user} />
}
