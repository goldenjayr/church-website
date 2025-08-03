import { getLeadershipTeam } from "@/lib/public-member-actions";
import { AboutSection } from "@/components/about-section";


export default async function AboutPage() {
  const leadership = await getLeadershipTeam();
  return (
    <AboutSection leadership={leadership} />
  )
}
