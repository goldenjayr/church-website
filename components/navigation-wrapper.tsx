import { Suspense } from 'react'
import { NavigationSkeleton } from './navigation-skeleton'
import dynamic from 'next/dynamic'

// Dynamically import the navigation to prevent it from affecting static generation
const Navigation = dynamic(
  () => import('./navigation').then(mod => mod.Navigation),
  {
    ssr: true,
    loading: () => <NavigationSkeleton />
  }
)

export function NavigationWrapper() {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <Navigation />
    </Suspense>
  )
}
