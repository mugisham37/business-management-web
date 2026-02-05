import * as React from "react"

// Default breakpoints following common design system standards
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS
export type BreakpointValue = typeof BREAKPOINTS[BreakpointKey]

// Hook options interface for maximum flexibility
export interface UseResponsiveOptions {
  breakpoint?: BreakpointValue
  ssrFallback?: boolean
  debounceMs?: number
}

// Enhanced mobile detection hook with full customization
export function useIsMobile(options: UseResponsiveOptions = {}) {
  const { 
    breakpoint = BREAKPOINTS.mobile, 
    ssrFallback = false,
    debounceMs = 0 
  } = options

  const [isMobile, setIsMobile] = React.useState<boolean>(ssrFallback)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    // Early return if window is not available (SSR)
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout | null = null

    const updateMobileState = () => {
      const newIsMobile = window.innerWidth < breakpoint
      setIsMobile(newIsMobile)
    }

    const debouncedUpdate = debounceMs > 0 
      ? () => {
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(updateMobileState, debounceMs)
        }
      : updateMobileState

    // Use matchMedia for better performance and accuracy
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Set initial state
    updateMobileState()

    // Listen for changes using both matchMedia and resize for maximum compatibility
    mediaQuery.addEventListener('change', handleChange)
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [breakpoint, debounceMs])

  return { isMobile, isClient }
}

// Convenience hooks for common breakpoints
export function useIsTablet(options: Omit<UseResponsiveOptions, 'breakpoint'> = {}) {
  return useIsMobile({ ...options, breakpoint: BREAKPOINTS.tablet })
}

export function useIsDesktop(options: Omit<UseResponsiveOptions, 'breakpoint'> = {}) {
  const { isMobile: isNotDesktop, isClient } = useIsMobile({ 
    ...options, 
    breakpoint: BREAKPOINTS.desktop 
  })
  return { isDesktop: !isNotDesktop, isClient }
}

// Advanced responsive hook for multiple breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<BreakpointKey>('mobile')
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    if (typeof window === 'undefined') return

    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS.wide) {
        setBreakpoint('wide')
      } else if (width >= BREAKPOINTS.desktop) {
        setBreakpoint('desktop')
      } else if (width >= BREAKPOINTS.tablet) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('mobile')
      }
    }

    updateBreakpoint()

    const handleResize = () => updateBreakpoint()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { 
    breakpoint, 
    isClient,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide'
  }
}

// Legacy support - maintains backward compatibility
export function useIsMobileLegacy() {
  const { isMobile } = useIsMobile()
  return isMobile
}

// Utility function for getting current breakpoint value
export function getCurrentBreakpoint(): BreakpointKey {
  if (typeof window === 'undefined') return 'mobile'
  
  const width = window.innerWidth
  
  if (width >= BREAKPOINTS.wide) return 'wide'
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}
