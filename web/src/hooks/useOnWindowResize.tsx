// Enhanced useOnWindowResize Hook [v1.0.0]
// Comprehensive window resize handling with advanced features

import * as React from "react"

// Type definitions for maximum flexibility and type safety
export interface WindowDimensions {
  width: number
  height: number
}

export interface ResizeEventData extends WindowDimensions {
  previousWidth: number
  previousHeight: number
  deltaWidth: number
  deltaHeight: number
}

export interface UseWindowResizeOptions {
  debounceMs?: number
  throttleMs?: number
  immediate?: boolean
  passive?: boolean
  capture?: boolean
  includeDimensions?: boolean
  onlyOnChange?: boolean
}

export type ResizeHandler = () => void
export type ResizeHandlerWithData = (data: ResizeEventData) => void
export type ResizeHandlerFlexible = ResizeHandler | ResizeHandlerWithData

// Utility function to debounce calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utility function to throttle calls
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Get current window dimensions safely
function getWindowDimensions(): WindowDimensions {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// Main hook - Basic version for simple use cases
export function useOnWindowResize(handler: ResizeHandler): void
export function useOnWindowResize(
  handler: ResizeHandlerFlexible,
  options: UseWindowResizeOptions
): void
export function useOnWindowResize(
  handler: ResizeHandlerFlexible,
  options: UseWindowResizeOptions = {}
): void {
  const {
    debounceMs = 0,
    throttleMs = 0,
    immediate = true,
    passive = true,
    capture = false,
    includeDimensions = false,
    onlyOnChange = false
  } = options

  // Store previous dimensions for comparison and delta calculation
  const previousDimensionsRef = React.useRef<WindowDimensions>(getWindowDimensions())
  const handlerRef = React.useRef<ResizeHandlerFlexible>(handler)

  // Update handler ref when handler changes
  React.useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  React.useEffect(() => {
    // Early return for SSR
    if (typeof window === 'undefined') return

    const executeHandler = () => {
      const currentDimensions = getWindowDimensions()
      const previousDimensions = previousDimensionsRef.current

      // Skip execution if onlyOnChange is true and dimensions haven't changed
      if (onlyOnChange && 
          currentDimensions.width === previousDimensions.width && 
          currentDimensions.height === previousDimensions.height) {
        return
      }

      try {
        if (includeDimensions) {
          const resizeData: ResizeEventData = {
            ...currentDimensions,
            previousWidth: previousDimensions.width,
            previousHeight: previousDimensions.height,
            deltaWidth: currentDimensions.width - previousDimensions.width,
            deltaHeight: currentDimensions.height - previousDimensions.height
          }
          
          // Type-safe call - check if handler expects data
          if (handlerRef.current.length > 0) {
            (handlerRef.current as ResizeHandlerWithData)(resizeData)
          } else {
            (handlerRef.current as ResizeHandler)()
          }
        } else {
          (handlerRef.current as ResizeHandler)()
        }

        // Update previous dimensions
        previousDimensionsRef.current = currentDimensions
      } catch (error) {
        console.error('Error in resize handler:', error)
      }
    }

    // Apply debouncing or throttling if specified
    let processedHandler = executeHandler
    
    if (debounceMs > 0) {
      processedHandler = debounce(executeHandler, debounceMs)
    } else if (throttleMs > 0) {
      processedHandler = throttle(executeHandler, throttleMs)
    }

    // Execute immediately if requested
    if (immediate) {
      executeHandler()
    }

    // Set up event listener with specified options
    const eventOptions = {
      passive,
      capture
    }

    window.addEventListener('resize', processedHandler, eventOptions)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', processedHandler, eventOptions)
    }
  }, [debounceMs, throttleMs, immediate, passive, capture, includeDimensions, onlyOnChange])
}

// Advanced hook that returns window dimensions and provides more control
export function useWindowDimensions(options: UseWindowResizeOptions = {}) {
  const [dimensions, setDimensions] = React.useState<WindowDimensions>(getWindowDimensions)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useOnWindowResize(
    React.useCallback(() => {
      setDimensions(getWindowDimensions())
    }, []),
    options
  )

  return {
    ...dimensions,
    isClient
  }
}

// Hook for tracking specific dimension changes
export function useWindowWidth(options: UseWindowResizeOptions = {}) {
  const { width, isClient } = useWindowDimensions(options)
  return { width, isClient }
}

export function useWindowHeight(options: UseWindowResizeOptions = {}) {
  const { height, isClient } = useWindowDimensions(options)
  return { height, isClient }
}

// Hook with resize event data for advanced use cases
export function useWindowResizeWithData(
  handler: ResizeHandlerWithData,
  options: Omit<UseWindowResizeOptions, 'includeDimensions'> = {}
) {
  useOnWindowResize(handler, { ...options, includeDimensions: true })
}

// Legacy compatibility - maintains exact same API as original
export function useOnWindowResizeLegacy(handler: () => void) {
  useOnWindowResize(handler, { immediate: true })
}

// Utility hook for common responsive breakpoint detection
export function useIsWindowSmallerThan(breakpoint: number, options: UseWindowResizeOptions = {}) {
  const [isSmaller, setIsSmaller] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useOnWindowResize(
    React.useCallback(() => {
      setIsSmaller(window.innerWidth < breakpoint)
    }, [breakpoint]),
    options
  )

  return { isSmaller, isClient }
}

// Export utility functions for external use
export { debounce, throttle, getWindowDimensions }

// Default export for convenience
export default useOnWindowResize
