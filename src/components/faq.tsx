import React from 'react'

// FAQ questions data
const faqQuestions = [
    "What makes this task tool different from others?",
    "Can I use this for a large team or company?",
    "Is the AI really useful or just a gimmick?",
    "What integrations are supported?",
    "Is my data secure?",
    "Can I customize workflows for different projects?"
];

// Reusable style objects
const containerStyles = {
    willChange: "transform" as const,
    opacity: "0",
    transform: "translateY(50px)"
};

const faqItemStyles = {
    "-BorderBottomWidth": "1px",
    "-BorderColor": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))",
    "-BorderLeftWidth": "1px",
    "-BorderRightWidth": "1px",
    "-BorderStyle": "solid",
    "-BorderTopWidth": "1px",
    backgroundColor: "var(--token-e1c52d29-6b20-4ee3-afb3-f179ac191e9c, rgb(251, 251, 251))",
    width: "100%",
    borderRadius: "10px",
    opacity: "1"
};

const textContainerStyles = {
    outline: "none",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
    flexShrink: "0",
    "-Extracted-1w1cjl5": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
    transform: "none",
    opacity: "1"
};

const headingTextStyles = {
    "-FramerTextAlignment": "left",
    "-FramerTextColor": "var(--extracted-1w1cjl5, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))"
};

const plusBarStyles = {
    backgroundColor: "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(0, 94, 255))",
    borderRadius: "1px",
    opacity: "1"
};

const FAQ = () => {
    return (
        <section className="framer-5fjja5" data-framer-name="FAQ Section" id="faq">
            <div className="framer-ttr560" data-framer-name="Container">
                <div className="framer-pbk8fn" data-framer-name="Heading &amp; Supporting Text">
                    <div className="framer-8yockc" data-framer-name="Heading Container">
                        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                            <div className="framer-sl2s9k-container">
                                <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                    data-border="true" data-framer-name="Badge"
                                    style={{ "-BorderBottomWidth": "1px", "-BorderColor": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", "-BorderLeftWidth": "1px", "-BorderRightWidth": "1px", "-BorderStyle": "solid", "-BorderTopWidth": "1px", "backgroundColor": "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))", "borderRadius": "17px", "boxShadow": "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", "opacity": "1" } as any}>
                                    <div className="framer-1l1ajhh" data-framer-name="Icon" style={{ "opacity": "1" } as any}><svg
                                        className="framer-zZ6b9 framer-qgvfsn" role="presentation"
                                        viewBox="0 0 24 24"
                                        style={{ "--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "-Pgex8v": "1.4", "opacity": "1" } as any}>
                                        <use href="#3346926003"></use>
                                    </svg></div>
                                    <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                        style={{ "outline": "none", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start", "flexShrink": "0", "-ExtractedR6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", "-FramerLinkTextColor": "rgb(0, 153, 255)", "-FramerLinkTextDecoration": "underline", "transform": "none", "opacity": "1" } as any}>
                                        <p className="framer-text framer-styles-preset-kmaoy8"
                                            data-styles-preset="MV92va9oP"
                                            style={{ "-FramerTextColor": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" } as any}>
                                            FAQ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="framer-1v7525d" data-framer-name="Heading Content">
                            <div className="framer-1lo1jr2" data-framer-name="Container">
                                <div className="framer-113ovyi" data-framer-name="Heading"
                                    style={{ "outline": "none", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start", "flexShrink": "0", "transform": "none" } as any}
                                    data-framer-component-type="RichTextContainer">
                                    <h2 className="framer-text framer-styles-preset-199apa9"
                                        data-styles-preset="Ty6zNsrjE" style={{ "-FramerTextAlignment": "center" } as any}>
                                        Answers to help you get started faster.</h2>
                                </div>
                                <div className="framer-137harn" data-framer-name="Supporting text"
                                    style={{ "outline": "none", "display": "flex", "flexDirection": "column", "justifyContent": "flex-start", "flexShrink": "0", "transform": "none" } as any}
                                    data-framer-component-type="RichTextContainer">
                                    <p className="framer-text framer-styles-preset-wct5n4"
                                        data-styles-preset="OvgFe4dMx" style={{ "-FramerTextAlignment": "center" } as any}>
                                        Real stories from teams who streamlined their workflow and delivered
                                        more with less.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="framer-1nmcetb" data-framer-name="FAQ List">
                    <div className="framer-hdc7uo" data-framer-name="FAQ">
                        {faqQuestions.map((question, index) => (
                            <div key={index} className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                <div className={`framer-${['79veun', 'ooyuop', '9i9mut', '3f2xph', 'y81tcp', '5fffu1'][index]}-container`}
                                    style={containerStyles as any}>
                                    <div className="framer-m9QRL framer-Fz19O framer-ae7Kc framer-12gnatm framer-v-12gnatm"
                                        data-border="true" data-framer-name="Closed" data-highlight="true"
                                        tabIndex={0}
                                        style={faqItemStyles as any}>
                                        <div className="framer-1fg5c7l" data-framer-name="Container"
                                            style={{ "opacity": "1" } as any}>
                                            <div className="framer-1t5jbla" data-framer-name="Content"
                                                style={{ "opacity": "1" } as any}>
                                                <div className="framer-i4y2k1" data-framer-name="Heading"
                                                    style={{ "opacity": "1" } as any}>
                                                    <div className="framer-sml1t9"
                                                        data-framer-component-type="RichTextContainer"
                                                        style={textContainerStyles as any}>
                                                        <h6 className="framer-text framer-styles-preset-ggytww"
                                                            data-styles-preset="xhIf5qL2n"
                                                            style={headingTextStyles as any}>
                                                            {question}</h6>
                                                    </div>
                                                    <div className="framer-1wfqlvf" data-framer-name="Icon"
                                                        style={{ "opacity": "1" } as any}>
                                                        <div className="framer-1dnucf6" data-framer-name="Plus"
                                                            style={{ "opacity": "1" } as any}>
                                                            <div className="framer-1xuhs5x"
                                                                style={plusBarStyles as any}>
                                                            </div>
                                                            <div className="framer-1jeieso"
                                                                style={{ ...plusBarStyles, transform: "rotate(90deg)" } as any}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ