import { getSiteSettings } from '@/lib/settings-actions'
import { NewHerePage } from "@/components/new-here-page"

export default async function Page() {
  const settings = await getSiteSettings()
  return (
    <NewHerePage settings={settings} />
  )
}
