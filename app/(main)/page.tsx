import { HeroSection } from "@/components/hero-section"
import { VerseOfTheDay } from "@/components/verse-of-the-day"
import { UpcomingEvents } from "@/components/upcoming-events"
import { QuickLinks } from "@/components/quick-links"
import { WelcomeSection } from "@/components/welcome-section"
import { PageWrapper } from "@/components/page-wrapper"
import { getRandomVerse } from "@/lib/api"

export default async function HomePage() {
  const random_verse = await getRandomVerse()

  return (
    <PageWrapper>
      <HeroSection />
      <VerseOfTheDay verse={random_verse} />
      <WelcomeSection />
      <QuickLinks />
      <UpcomingEvents />
    </PageWrapper>
  )
}
