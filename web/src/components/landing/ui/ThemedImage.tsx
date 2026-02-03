"use client"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

const ThemedImage = ({
  lightSrc,
  darkSrc,
  alt,
  width,
  height,
  className,
}: {
  lightSrc: string
  darkSrc: string
  alt: string
  width: number
  height: number
  className?: string
}) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  let src

  switch (resolvedTheme) {
    case "light":
      src = lightSrc
      break
    case "dark":
      src = darkSrc
      break
    default:
      src = lightSrc
      break
  }

  // Use useEffect to ensure rendering happens only after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial hydration, use lightSrc to match server-rendered output
  // After mounted, use the resolved theme
  const displaySrc = mounted && resolvedTheme ? src : lightSrc

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

export default ThemedImage
