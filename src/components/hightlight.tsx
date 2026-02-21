import React from 'react'

// Reusable style objects
const styles = {
  badge: {
    "--border-bottom-width": "1px",
    "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))",
    "--border-left-width": "1px",
    "--border-right-width": "1px",
    "--border-style": "solid",
    "--border-top-width": "1px",
    backgroundColor: "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))",
    borderRadius: "17px",
    boxShadow: "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))",
    opacity: "1"
  } as React.CSSProperties,
  
  badgeIcon: {
    "--1m6trwb": "0",
    "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))",
    "--pgex8v": "1.4",
    opacity: "1"
  } as React.CSSProperties,
  
  badgeText: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: "0",
    "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
    "--framer-link-text-color": "rgb(0, 153, 255)",
    "--framer-link-text-decoration": "underline",
    transform: "none",
    opacity: "1"
  } as React.CSSProperties,
  
  featureList: {
    "--border-bottom-width": "1px",
    "--border-color": "var(--token-ccc95a9a-25f2-49cc-a0af-ecdbff23bfba, rgb(214, 214, 214))",
    "--border-left-width": "1px",
    "--border-right-width": "1px",
    "--border-style": "solid",
    "--border-top-width": "1px",
    backgroundColor: "var(--token-e9d5663e-56be-412a-882e-587896e30dd7, rgba(247, 249, 250, 0.5))",
    borderRadius: "16px",
    boxShadow: "0px 1px 3px 0px var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))",
    opacity: "1"
  } as React.CSSProperties,
  
  featureIcon: {
    "--1m6trwb": "0",
    "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))",
    "--pgex8v": "1.5",
    opacity: "1"
  } as React.CSSProperties,
  
  highlightCard: {
    "--border-bottom-width": "1px",
    "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))",
    "--border-left-width": "1px",
    "--border-right-width": "1px",
    "--border-style": "solid",
    "--border-top-width": "1px",
    backgroundColor: "var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))",
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0px 2px 5px 0px var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))",
    opacity: "1"
  } as React.CSSProperties,
  
  cardContainer: {
    willChange: "transform",
    opacity: "0",
    transform: "translateY(50px)"
  } as React.CSSProperties,
  
  cardIcon: {
    borderRadius: "5px",
    opacity: "1"
  } as React.CSSProperties,
  
  cardIconSvg: {
    "--1m6trwb": "0",
    "--21h8s6": "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(66, 135, 255))",
    "--pgex8v": "1.5",
    opacity: "1"
  } as React.CSSProperties,
  
  cardHeading: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: "0",
    "--framer-link-text-color": "rgb(0, 153, 255)",
    "--framer-link-text-decoration": "underline",
    "--extracted-1w1cjl5": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(0, 0, 0))",
    transform: "none",
    opacity: "1"
  } as React.CSSProperties,
  
  cardText: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: "0",
    "--framer-link-text-color": "rgb(0, 153, 255)",
    "--framer-link-text-decoration": "underline",
    transform: "none",
    opacity: "1"
  } as React.CSSProperties
}

// Feature list data
const featureListItems = [
  { href: "#684645893", text: "Built with team logic" },
  { href: "#3250247260", text: "Adapts as work evolves" },
  { href: "#1074007029", text: "Insights without setup" }
]

// Highlight cards data
const highlightCards = [
  {
    iconType: "div" as const,
    iconClass: "framer-xT4UQ",
    title: "Dynamic Workload Balancing",
    description: "Tasks are automatically distributed based on each member's bandwidth, so no one's overbooked or underused."
  },
  {
    iconType: "div" as const,
    iconClass: "framer-uxCXZ",
    title: "Context-Aware Task Views",
    description: "Switch seamlessly between project views — from team-wide timelines to individual to-dos — all tied to real context."
  },
  {
    iconType: "div" as const,
    iconClass: "framer-O9jag",
    title: "Built-In Decision Intelligence",
    description: "AI analyzes patterns in your team's workflows to recommend next actions, assign owners, and flag inefficiencies."
  },
  {
    iconType: "svg" as const,
    iconHref: "#535953797",
    title: "Collaborative Task Canvas",
    description: "Each task has its own collaborative thread with notes, comments, and file sharing — no need to switch tools."
  },
  {
    iconType: "svg" as const,
    iconHref: "#3125524415",
    title: "Enterprise-Ready Structure",
    description: "From small teams to enterprise org charts, structure tasks across departments, assign roles, and maintain clarity."
  }
]

// Reusable components
const SSRVariant: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
    {children}
  </div>
)

const FeatureListItem: React.FC<{ href: string; text: string }> = ({ href, text }) => (
  <SSRVariant>
    <div className="framer-y09vcf-container">
      <div 
        className="framer-v2mcq framer-ae7Kc framer-qz94l0 framer-v-qz94l0"
        data-border="true" 
        data-framer-name="Feature List"
        style={styles.featureList}
      >
        <div className="framer-12ix1hz" data-framer-name="Icon" style={{opacity: "1"} as React.CSSProperties}>
          <svg 
            className="framer-XpCK0 framer-184qdzk"
            role="presentation" 
            viewBox="0 0 24 24"
            style={styles.featureIcon}
          >
            <use href={href}></use>
          </svg>
        </div>
        <div 
          className="framer-286iq4" 
          data-framer-name="Supporting text"
          data-framer-component-type="RichTextContainer"
          style={styles.cardText}
        >
          <p 
            className="framer-text framer-styles-preset-wct5n4"
            data-styles-preset="OvgFe4dMx"
            style={{"--framer-text-alignment": "left"} as React.CSSProperties}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  </SSRVariant>
)

const HighlightCard: React.FC<{
  iconType: "div" | "svg";
  iconClass?: string;
  iconHref?: string;
  title: string;
  description: string;
}> = ({ iconType, iconClass, iconHref, title, description }) => (
  <SSRVariant>
    <div className="framer-sm7yv-container" style={styles.cardContainer}>
      <div 
        className="framer-cfriu framer-Fz19O framer-udI2x framer-ae7Kc framer-105ryf8 framer-v-1qymzcr"
        data-border="true" 
        data-framer-name="Phone"
        style={styles.highlightCard}
      >
        <div className="framer-pzkzdi" data-framer-name="Container" style={{opacity: "1"} as React.CSSProperties}>
          <div className="framer-sggv0w" data-framer-name="Icon" style={styles.cardIcon}>
            {iconType === "div" ? (
              <div 
                className={`${iconClass} framer-n7pu38`}
                style={{"--21h8s6": "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(66, 135, 255))", opacity: "1"} as React.CSSProperties}
              />
            ) : (
              <svg
                className="framer-1qsf5 framer-n7pu38" 
                role="presentation"
                viewBox="0 0 24 24"
                style={styles.cardIconSvg}
              >
                <use href={iconHref}></use>
              </svg>
            )}
          </div>
          <div className="framer-1435lxg" data-framer-name="Heading &amp; Supporting Text" style={{opacity: "1"} as React.CSSProperties}>
            <div 
              className="framer-hea51t"
              data-framer-component-type="RichTextContainer"
              style={styles.cardHeading}
            >
              <h6 
                className="framer-text framer-styles-preset-rlw5rm"
                data-styles-preset="ozhLrZjZv"
                style={{"--framer-text-alignment": "left", "--framer-text-color": "var(--extracted-1w1cjl5, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(0, 0, 0)))"} as React.CSSProperties}
              >
                {title}
              </h6>
            </div>
            <div 
              className="framer-yd03ol"
              data-framer-component-type="RichTextContainer"
              style={styles.cardText}
            >
              <p 
                className="framer-text framer-styles-preset-wct5n4"
                data-styles-preset="OvgFe4dMx"
                style={{"--framer-text-alignment": "left"} as React.CSSProperties}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SSRVariant>
)

const hightlight = () => {
  return (
    <section className="framer-7xdgds" data-framer-name="Highlight Section" id="highlight">
      <div className="framer-16msori" data-framer-name="Container">
        <div className="framer-ooyoju" data-framer-name="Heading &amp; Supporting Text">
          <div className="framer-11kxwm6" data-framer-name="Heading Container">
            <SSRVariant>
              <div className="framer-qnpr8w-container">
                <div 
                  className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                  data-border="true" 
                  data-framer-name="Badge"
                  style={styles.badge}
                >
                  <div className="framer-1l1ajhh" data-framer-name="Icon" style={{opacity: "1"} as React.CSSProperties}>
                    <svg
                      className="framer-fmMdU framer-qgvfsn" 
                      role="presentation"
                      viewBox="0 0 24 24"
                      style={styles.badgeIcon}
                    >
                      <use href="#1964567075"></use>
                    </svg>
                  </div>
                  <div 
                    className="framer-1710qob" 
                    data-framer-component-type="RichTextContainer"
                    style={styles.badgeText}
                  >
                    <p 
                      className="framer-text framer-styles-preset-kmaoy8"
                      data-styles-preset="MV92va9oP"
                      style={{"--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))"} as React.CSSProperties}
                    >
                      Get Things Done
                    </p>
                  </div>
                </div>
              </div>
            </SSRVariant>
            <div className="framer-rntz2h" data-framer-name="Heading Content">
              <div className="framer-8rgo21" data-framer-name="Container">
                <SSRVariant>
                  <div 
                    className="framer-1qmcbs0" 
                    data-framer-name="Heading"
                    data-framer-component-type="RichTextContainer"
                    style={{outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none"} as React.CSSProperties}
                  >
                    <h2 
                      className="framer-text framer-styles-preset-199apa9"
                      data-styles-preset="Ty6zNsrjE"
                      style={{"--framer-text-alignment": "center"} as React.CSSProperties}
                    >
                      Handle complex workflows without the chaos.
                    </h2>
                  </div>
                </SSRVariant>
                <SSRVariant>
                  <div 
                    className="framer-10vpw73" 
                    data-framer-name="Supporting text"
                    data-framer-component-type="RichTextContainer"
                    style={{outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none"} as React.CSSProperties}
                  >
                    <p 
                      className="framer-text framer-styles-preset-wct5n4"
                      data-styles-preset="OvgFe4dMx"
                      style={{"--framer-text-alignment": "center"} as React.CSSProperties}
                    >
                      Adapts to shifting priorities and real workflows — keeping projects aligned, teams accountable, and decisions clear.
                    </p>
                  </div>
                </SSRVariant>
              </div>
              <div className="framer-15273ea" data-framer-name="Highlight List">
                {featureListItems.map((item, index) => (
                  <FeatureListItem key={index} href={item.href} text={item.text} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="framer-12gsp9g" data-framer-name="Highlight Card">
          {highlightCards.map((card, index) => (
            <HighlightCard
              key={index}
              iconType={card.iconType}
              iconClass={card.iconClass}
              iconHref={card.iconHref}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default hightlight
