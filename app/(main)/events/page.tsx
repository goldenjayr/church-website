import { getPublicEvents } from "@/lib/public-event-actions"
import { EventsPage } from "@/components/events-page"

export default async function Page() {
  const eventsData = await getPublicEvents()
  return (
    <EventsPage events={eventsData} />
  )
}