import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  threshold?: number
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0
    }

    const observer = new IntersectionObserver(handleObserver, option)
    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver, threshold])

  return observerTarget
}
