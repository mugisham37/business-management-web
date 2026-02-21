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
        "--framer-link-text-color": "rgb(0, 153, 255)",
        "--framer-link-text-decoration": "underline",
        transform: "none",
        opacity: "1"
    } as React.CSSProperties,
    featureListItem: {
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
    cardContainer: {
        willChange: "transform",
        opacity: "0",
        transform: "translateY(80px)"
    } as React.CSSProperties,
    phoneCard: {
        "--border-bottom-width": "1px",
        "--border-color": "var(--token-9cf61545-9ec8-4c23-873d-6ec7f44bfe14, rgb(229, 229, 232))",
        "--border-left-width": "1px",
        "--border-right-width": "1px",
        "--border-style": "solid",
        "--border-top-width": "1px",
        backgroundColor: "var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))",
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
    <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
        <div className={containerClass}>
            <div className="framer-v2mcq framer-ae7Kc framer-qz94l0 framer-v-qz94l0" data-border="true" data-framer-name="Feature List" style={STYLES.featureListItem}>
                <div className="framer-12ix1hz" data-framer-name="Icon" style={STYLES.opacity1}>
                    {svgHref ? (
                        <svg className={`${iconClass} framer-184qdzk`} role="presentation" viewBox="0 0 24 24"
                            style={{ "--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "--pgex8v": "1.5", opacity: "1" } as React.CSSProperties}>
                            <use href={svgHref}></use>
                        </svg>
                    ) : (
                        <div className={`${iconClass} framer-184qdzk`} style={{ "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", opacity: "1" } as React.CSSProperties}></div>
                    )}
                </div>
                <div className="framer-286iq4" data-framer-name="Supporting text" data-framer-component-type="RichTextContainer" style={STYLES.richTextContainer}>
                    <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx" style={{ "--framer-text-alignment": "left" } as React.CSSProperties}>{text}</p>
                </div>
            </div>
        </div>
    </div>
)

const ArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" focusable="false"
        color="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))"
        style={{ userSelect: "none", width: "100%", height: "100%", display: "inline-block", fill: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", color: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", flexShrink: "0" } as React.CSSProperties}>
        <g color="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
        </g>
    </svg>
)

const LearnMoreButton: React.FC = () => (
    <div className="framer-1kdkvgi-container" style={STYLES.opacity1}>
        <a className="framer-i8Jnw framer-YF6mi framer-1jz64ot framer-v-1uge9f framer-1jhx1jk"
            data-framer-name="Light Arrow - Phone" data-highlight="true"
            href="https://www.framer.com?via=green13" target="_blank" rel="noopener" tabIndex={0}
            style={{ "--border-bottom-width": "0px", "--border-color": "rgba(0, 0, 0, 0)", "--border-left-width": "0px", "--border-right-width": "0px", "--border-style": "solid", "--border-top-width": "0px", backgroundColor: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", borderRadius: "27px", boxShadow: "none", opacity: "1" } as React.CSSProperties}>
            <div className="framer-12n0srg" data-framer-name="Container" style={STYLES.opacity1}>
                <div className="framer-1669q28" data-framer-name="Text" style={STYLES.opacity1}>
                    <div className="framer-1fovsuz" data-framer-name="Text" data-framer-component-type="RichTextContainer"
                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--extracted-r6o4lv": "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", "--framer-paragraph-spacing": "0px", transform: "none", opacity: "1" } as React.CSSProperties}>
                        <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                            style={{ "--framer-text-color": "var(--extracted-r6o4lv, var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255)))" } as React.CSSProperties}>
                            Learn More
                        </p>
                    </div>
                </div>
                <div className="framer-1mxeorf" data-framer-name="Arrow"
                    style={{ backgroundColor: "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", mask: "radial-gradient(50% 50%, rgb(0, 0, 0) 97.7319%, rgba(0, 0, 0, 0) 100%)", opacity: "1" } as React.CSSProperties}>
                    <div className="framer-nrss4v-container" style={STYLES.opacity1}>
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
        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
            <div className={card.containerClass} style={STYLES.cardContainer}>
                <div className="framer-Bmxwm framer-YF6mi framer-DZNJn framer-cx3hr framer-ae7Kc framer-1l6rd07 framer-v-576xtk"
                    data-border="true" data-framer-name="Phone" style={STYLES.phoneCard}>
                    <div className="framer-dfpa4m" data-framer-name="Container" style={STYLES.opacity1}>
                        <div className="framer-1b1cgne" data-framer-name="Heading &amp; Button" style={STYLES.opacity1}>
                            <div className="framer-9ocz71" data-framer-name="Container" style={STYLES.opacity1}>
                                <div className="framer-k2ztwh" data-framer-name="Highlight  Badge" style={{ borderRadius: "5px", opacity: "1" } as React.CSSProperties}>
                                    <div className="framer-f6m2i" data-framer-name="Highlight Block"
                                        style={{ backgroundColor: "var(--token-0ba14857-4cac-4c3a-9d51-2216d72bf9ab, rgb(209, 242, 255))", willChange: "transform", opacity: "1", transform: "translateX(-200px)" } as React.CSSProperties}>
                                    </div>
                                    <div className="framer-1u17n32" data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", "--framer-link-text-color": "rgb(0, 153, 255)", "--framer-link-text-decoration": "underline", opacity: "1", transform: "none" } as React.CSSProperties}>
                                        <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                            style={{ "--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" } as React.CSSProperties}>
                                            {card.badge}
                                        </p>
                                    </div>
                                </div>
                                <div className="framer-1qlhb8w" data-framer-name="Heading &amp; Button" style={STYLES.opacity1}>
                                    <div className="framer-xk7xl5" data-framer-name="Heading &amp; Supporting Text" style={STYLES.opacity1}>
                                        <div className="framer-1ddp2mg" data-framer-component-type="RichTextContainer" style={STYLES.richTextContainer}>
                                            <h4 className="framer-text framer-styles-preset-15b5etd" data-styles-preset="amESisFWp"
                                                style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                                {card.title}
                                            </h4>
                                        </div>
                                        <div className="framer-3wkqb4" data-framer-component-type="RichTextContainer" style={STYLES.richTextContainer}>
                                            <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx"
                                                style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                                {card.description}
                                            </p>
                                        </div>
                                    </div>
                                    <LearnMoreButton />
                                </div>
                            </div>
                        </div>
                        <div className="framer-1yqsjdc" data-framer-name="Image" style={STYLES.opacity1}>
                            <div className="framer-n906kc" data-framer-name="Image" style={{ borderRadius: "5px", opacity: "1" } as React.CSSProperties}>
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
        <section className="framer-1k4v191" data-framer-name="Feature Section" id="feature">
            <div className="framer-m2cf04" data-framer-name="Container">
                <div className="framer-12vv10h" data-framer-name="Heading &amp; Image">
                    <div className="framer-18ior2y" data-framer-name="Image"
                        style={{ willChange: "transform", opacity: "1", transform: "translateX(-100px)" } as React.CSSProperties}>
                        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                            <div className="framer-1930j7g" data-framer-name="Image">
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
                    <div className="framer-g75fwc" data-framer-name="Heading &amp; Supporting Text">
                        <div className="framer-157nuz9" data-framer-name="Heading Container">
                            <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                <div className="framer-jxcqf0-container">
                                    <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                        data-border="true" data-framer-name="Badge"
                                        style={{ "--border-bottom-width": "1px", "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", "--border-left-width": "1px", "--border-right-width": "1px", "--border-style": "solid", "--border-top-width": "1px", backgroundColor: "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))", borderRadius: "17px", boxShadow: "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", opacity: "1" } as React.CSSProperties}>
                                        <div className="framer-1l1ajhh" data-framer-name="Icon" style={STYLES.opacity1}>
                                            <svg className="framer-BpUsM framer-qgvfsn" role="presentation" viewBox="0 0 24 24"
                                                style={{ "--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "--pgex8v": "1.4", opacity: "1" } as React.CSSProperties}>
                                                <use href="#876389144"></use>
                                            </svg>
                                        </div>
                                        <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", "--framer-link-text-color": "rgb(0, 153, 255)", "--framer-link-text-decoration": "underline", transform: "none", opacity: "1" } as React.CSSProperties}>
                                            <p className="framer-text framer-styles-preset-kmaoy8" data-styles-preset="MV92va9oP"
                                                style={{ "--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" } as React.CSSProperties}>
                                                Key Capabilities
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="framer-1h3j3nj" data-framer-name="Heading Content">
                                <div className="framer-15ylilk" data-framer-name="Container">
                                    <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                        <div className="framer-xphh5z" data-framer-name="Heading" data-framer-component-type="RichTextContainer"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" } as React.CSSProperties}>
                                            <h2 className="framer-text framer-styles-preset-199apa9" data-styles-preset="Ty6zNsrjE"
                                                style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                                Smarter task management, built for teams.
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                        <div className="framer-14b3j8t" data-framer-name="Supporting text" data-framer-component-type="RichTextContainer"
                                            style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" } as React.CSSProperties}>
                                            <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx"
                                                style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                                From task planning to AI-driven suggestions, Taskos gives your team the tools to move fast, stay focused, and get work done — together.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="framer-1kqwlfv" data-framer-name="Feature List">
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
                <div className="framer-oj6pqy" data-framer-name="Feature Card">
                    {featureCards.map((card, index) => (
                        <FeatureCard key={card.id} card={card} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Feature
