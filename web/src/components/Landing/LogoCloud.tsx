import { Logos } from "./Logos"

export default function LogoCloud() {
  return (
    <section
      id="logo cloud"
      aria-label="Company logos"
      className="logo-cloud-section"
    >
      <p className="logo-cloud-text">
        Trusted by the world&rsquo;s best engineering teams
      </p>
      <div className="logo-cloud-grid">
        <Logos.Biosynthesis className="logo-cloud-logo" />
        <Logos.AltShift className="logo-cloud-logo" />
        <Logos.Capsule className="logo-cloud-logo" />
        <Logos.Catalog className="logo-cloud-logo" />
        <Logos.Cloudwatch className="logo-cloud-logo" />
        <Logos.FocalPoint className="logo-cloud-logo" />
        <Logos.Interlock className="logo-cloud-logo" />
        <Logos.Sisyphus className="logo-cloud-logo" />
      </div>
    </section>
  )
}
