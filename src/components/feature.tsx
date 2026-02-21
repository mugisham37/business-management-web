import React from 'react'

// Reusable style constants
const STYLES = {
    opacity1: { opacity: "1" } as React.CSSProperties,
    richTextContainer: {
        outline: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        flexShrink: "0",
        transform: "none",
        opacity: "1"
    } as React.CSSProperties,
    featureListItem: {
        borderWidth: "1px",
        borderColor: "rgb(214, 214, 214)",
        borderStyle: "solid",
        backgroundColor: "rgba(247, 249, 250, 0.5)",
        borderRadius: "16px",
        boxShadow: "0px 1px 3px 0px rgb(248, 249, 250)",
        opacity: "1"
    } as React.CSSProperties,
    cardContainer: {
        willChange: "transform",
        opacity: "0",
        transform: "translateY(80px)"
    } as React.CSSProperties,
    phoneCard: {
        borderWidth: "1px",
        borderColor: "rgb(229, 229, 232)",
        borderStyle: "solid",
        backgroundColor: "rgb(251, 251, 251)",
        width: "100%",
        borderRadius: "15px",
        opacity: "1"
    } as React.CSSProperties,
    imageWrapper: {
        position: "absolute",
        borderRadius: "inherit",
        inset: "0px"
    } as React.CSSProperties,
    imageStyle: {
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        objectPosition: "center center",
        objectFit: "cover"
    } as React.CSSProperties
}

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
            <div className="flex flex-row items-center gap-3 p-4" data-framer-name="Feature List" style={STYLES.featureListItem}>
                <div className="flex-shrink-0" data-framer-name="Icon" style={STYLES.opacity1}>
                    {svgHref ? (
                        <svg className={`${iconClass} w-6 h-6`} role="presentation" viewBox="0 0 24 24"
                            style={{ color: "rgb(56, 56, 61)", opacity: "1" } as React.CSSProperties}>
                            <use href={svgHref}></use>
                        </svg>
                    ) : (
                        <div className={`${iconClass} w-6 h-6`} style={{ color: "rgb(56, 56, 61)", opacity: "1" } as React.CSSProperties}></div>
                    )}
                </div>
                <div data-framer-name="Supporting text" style={STYLES.richTextContainer}>
                    <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-left text-[rgb(56,56,61)]">{text}</p>
                </div>
            </div>
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
    <div className="flex items-center justify-center" style={STYLES.opacity1}>
        <a className="flex items-center justify-center rounded-[27px] bg-[rgb(38,38,38)] px-6 py-3 transition-all hover:opacity-90"
            data-framer-name="Light Arrow - Phone" data-highlight="true"
            href="https://www.framer.com?via=green13" target="_blank" rel="noopener" tabIndex={0}
            style={{ boxShadow: "none", opacity: "1" } as React.CSSProperties}>
            <div className="flex items-center gap-2" data-framer-name="Container" style={STYLES.opacity1}>
                <div data-framer-name="Text" style={STYLES.opacity1}>
                    <div data-framer-name="Text"
                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none", opacity: "1" } as React.CSSProperties}>
                        <p className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-center text-[rgb(255,255,255)]">
                            Learn More
                        </p>
                    </div>
                </div>
                <div data-framer-name="Arrow"
                    style={{ backgroundColor: "rgb(255, 255, 255)", mask: "radial-gradient(50% 50%, rgb(0, 0, 0) 97.7319%, rgba(0, 0, 0, 0) 100%)", opacity: "1", width: "20px", height: "20px" } as React.CSSProperties}>
                    <div style={STYLES.opacity1}>
                        <div style={{ display: "contents" } as React.CSSProperties}>
                            <ArrowIcon />
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
)

const FeatureCard: React.FC<{ card: typeof featureCards[0]; index: number }> = ({ card, index }) => (
    <div className={index === 0 ? "framer-7f809f" : index === 1 ? "framer-btd29u" : index === 2 ? "framer-7relri" : "framer-1sf7l75"}
        data-framer-name={`Feature Card ${index + 1}`} id={card.id}>
        <div style={{ display: "contents" }}>
            <div className={card.containerClass} style={STYLES.cardContainer}>
                <div className="flex flex-col items-center gap-6 p-6"
                    data-framer-name="Phone" style={STYLES.phoneCard}>
                    <div className="flex flex-col items-center gap-6 w-full" data-framer-name="Container" style={STYLES.opacity1}>
                        <div className="flex flex-col items-center gap-4 w-full" data-framer-name="Heading &amp; Button" style={STYLES.opacity1}>
                            <div className="flex flex-col items-center gap-4 w-full" data-framer-name="Container" style={STYLES.opacity1}>
                                <div className="relative overflow-hidden rounded-[5px]" data-framer-name="Highlight Badge" style={{ opacity: "1" } as React.CSSProperties}>
                                    <div data-framer-name="Highlight Block"
                                        style={{ backgroundColor: "rgb(209, 242, 255)", willChange: "transform", opacity: "1", transform: "translateX(-200px)", position: "absolute", inset: "0" } as React.CSSProperties}>
                                    </div>
                                    <div className="relative px-3 py-1"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", opacity: "1", transform: "none" } as React.CSSProperties}>
                                        <p className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-center text-[rgb(38,38,38)]">
                                            {card.badge}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-4 w-full" data-framer-name="Heading &amp; Button" style={STYLES.opacity1}>
                                    <div className="flex flex-col items-center gap-3 w-full" data-framer-name="Heading &amp; Supporting Text" style={STYLES.opacity1}>
                                        <div style={STYLES.richTextContainer}>
                                            <h4 className="font-['Switzer',sans-serif] text-[22px] font-semibold leading-[1.2em] tracking-normal text-center text-[rgb(38,38,38)]">
                                                {card.title}
                                            </h4>
                                        </div>
                                        <div style={STYLES.richTextContainer}>
                                            <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-center text-[rgb(56,56,61)]">
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>
                                    <LearnMoreButton />
                                </div>
                            </div>
                        </div>
                        <div className="w-full" data-framer-name="Image" style={STYLES.opacity1}>
                            <div data-framer-name="Image" style={{ borderRadius: "5px", opacity: "1", position: "relative", overflow: "hidden" } as React.CSSProperties}>
                                <div data-framer-background-image-wrapper="true" style={STYLES.imageWrapper}>
                                    <img decoding="async" loading="lazy" width="2647" height="2326"
                                        sizes="max(max(min(min(max(100vw - 40px, 1px), 1100px), 580px), 1px) - 30px, 1px)"
                                        srcSet={card.imageSrcSet} src={card.imageSrc} alt="" style={STYLES.imageStyle} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                                <div data-framer-background-image-wrapper="true" style={STYLES.imageWrapper}>
                                    <img decoding="async" loading="lazy" width="1917" height="2192"
                                        sizes="max(min(min(max(100vw - 40px, 1px), 1100px), 580px) - 12px, 1px)"
                                        srcSet="https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg?scale-down-to=1024 895w,https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg?scale-down-to=2048 1791w,https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg 1917w"
                                        src="https://framerusercontent.com/images/BMC3Ie4ObtNYtchFeZxAxfmbXyk.jpg"
                                        alt="" style={STYLES.imageStyle} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-8" data-framer-name="Heading &amp; Supporting Text">
                        <div className="flex flex-col gap-6" data-framer-name="Heading Container">
                            <div style={{ display: "contents" }}>
                                <div className="inline-flex">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-[17px] border border-[rgb(229,229,232)] bg-[rgb(250,250,250)]"
                                        data-framer-name="Badge"
                                        style={{ boxShadow: "0px 2px 5px 0px rgb(240, 241, 242)", opacity: "1" } as React.CSSProperties}>
                                        <div data-framer-name="Icon" style={STYLES.opacity1}>
                                            <svg className="w-5 h-5" role="presentation" viewBox="0 0 24 24"
                                                style={{ color: "rgb(56, 56, 61)", opacity: "1" } as React.CSSProperties}>
                                                <use href="#876389144"></use>
                                            </svg>
                                        </div>
                                        <div
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none", opacity: "1" } as React.CSSProperties}>
                                            <p className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-center text-[rgb(38,38,38)]">
                                                Key Capabilities
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6" data-framer-name="Heading Content">
                                <div className="flex flex-col gap-4" data-framer-name="Container">
                                    <div style={{ display: "contents" }}>
                                        <div data-framer-name="Heading"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" } as React.CSSProperties}>
                                            <h2 className="font-['Switzer',sans-serif] text-[50px] font-semibold leading-[1em] tracking-[-0.02em] text-center text-[rgb(38,38,38)]">
                                                Smarter task management, built for teams.
                                            </h2>
                                        </div>
                                    </div>
                                    <div style={{ display: "contents" }}>
                                        <div data-framer-name="Supporting text"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" } as React.CSSProperties}>
                                            <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4em] tracking-normal text-center text-[rgb(56,56,61)]">
                                                From task planning to AI-driven suggestions, Taskos gives your team the tools to move fast, stay focused, and get work done — together.
                                            </p>
                                        </div>
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
