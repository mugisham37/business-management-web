import React from 'react'

// Reusable style objects - Self-contained with exact values
const styles = {
  badge: {
    backgroundColor: "rgb(250, 250, 250)",
    border: "1px solid rgb(229, 229, 232)",
    borderRadius: "17px",
    boxShadow: "0px 2px 5px 0px rgb(240, 241, 242)",
    opacity: 1
  } as React.CSSProperties,
  
  badgeIcon: {
    opacity: 1,
    color: "rgb(56, 56, 61)"
  } as React.CSSProperties,
  
  badgeText: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: 0,
    transform: "none",
    opacity: 1,
    fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "1.3em",
    letterSpacing: "-0.01em",
    color: "rgb(56, 56, 61)"
  } as React.CSSProperties,
  
  featureList: {
    backgroundColor: "rgba(247, 249, 250, 0.5)",
    border: "1px solid rgb(214, 214, 214)",
    borderRadius: "16px",
    boxShadow: "0px 1px 3px 0px rgb(248, 249, 250)",
    opacity: 1
  } as React.CSSProperties,
  
  featureIcon: {
    opacity: 1,
    color: "rgb(56, 56, 61)"
  } as React.CSSProperties,
  
  highlightCard: {
    backgroundColor: "rgb(251, 251, 251)",
    border: "1px solid rgb(229, 229, 232)",
    width: "100%",
    borderRadius: "10px",
    boxShadow: "0px 2px 5px 0px rgb(251, 251, 251)",
    opacity: 1
  } as React.CSSProperties,
  
  cardContainer: {
    willChange: "transform",
    opacity: 0,
    transform: "translateY(50px)"
  } as React.CSSProperties,
  
  cardIcon: {
    borderRadius: "5px",
    opacity: 1
  } as React.CSSProperties,
  
  cardIconSvg: {
    opacity: 1,
    color: "rgb(66, 135, 255)"
  } as React.CSSProperties,
  
  cardHeading: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: 0,
    transform: "none",
    opacity: 1,
    fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "1.3em",
    color: "rgb(56, 56, 61)"
  } as React.CSSProperties,
  
  cardText: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: 0,
    transform: "none",
    opacity: 1,
    fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.4em",
    color: "rgb(56, 56, 61)"
  } as React.CSSProperties,
  
  mainHeading: {
    fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
    fontSize: "50px",
    fontWeight: 600,
    lineHeight: "1em",
    letterSpacing: "-0.02em",
    textAlign: "center",
    color: "rgb(0, 0, 0)"
  } as React.CSSProperties,
  
  supportingText: {
    fontFamily: '"Switzer", "Switzer Placeholder", sans-serif',
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.4em",
    textAlign: "center",
    color: "rgb(56, 56, 61)"
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
const FeatureListItem: React.FC<{ href: string; text: string }> = ({ href, text }) => (
  <div className="flex items-center gap-3 p-4" style={styles.featureList}>
    <div className="flex-shrink-0" style={{opacity: 1}}>
      <svg 
        role="presentation" 
        viewBox="0 0 24 24"
        className="w-6 h-6"
        style={styles.featureIcon}
      >
        <use href={href}></use>
      </svg>
    </div>
    <div style={{...styles.cardText, textAlign: "left"}}>
      <p>{text}</p>
    </div>
  </div>
)

const HighlightCard: React.FC<{
  iconType: "div" | "svg";
  iconClass?: string;
  iconHref?: string;
  title: string;
  description: string;
}> = ({ iconType, iconClass, iconHref, title, description }) => (
  <div className="flex flex-col" style={styles.cardContainer}>
    <div className="p-6" style={styles.highlightCard}>
      <div className="flex flex-col gap-4" style={{opacity: 1}}>
        <div className="w-12 h-12 flex items-center justify-center" style={styles.cardIcon}>
          {iconType === "div" ? (
            <div 
              className={iconClass}
              style={{opacity: 1, color: "rgb(66, 135, 255)"}}
            />
          ) : (
            <svg
              role="presentation"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              style={styles.cardIconSvg}
            >
              <use href={iconHref}></use>
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-2" style={{opacity: 1}}>
          <div style={styles.cardHeading}>
            <h6 style={{textAlign: "left"}}>
              {title}
            </h6>
          </div>
          <div style={{...styles.cardText, textAlign: "left"}}>
            <p>
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const hightlight = () => {
  return (
    <section className="py-16 px-4" id="highlight">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2" style={styles.badge}>
              <div style={{opacity: 1}}>
                <svg
                  role="presentation"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  style={styles.badgeIcon}
                >
                  <use href="#1964567075"></use>
                </svg>
              </div>
              <div style={styles.badgeText}>
                <p>Get Things Done</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-col items-center gap-4 w-full">
                <div style={{...styles.mainHeading, outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: 0, transform: "none"} as React.CSSProperties}>
                  <h2 className="text-[50px] lg:text-[38px] sm:text-[28px]">
                    Handle complex workflows without the chaos.
                  </h2>
                </div>
                <div style={{...styles.supportingText, outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: 0, transform: "none"} as React.CSSProperties}>
                  <p>
                    Adapts to shifting priorities and real workflows — keeping projects aligned, teams accountable, and decisions clear.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {featureListItems.map((item, index) => (
                  <FeatureListItem key={index} href={item.href} text={item.text} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
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
