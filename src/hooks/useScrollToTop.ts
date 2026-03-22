import { useRef, useEffect } from 'react'

export function useScrollToTop(dependencia?: unknown) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [dependencia])

  return ref
}
