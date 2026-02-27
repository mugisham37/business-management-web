import Balancer from "react-wrap-balancer"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main
      className="mx-auto mt-36 max-w-3xl animate-slide-up-fade px-3"
      style={{
        animationDuration: "600ms",
        animationFillMode: "backwards",
      }}
    >
      <div className="text-center">
        <h1 className="inline-block bg-gradient-to-t from-foreground to-foreground/90 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-5xl dark:to-foreground/80">
          Changelog
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          <Balancer>
            Keep yourself informed about the most recent additions and
            improvements we&rsquo;ve made to Database.
          </Balancer>
        </p>
      </div>
      <div className="mt-28">{children}</div>
    </main>
  )
}
