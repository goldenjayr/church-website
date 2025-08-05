import { getSiteSettings } from '@/lib/settings-actions'
import { ContactPage } from "@/components/contact-page"

export default async function Page() {
  const settings = await getSiteSettings()

  return (
    <ContactPage settings={settings} />
  )
}
