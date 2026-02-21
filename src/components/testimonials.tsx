import React from 'react'

// Shared style constants
const STYLES = {
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
    cardOuter: {
        "--border-bottom-width": "1px",
        "--border-color": "var(--token-eb034d87-a58b-4a0b-902d-43f88ea2216d, rgb(242, 242, 242))",
        "--border-left-width": "1px",
        "--border-right-width": "1px",
        "--border-style": "solid",
        "--border-top-width": "1px",
        backgroundColor: "var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))",
        borderRadius: "12px",
        boxShadow: "0px 0px 2px 0px var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))",
        opacity: "1"
    } as React.CSSProperties,
    cardInner: {
        "--border-bottom-width": "1px",
        "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))",
        "--border-left-width": "1px",
        "--border-right-width": "1px",
        "--border-style": "solid",
        "--border-top-width": "1px",
        backgroundColor: "var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))",
        borderRadius: "10px",
        opacity: "1"
    } as React.CSSProperties,
    cardHeader: {
        "--border-bottom-width": "1px",
        "--border-color": "var(--token-9cf61545-9ec8-4c23-873d-6ec7f44bfe14, rgb(229, 229, 232))",
        "--border-left-width": "0px",
        "--border-right-width": "0px",
        "--border-style": "solid",
        "--border-top-width": "0px",
        opacity: "1"
    } as React.CSSProperties,
    richText: {
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
    richTextFaded: {
        outline: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        flexShrink: "0",
        "--framer-link-text-color": "rgb(0, 153, 255)",
        "--framer-link-text-decoration": "underline",
        opacity: "0.8",
        transform: "none"
    } as React.CSSProperties,
    imageWrapper: {
        position: "absolute",
        borderRadius: "inherit",
        inset: "0px"
    } as React.CSSProperties,
    image: {
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        objectPosition: "center center",
        objectFit: "cover"
    } as React.CSSProperties
}

// Testimonial data
interface Testimonial {
    name: string
    role: string
    quote: string
    image: {
        src: string
        srcSet: string
        width: number
        height: number
    }
}

const TESTIMONIALS_ROW_1: Testimonial[] = [
    {
        name: "Ava Cooper",
        role: "Customer Success Lead",
        quote: "We're hitting deadlines faster than ever — with fewer surprises and more clarity.",
        image: {
            src: "https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png",
            srcSet: "https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png?scale-down-to=1024 682w,https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Liam Thompson",
        role: "Tech Lead",
        quote: "We've tried many platforms — this is the first that adapts to how we actually work.",
        image: {
            src: "https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png",
            srcSet: "https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png?scale-down-to=1024 682w,https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Chloe Bennett",
        role: "Product Manager",
        quote: "This tool reduced status meetings and keeps us focused on key goals.",
        image: {
            src: "https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg",
            srcSet: "https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg?scale-down-to=1024 698w,https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg 818w",
            width: 818,
            height: 1200
        }
    }
]

const TESTIMONIALS_ROW_2: Testimonial[] = [
    {
        name: "Ethan Hayes",
        role: "Engineering Manager",
        quote: "I can finally see what everyone's working on without constantly checking in.",
        image: {
            src: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png",
            srcSet: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png?scale-down-to=1024 682w,https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Sophia Martinez",
        role: "UX Designer",
        quote: "The interface is intuitive and the collaboration features are exactly what we needed.",
        image: {
            src: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png",
            srcSet: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png?scale-down-to=1024 682w,https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Mason Rivera",
        role: "Scrum Master",
        quote: "Real-time edits and AI suggestions make our sprint planning incredibly smooth.",
        image: {
            src: "https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png",
            srcSet: "https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png?scale-down-to=512 512w,https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png 1200w",
            width: 1200,
            height: 1200
        }
    }
]

// Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="framer-N5GgA framer-udI2x framer-YF6mi framer-ae7Kc framer-94blz2 framer-v-94blz2"
        data-framer-name="Primary" style={{opacity: "1"}}>
        <div className="framer-1qojxkp" data-border="true"
            data-framer-name="Testimonials Card"
            style={STYLES.cardOuter}>
            <div className="framer-1odrc7x" data-border="true"
                data-framer-name="Container"
                style={STYLES.cardInner}>
                <div className="framer-1k0yhk0" data-border="true"
                    data-framer-name="Container"
                    style={STYLES.cardHeader}>
                    <div className="framer-1d8oj41"
                        data-framer-name="Avatar &amp; Heading"
                        style={{opacity: "1"}}>
                        <div className="framer-9qfciw"
                            data-framer-name="Avatar"
                            style={{borderRadius: "10px", opacity: "1"}}>
                            <div data-framer-background-image-wrapper="true"
                                style={STYLES.imageWrapper}>
                                <img decoding="async"
                                    width={testimonial.image.width}
                                    height={testimonial.image.height}
                                    sizes="43px"
                                    srcSet={testimonial.image.srcSet}
                                    src={testimonial.image.src}
                                    alt=""
                                    style={STYLES.image} />
                            </div>
                        </div>
                        <div className="framer-2i8it8"
                            data-framer-name="Heading"
                            style={{opacity: "1"}}>
                            <div className="framer-14ia0is"
                                data-framer-component-type="RichTextContainer"
                                style={STYLES.richText}>
                                <h5 className="framer-text framer-styles-preset-rlw5rm"
                                    data-styles-preset="ozhLrZjZv"
                                    style={{"--framer-text-alignment": "left"} as React.CSSProperties}>
                                    {testimonial.name}</h5>
                            </div>
                            <div className="framer-1g7bq41"
                                data-framer-component-type="RichTextContainer"
                                style={STYLES.richTextFaded}>
                                <h6 className="framer-text framer-styles-preset-kmaoy8"
                                    data-styles-preset="MV92va9oP"
                                    style={{"--framer-text-alignment": "left"} as React.CSSProperties}>
                                    {testimonial.role}</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="framer-e3ecoi"
                    data-framer-name="Content"
                    style={{opacity: "1"}}>
                    <div className="framer-1owpah6"
                        data-framer-component-type="RichTextContainer"
                        style={STYLES.richText}>
                        <p className="framer-text framer-styles-preset-wct5n4"
                            data-styles-preset="OvgFe4dMx"
                            style={{"--framer-text-alignment": "left"} as React.CSSProperties}>
                            {testimonial.quote}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// Testimonial Group Component
const TestimonialGroup: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => (
    <div className="framer-rhovo5" data-framer-name="Testimonial 1" style={{flexShrink: "0"}}>
        {testimonials.map((testimonial, index) => (
            <div key={`${testimonial.name}-${index}`} 
                className={index === 0 ? "framer-rmpmec-container" : index === 1 ? "framer-1wqz38i-container" : "framer-1ryihk6-container"}>
                <TestimonialCard testimonial={testimonial} />
            </div>
        ))}
    </div>
)

// Testimonial Row Component
const TestimonialRow: React.FC<{ testimonials: Testimonial[], maskGradient: string, transform?: string }> = ({ 
    testimonials, 
    maskGradient,
    transform 
}) => (
    <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
        <section style={{
            display: "flex",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            placeItems: "center",
            margin: "0px",
            padding: "10px",
            listStyleType: "none",
            opacity: "1",
            maskImage: maskGradient,
            overflow: "hidden"
        }}>
            <ul style={{
                display: "flex",
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                placeItems: "center",
                margin: "0px",
                padding: "0px",
                listStyleType: "none",
                gap: "10px",
                position: "relative",
                flexDirection: "row",
                willChange: "auto",
                transform: transform || "translateX(0px)",
                left: transform ? "-1764px" : undefined
            }}>
                <li>
                    <TestimonialGroup testimonials={testimonials} />
                </li>
                <li aria-hidden="true">
                    <TestimonialGroup testimonials={testimonials} />
                </li>
                <li aria-hidden="true">
                    <TestimonialGroup testimonials={testimonials} />
                </li>
            </ul>
        </section>
    </div>
)

const Testimonials = () => {
    return (
        <section className="framer-16n5f3a" data-framer-name="Testimonials Section" id="testimonials">
            <div className="framer-1qr5noc" data-framer-name="Container">
                <div className="framer-192a873" data-framer-name="Heading &amp; Supporting Text">
                    <div className="framer-1ld4eb1" data-framer-name="Heading Container">
                        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                            <div className="framer-1hjcywz-container">
                                <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                    data-border="true" data-framer-name="Badge"
                                    style={STYLES.badge}>
                                    <div className="framer-1l1ajhh" data-framer-name="Icon" style={{opacity: "1"}}>
                                        <svg className="framer-qYPz7 framer-qgvfsn" role="presentation"
                                            viewBox="0 0 24 24"
                                            style={{"--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "--pgex8v": "1.4", opacity: "1"} as React.CSSProperties}>
                                            <use href="#535726797"></use>
                                        </svg>
                                    </div>
                                    <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                        style={STYLES.badgeText}>
                                        <p className="framer-text framer-styles-preset-kmaoy8"
                                            data-styles-preset="MV92va9oP"
                                            style={{"--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))"} as React.CSSProperties}>
                                            What Teams Are Saying</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="framer-1g0u6xh" data-framer-name="Heading Content">
                            <div className="framer-fxqfuk" data-framer-name="Container">
                                <div className="framer-ugbky8" data-framer-name="Heading"
                                    style={{outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none"}}
                                    data-framer-component-type="RichTextContainer">
                                    <h2 className="framer-text framer-styles-preset-199apa9"
                                        data-styles-preset="Ty6zNsrjE" style={{"--framer-text-alignment": "center"} as React.CSSProperties}>
                                        See what our users are saying.</h2>
                                </div>
                                <div className="framer-1qwxxux" data-framer-name="Supporting text"
                                    style={{outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none"}}
                                    data-framer-component-type="RichTextContainer">
                                    <p className="framer-text framer-styles-preset-wct5n4"
                                        data-styles-preset="OvgFe4dMx" style={{"--framer-text-alignment": "center"} as React.CSSProperties}>
                                        Real stories from teams who streamlined their workflow and delivered
                                        more with less.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="framer-7e17l0" data-framer-name="Testimonials List">
                    <div className="framer-dd0vml" data-framer-name="Testimonials"
                        style={{willChange: "transform", opacity: "0", transform: "translateY(80px)"}}>
                        <div className="framer-vwrnhj-container" data-framer-name="Testimonial Row">
                            <TestimonialRow 
                                testimonials={TESTIMONIALS_ROW_1}
                                maskGradient="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 6%, rgb(0, 0, 0) 94%, rgba(0, 0, 0, 0) 100%)"
                            />
                        </div>
                        <div className="framer-gpylv0-container" data-framer-name="Testimonial Row">
                            <TestimonialRow 
                                testimonials={TESTIMONIALS_ROW_2}
                                maskGradient="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)"
                                transform="translateX(0px)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Testimonials
