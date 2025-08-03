import { getLeadershipTeam } from "@/lib/public-member-actions";
import { AboutPage } from "@/components/about-page";


export default async function Page() {
  const leadership = await getLeadershipTeam();
  return (
    <AboutPage leadership={leadership} />
  )
}
