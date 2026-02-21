import React from 'react'
import { Badge } from '@/components/reui/badge'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/reui/card'
import { FramePanel } from '@/components/reui/frame'

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
  <FramePanel className="flex items-center gap-3 p-4 bg-muted/30 border-border rounded-2xl shadow-sm">
    <div className="flex-shrink-0">
      <svg 
        role="presentation" 
        viewBox="0 0 24 24"
        className="w-6 h-6 text-foreground"
      >
        <use href={href}></use>
      </svg>
    </div>
    <p className="text-base text-foreground leading-snug">
      {text}
    </p>
  </FramePanel>
)

const HighlightCard: React.FC<{
  iconType: "div" | "svg";
  iconClass?: string;
  iconHref?: string;
  title: string;
  description: string;
}> = ({ iconType, iconClass, iconHref, title, description }) => (
  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6 flex flex-col gap-4">
      <div className="w-12 h-12 flex items-center justify-center rounded-md">
        {iconType === "div" ? (
          <div 
            className={iconClass}
            style={{opacity: 1, color: "rgb(66, 135, 255)"}}
          />
        ) : (
          <svg
            role="presentation"
            viewBox="0 0 24 24"
            className="w-6 h-6 text-info"
          >
            <use href={iconHref}></use>
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <CardTitle className="text-base font-semibold text-foreground leading-snug">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </div>
    </CardContent>
  </Card>
)

const hightlight = () => {
  return (
    <section className="py-16 px-4" id="highlight">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-8 max-w-4xl">
            <Badge variant="outline" size="lg" className="gap-2 rounded-2xl shadow-sm">
              <svg
                role="presentation"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <use href="#1964567075"></use>
              </svg>
              <span className="text-sm font-normal tracking-tight">Get Things Done</span>
            </Badge>
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-col items-center gap-4 w-full">
                <h2 className="text-5xl lg:text-4xl sm:text-3xl font-semibold leading-tight tracking-tight text-center text-foreground">
                  Handle complex workflows without the chaos.
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed text-center max-w-3xl">
                  Adapts to shifting priorities and real workflows — keeping projects aligned, teams accountable, and decisions clear.
                </p>
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
