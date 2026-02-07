import Balancer from "react-wrap-balancer"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main
      className="mx-auto max-w-3xl animate-slide-up-fade px-3"
      style={{
        marginTop: "var(--spacing-hero-top)",
        animationDuration: "var(--animation-slide-up-fade-duration)",
        animationFillMode: "var(--animation-fill-mode)",
      }}
    >
      <div className="text-center">
        <h1 
          className="inline-block bg-gradient-to-t bg-clip-text py-2 font-bold text-transparent sm:text-5xl"
          style={{
            fontSize: "var(--text-hero-sm)",
            // @ts-ignore - CSS variable for gradient
            "--tw-gradient-from": "var(--gradient-heading-from)",
            "--tw-gradient-to": "var(--gradient-heading-to)",
            letterSpacing: "var(--tracking-tight)",
          } as React.CSSProperties}
        >
          Changelog
        </h1>
        <p 
          className="text-lg"
          style={{
            marginTop: "var(--spacing-content-gap)",
            color: "var(--text-landing-body)",
          }}
        >
          <Balancer>
            Keep yourself informed about the most recent additions and
            improvements we&rsquo;ve made to Database.
          </Balancer>
        </p>
      </div>
      <div style={{ marginTop: "var(--spacing-gallery-final)" }}>{children}</div>
    </main>
  )
}
