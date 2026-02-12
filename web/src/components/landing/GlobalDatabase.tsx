"use client"
import createGlobe from "cobe"
import { FunctionComponent, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export const GlobalDatabase: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    let phi = 4.7
    
    // Get theme-aware colors from CSS variables
    const isDark = resolvedTheme === "dark"
    
    // Extract colors from CSS variables
    const getColorFromCSS = (variable: string): [number, number, number] => {
      if (typeof window === "undefined") return [0.5, 0.5, 0.5]
      
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim()
      
      // Parse oklch color format: oklch(L C H)
      const match = color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
      if (match) {
        const lightness = parseFloat(match[1])
        // Convert lightness to RGB-like values for the globe
        return [lightness * 0.8, lightness * 0.8, lightness * 0.8]
      }
      
      // Fallback values
      return isDark ? [0.2, 0.2, 0.2] : [0.4, 0.4, 0.4]
    }

    const baseColor = getColorFromCSS("--muted-foreground")
    const glowColor: [number, number, number] = isDark 
      ? [baseColor[0] * 0.5, baseColor[1] * 0.5, baseColor[2] * 0.5]
      : [baseColor[0] * 0.6, baseColor[1] * 0.6, baseColor[2] * 0.6]
    
    // Use border color for markers
    const borderColor = getColorFromCSS("--border")
    const markerColor: [number, number, number] = [
      borderColor[0] * 255,
      borderColor[1] * 255,
      borderColor[2] * 255
    ]

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 1200 * 2,
      height: 1200 * 2,
      phi: 0,
      theta: -0.3,
      dark: isDark ? 1 : 0.8,
      diffuse: 1.2,
      mapSamples: 25000,
      mapBrightness: isDark ? 13 : 10,
      mapBaseBrightness: isDark ? 0.05 : 0.1,
      baseColor,
      glowColor,
      markerColor,
      markers: [
        // { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
        // { location: [40.7128, -74.006], size: 0.03 }, // New York City
        // { location: [35.6895, 139.6917], size: 0.03 }, // Tokyo
        // { location: [28.7041, 77.1025], size: 0.03 }, // Delhi
      ],
      onRender: (state: { phi?: number }) => {
        state.phi = phi
        phi += 0.0002
      },
    })

    return () => {
      globe.destroy()
    }
  }, [resolvedTheme])

  const features = [
    {
      name: "Global Clusters",
      description: "Enable low-latency global access, enhancing performance.",
    },
    {
      name: "Serverless Triggers",
      description: "Trigger functions automatically for dynamic app behavior.",
    },
    {
      name: "Monitoring & Alerts",
      description:
        "Monitor health with key metrics or integrate third-party tools.",
    },
  ]

  return (
    <div className="px-3">
      <section
        aria-labelledby="global-database-title"
        className="relative mx-auto mt-28 flex w-full max-w-6xl flex-col items-center justify-center overflow-hidden rounded-3xl bg-card pt-24 shadow-xl shadow-primary/30 md:mt-40"
      >
        <div className="absolute top-[17rem] size-[40rem] rounded-full bg-primary blur-3xl md:top-[20rem]" />
        <div className="z-10 inline-block rounded-lg border border-primary/20 bg-primary/20 px-3 py-1.5 font-semibold uppercase leading-4 tracking-tight sm:text-sm">
          <span className="bg-gradient-to-b from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
            Made for the cloud
          </span>
        </div>
        <h2
          id="global-database-title"
          className="z-10 mt-6 inline-block bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text px-2 text-center text-5xl font-bold tracking-tighter text-transparent md:text-8xl"
        >
          The global <br /> cloud database
        </h2>
        <canvas
          className="absolute top-[7.1rem] z-20 aspect-square size-full max-w-fit md:top-[12rem]"
          ref={canvasRef}
          style={{ width: 1200, height: 1200 }}
        />
        <div className="z-20 -mt-32 h-[36rem] w-full overflow-hidden md:-mt-36">
          <div className="absolute bottom-0 h-3/5 w-full bg-gradient-to-b from-transparent via-card/95 to-card" />
          <div className="absolute inset-x-6 bottom-12 m-auto max-w-4xl md:top-2/3">
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 rounded-lg border border-border bg-card/50 px-6 py-6 shadow-xl backdrop-blur md:grid-cols-3 md:p-8">
              {features.map((item) => (
                <div key={item.name} className="flex flex-col gap-2">
                  <h3 className="whitespace-nowrap bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-lg font-semibold text-transparent md:text-xl">
                    {item.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
