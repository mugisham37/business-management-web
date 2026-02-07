"use client"
import createGlobe from "cobe"
import { FunctionComponent, useEffect, useRef } from "react"

export const GlobalDatabase: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let phi = 4.7

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 1200 * 2,
      height: 1200 * 2,
      phi: 0,
      theta: -0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 25000,
      mapBrightness: 13,
      mapBaseBrightness: 0.05,
      baseColor: [0.3, 0.3, 0.3],
      glowColor: [0.15, 0.15, 0.15],
      markerColor: [100, 100, 100],
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
  }, [])

  const features = [
    {
      name: "Multi-location Support",
      description: "Manage operations across multiple locations with real-time sync.",
    },
    {
      name: "Smart Automation",
      description: "Automate workflows and reduce manual tasks across your business.",
    },
    {
      name: "Real-time Insights",
      description:
        "Track performance with live dashboards and custom alerts.",
    },
  ]

  return (
    <div className="global-database-wrapper">
      <section
        aria-labelledby="global-database-title"
        className="global-database-section"
      >
        <div className="global-database-blur" />
        <div className="global-database-badge">
          <span className="global-database-badge-text">
            Built for growth
          </span>
        </div>
        <h2
          id="global-database-title"
          className="global-database-heading"
        >
          Manage from <br /> anywhere
        </h2>
        <canvas
          className="global-database-canvas"
          ref={canvasRef}
          style={{ width: 1200, height: 1200 }}
        />
        <div className="global-database-bottom-container">
          <div className="global-database-gradient-overlay" />
          <div className="global-database-features-container">
            <div className="global-database-features-grid">
              {features.map((item) => (
                <div key={item.name} className="global-database-feature-item">
                  <h3 className="global-database-feature-heading">
                    {item.name}
                  </h3>
                  <p className="global-database-feature-description">
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
