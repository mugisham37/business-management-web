import React from 'react'
import { Badge } from '@/components/reui/badge'
import { Button } from '@/components/reui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/reui/card'

// Feature list items data
const featureListItems = [
    { text: "Structured for clarity", iconClass: "framer-WzIzJ" },
    { text: "Launch-ready in minutes", iconClass: "framer-zLRAx" },
    { text: "Clean and focused UX", iconClass: "framer-b8top", svgHref: "#3415330792" },
    { text: "Scales with complex teams", iconClass: "framer-eKeIr" }
]

// Feature cards data
const featureCards = [
    {
        id: "feature-card-1",
        containerClass: "framer-ldvkts-container",
        badge: "Right person, right task",
        title: "Smart Assignment",
        description: "Assign tasks intelligently based on your team's roles, recent activity, and current workload. No more guesswork — the right task reaches the right person at the right time.",
        imageSrc: "https://framerusercontent.com/images/QzddzrC6vziJtlI6QWFVeVUJEro.jpg",
        imageSrcSet: "https://framerusercontent.com/images/QzddzrC6vziJtlI6QWFVeVUJEro.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/QzddzrC6vziJtlI6QWFVeVUJEro.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/QzddzrC6vziJtlI6QWFVeVUJEro.jpg?scale-down-to=2048 2048w,https://framerusercontent.com/images/QzddzrC6vziJtlI6QWFVeVUJEro.jpg 2647w"
    },
    {
        id: "feature-card-2",
        containerClass: "framer-53gamc-container",
        badge: "Clarity at a glance",
        title: "Visual Progress & Priority",
        description: "Track every task's status with intuitive progress bars and clear priority indicators. Quickly spot blockers, overdue items, and what needs your attention next.",
        imageSrc: "https://framerusercontent.com/images/3ChsfDLF1dhnula2IYQpKjv4c.jpg",
        imageSrcSet: "https://framerusercontent.com/images/3ChsfDLF1dhnula2IYQpKjv4c.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/3ChsfDLF1dhnula2IYQpKjv4c.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/3ChsfDLF1dhnula2IYQpKjv4c.jpg?scale-down-to=2048 2048w,https://framerusercontent.com/images/3ChsfDLF1dhnula2IYQpKjv4c.jpg 2647w"
    },
    {
        id: "feature-card-3",
        containerClass: "framer-rgj3tr-container",
        badge: "Stay in sync",
        title: "Real-Time Collaboration",
        description: "Work together in real time — edit tasks, leave comments, and see updates instantly. Stay aligned without switching tools or waiting on status updates.",
        imageSrc: "https://framerusercontent.com/images/VSKFrleJPK5BKAuhrFzVq2Nm8.jpg",
        imageSrcSet: "https://framerusercontent.com/images/VSKFrleJPK5BKAuhrFzVq2Nm8.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/VSKFrleJPK5BKAuhrFzVq2Nm8.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/VSKFrleJPK5BKAuhrFzVq2Nm8.jpg?scale-down-to=2048 2048w,https://framerusercontent.com/images/VSKFrleJPK5BKAuhrFzVq2Nm8.jpg 2647w"
    },
    {
        id: "feature-card-4",
        containerClass: "framer-zmldoc-container",
        badge: "Work your way",
        title: "Multiple Views",
        description: "Switch seamlessly between list, board, and timeline views to match how your team works. Whether you're planning ahead or tracking day-to-day, you're always in control.",
        imageSrc: "https://framerusercontent.com/images/XLSX337vXgd45FcMXBs1rl3jwU.jpg",
        imageSrcSet: "https://framerusercontent.com/images/XLSX337vXgd45FcMXBs1rl3jwU.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/XLSX337vXgd45FcMXBs1rl3jwU.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/XLSX337vXgd45FcMXBs1rl3jwU.jpg?scale-down-to=2048 2048w,https://framerusercontent.com/images/XLSX337vXgd45FcMXBs1rl3jwU.jpg 2646w"
    }
]

// Reusable components
const FeatureListItem: React.FC<{ text: string; iconClass?: string; svgHref?: string; containerClass: string }> = ({ text, iconClass, svgHref, containerClass }) => (
    <div style={{ display: "contents" }}>
        <div className={containerClass}>
            <Card size="sm" className="flex-row items-center border-[rgb(214,214,214)] bg-[rgba(247,249,250,0.5)] shadow-[0px_1px_3px_0px_rgb(248,249,250)]" data-framer-name="Feature List">
                <CardContent className="flex items-center gap-3 py-3 px-4">
                    <div className="flex-shrink-0" data-framer-name="Icon">
                        {svgHref ? (
                            <svg className={`${iconClass} w-6 h-6`} role="presentation" viewBox="0 0 24 24"
                                style={{ color: "rgb(56, 56, 61)" } as React.CSSProperties}>
                                <use href={svgHref}></use>
                            </svg>
                        ) : (
                            <div className={`${iconClass} w-6 h-6`} style={{ color: "rgb(56, 56, 61)" } as React.CSSProperties}></div>
                        )}
                    </div>
                    <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-left text-[rgb(56,56,61)]">{text}</p>
                </CardContent>
            </Card>
        </div>
    </div>
)

const ArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" focusable="false"
        color="rgb(38, 38, 38)"
        style={{ userSelect: "none", width: "100%", height: "100%", display: "inline-block", fill: "rgb(38, 38, 38)", color: "rgb(38, 38, 38)", flexShrink: "0" } as React.CSSProperties}>
        <g color="rgb(38, 38, 38)">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
        </g>
    </svg>
)

const LearnMoreButton: React.FC = () => (
    <Button 
        variant="default" 
        size="sm"
        className="rounded-[27px] bg-[rgb(38,38,38)] text-white hover:opacity-90 shadow-none"
        asChild
    >
        <a 
            href="https://www.framer.com?via=green13" 
            target="_blank" 
            rel="noopener"
            className="flex items-center gap-2"
        >
            <span className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em]">
                Learn More
            </span>
            <div className="bg-white rounded-full w-5 h-5 flex items-center justify-center"
                style={{ mask: "radial-gradient(50% 50%, rgb(0, 0, 0) 97.7319%, rgba(0, 0, 0, 0) 100%)" } as React.CSSProperties}>
                <ArrowIcon />
            </div>
        </a>
    </Button>
)

const FeatureCard: React.FC<{ card: typeof featureCards[0]; index: number }> = ({ card, index }) => (
    <div className={index === 0 ? "framer-7f809f" : index === 1 ? "framer-btd29u" : index === 2 ? "framer-7relri" : "framer-1sf7l75"}
        data-framer-name={`Feature Card ${index + 1}`} id={card.id}>
        <div style={{ display: "contents" }}>
            <div className={card.containerClass} style={{ willChange: "transform", opacity: "0", transform: "translateY(80px)" } as React.CSSProperties}>
                <Card className="border-[rgb(229,229,232)] bg-[rgb(251,251,251)] rounded-[15px]" data-framer-name="Phone">
                    <CardHeader className="flex flex-col items-center gap-4">
                        <div className="relative overflow-hidden rounded-[5px]">
                            <div 
                                className="absolute inset-0 bg-[rgb(209,242,255)]"
                                style={{ willChange: "transform", transform: "translateX(-200px)" } as React.CSSProperties}
                            />
                            <Badge 
                                variant="outline" 
                                size="sm"
                                className="relative bg-transparent border-none px-3 py-1"
                            >
                                <span className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-[rgb(38,38,38)]">
                                    {card.badge}
                                </span>
                            </Badge>
                        </div>
                        <div className="flex flex-col items-center gap-3 w-full">
                            <CardTitle className="font-['Switzer',sans-serif] text-[22px] font-semibold leading-[1.2em] tracking-normal text-center text-[rgb(38,38,38)]">
                                {card.title}
                            </CardTitle>
                            <CardDescription className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-center text-[rgb(56,56,61)]">
                                {card.description}
                            </CardDescription>
                        </div>
                        <LearnMoreButton />
                    </CardHeader>
                    <CardContent className="w-full">
                        <div className="relative overflow-hidden rounded-[5px]">
                            <img 
                                decoding="async" 
                                loading="lazy" 
                                width="2647" 
                                height="2326"
                                sizes="max(max(min(min(max(100vw - 40px, 1px), 1100px), 580px), 1px) - 30px, 1px)"
                                srcSet={card.imageSrcSet} 
                                src={card.imageSrc} 
                                alt={card.title}
                                className="block w-full h-full rounded-[inherit] object-center object-cover"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
)

const Feature = () => {
    return (
        <section className="py-16 px-5" data-framer-name="Feature Section" id="feature">
            <div className="max-w-[1100px] mx-auto" data-framer-name="Container">
                <div className="flex flex-col lg:flex-row gap-8 items-start mb-12" data-framer-name="Heading &amp; Image">
                    <div className="flex-shrink-0" data-framer-name="Image"
                        style={{ willChange: "transform", opacity: "1", transform: "translateX(-100px)" } as React.CSSProperties}>
                        <div style={{ display: "contents" }}>
                            <div data-framer-name="Image" className="rounded-lg overflow-hidden">
                                <div className="absolute rounded-[inherit] inset-0">
                                    <img decoding="async" loading="lazy" width="1917" height="2192"
                                        sizes="max(min(min(max(100vw - 40px, 1px), 1100px), 580px) - 12px, 1px)"
                                        srcSet="https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg?scale-down-to=1024 895w,https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg?scale-down-to=2048 1791w,https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg 1917w"
                                        src="https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg"
                                        alt="Feature showcase" 
                                        className="block w-full h-full rounded-[inherit] object-center object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-8" data-framer-name="Heading &amp; Supporting Text">
                        <div className="flex flex-col gap-6" data-framer-name="Heading Container">
                            <div style={{ display: "contents" }}>
                                <div className="inline-flex">
                                    <Badge 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2 px-4 py-2 rounded-[17px] border-[rgb(229,229,232)] bg-[rgb(250,250,250)] shadow-[0px_2px_5px_0px_rgb(240,241,242)]"
                                    >
                                        <svg className="w-5 h-5" role="presentation" viewBox="0 0 24 24"
                                            style={{ color: "rgb(56, 56, 61)" } as React.CSSProperties}>
                                            <use href="#876389144"></use>
                                        </svg>
                                        <span className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-[rgb(38,38,38)]">
                                            Key Capabilities
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6" data-framer-name="Heading Content">
                                <div className="flex flex-col gap-4" data-framer-name="Container">
                                    <div style={{ display: "contents" }}>
                                        <h2 className="font-['Switzer',sans-serif] text-[50px] font-semibold leading-[1em] tracking-[-0.02em] text-center text-[rgb(38,38,38)]">
                                            Smarter task management, built for teams.
                                        </h2>
                                    </div>
                                    <div style={{ display: "contents" }}>
                                        <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-center text-[rgb(56,56,61)]">
                                            From task planning to AI-driven suggestions, Taskos gives your team the tools to move fast, stay focused, and get work done — together.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-framer-name="Feature List">
                            {featureListItems.map((item, index) => (
                                <FeatureListItem
                                    key={index}
                                    text={item.text}
                                    iconClass={item.iconClass}
                                    svgHref={item.svgHref}
                                    containerClass={
                                        index === 0 ? "framer-18bz47u-container" :
                                        index === 1 ? "framer-1k05kbd-container" :
                                        index === 2 ? "framer-11ubpo2-container" :
                                        "framer-bc7zb1-container"
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-framer-name="Feature Card">
                    {featureCards.map((card, index) => (
                        <FeatureCard key={card.id} card={card} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Feature
