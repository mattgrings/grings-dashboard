import { useEffect } from 'react'

export function useCursorGlow() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.querySelectorAll('.glow-surface').forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        ;(el as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
        ;(el as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
      })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
}
