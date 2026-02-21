import React from 'react'

interface BenefitCardProps {
    iconHref: string;
    title: string;
    description: string;
}

const benefitsData: BenefitCardProps[] = [
    {
        iconHref: "#617290613",
        title: "Zero Overlap Planning",
        description: "Prevent task conflicts with built-in smart scheduling."
    },
    {
        iconHref: "#1067826548",
        title: "Click-to-Act Notifications",
        description: "Act fast with alerts—no clutter or missed updates."
    },
    {
        iconHref: "#2840072777",
        title: "Offline-Ready Sync",
        description: "Stay synced—updates auto-load once you're online."
    },
    {
        iconHref: "#987190984",
        title: "Built-In Audit Trail",
        description: "Track every edit and action with built-in transparency."
    },
    {
        iconHref: "#1283949305",
        title: "Smart Recurring Tasks",
        description: "Automate with flexible task logic and helpful reminders."
    },
    {
        iconHref: "#3494739676",
        title: "Human-Centered Design",
        description: "Built for clarity, ease, and real-world user needs and habits."
    }
];

const BenefitCard: React.FC<BenefitCardProps> = ({ iconHref, title, description }) => {
    return (
        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
            <div className="framer-dxqsp9-container"
                style={{ willChange: "transform", opacity: "0", transform: "translateY(50px)" }}>
                <div className="framer-CpbJJ framer-Fz19O framer-ae7Kc framer-uyvmox framer-v-uyvmox"
                    data-border="true" data-framer-name="Primary - Blue"
                    style={{ "--border-bottom-width": "1px", "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", "--border-left-width": "1px", "--border-right-width": "1px", "--border-style": "solid", "--border-top-width": "1px", backgroundColor: "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", width: "100%", borderRadius: "10px", boxShadow: "0px 2px 5px 0px var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))", opacity: "1" } as React.CSSProperties}>
                    <div className="framer-1lv4fag" data-framer-name="Container"
                        style={{ opacity: "1" }}>
                        <div className="framer-et94s" data-framer-name="Icon"
                            style={{ backgroundColor: "var(--token-63f804c8-3c4f-490d-9524-ef19f06222dd, rgb(240, 248, 255))", borderRadius: "8px", opacity: "1" }}>
                            <svg className="framer-6W5Ea framer-i7dtij" role="presentation"
                                viewBox="0 0 24 24"
                                style={{ "--1m6trwb": "0", "--21h8s6": "var(--token-d602a9d1-da3b-45d6-b039-eac0d7c79341, rgb(66, 135, 255))", "--pgex8v": "1.5", opacity: "1" } as React.CSSProperties}>
                                <use href={iconHref}></use>
                            </svg>
                        </div>
                        <div className="framer-1qvo9d"
                            data-framer-name="Heading &amp; Supporting Text"
                            style={{ opacity: "1" }}>
                            <div className="framer-9wmgkb"
                                data-framer-component-type="RichTextContainer"
                                style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--framer-link-text-color": "rgb(0, 153, 255)", "--framer-link-text-decoration": "underline", transform: "none", opacity: "1" } as React.CSSProperties}>
                                <h6 className="framer-text framer-styles-preset-ggytww"
                                    data-styles-preset="xhIf5qL2n"
                                    style={{ "--framer-text-alignment": "left" } as React.CSSProperties}>
                                    {title}
                                </h6>
                            </div>
                            <div className="framer-pw26ej"
                                data-framer-component-type="RichTextContainer"
                                style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--framer-link-text-color": "rgb(0, 153, 255)", "--framer-link-text-decoration": "underline", opacity: "0.9", transform: "none" } as React.CSSProperties}>
                                <p className="framer-text framer-styles-preset-wct5n4"
                                    data-styles-preset="OvgFe4dMx"
                                    style={{ "--framer-text-alignment": "left" } as React.CSSProperties}>
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Benefits = () => {
    return (
        <section className="framer-irmuqp" data-framer-name="Benefits Section" id="benefits">
            <div className="framer-d9t47k" data-framer-name="Container">
                <div className="framer-pow80m" data-framer-name="Heading &amp; Supporting Text">
                    <div className="framer-p7n86w" data-framer-name="Heading Container">
                        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                            <div className="framer-f2ren1-container">
                                <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                    data-border="true" data-framer-name="Badge"
                                    style={{ "--border-bottom-width": "1px", "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", "--border-left-width": "1px", "--border-right-width": "1px", "--border-style": "solid", "--border-top-width": "1px", backgroundColor: "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))", borderRadius: "17px", boxShadow: "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", opacity: "1" } as React.CSSProperties}>
                                    <div className="framer-1l1ajhh" data-framer-name="Icon" style={{ opacity: "1" }}><svg
                                        className="framer-S0ioJ framer-qgvfsn" role="presentation"
                                        viewBox="0 0 24 24"
                                        style={{ "--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "--pgex8v": "1.4", opacity: "1" } as React.CSSProperties}>
                                        <use href="#3282134952"></use>
                                    </svg></div>
                                    <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                        style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))", "--framer-link-text-color": "rgb(0, 153, 255)", "--framer-link-text-decoration": "underline", transform: "none", opacity: "1" } as React.CSSProperties}>
                                        <p className="framer-text framer-styles-preset-kmaoy8"
                                            data-styles-preset="MV92va9oP"
                                            style={{ "--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))" } as React.CSSProperties}>
                                            Why Teams Choose Us</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="framer-1outbne" data-framer-name="Heading Content">
                            <div className="framer-12fm7yb" data-framer-name="Container">
                                <div className="framer-1yah194" data-framer-name="Heading"
                                    style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" }}
                                    data-framer-component-type="RichTextContainer">
                                    <h2 className="framer-text framer-styles-preset-199apa9"
                                        data-styles-preset="Ty6zNsrjE" style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                        Boost clarity, speed, and team flow.</h2>
                                </div>
                                <div className="framer-1dbouks" data-framer-name="Supporting text"
                                    style={{ outline: "none", display: "flex", flexDirection: "column", justifyContent: "flex-start", flexShrink: "0", transform: "none" }}
                                    data-framer-component-type="RichTextContainer">
                                    <p className="framer-text framer-styles-preset-wct5n4"
                                        data-styles-preset="OvgFe4dMx" style={{ "--framer-text-alignment": "center" } as React.CSSProperties}>
                                        Packed with thoughtful features that help teams stay aligned, avoid
                                        confusion, and move fast — without the chaos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="framer-elwthe" data-framer-name="Benefits Card">
                    <div className="framer-1b0b1iz" data-framer-name="Grid">
                        {benefitsData.map((benefit, index) => (
                            <BenefitCard
                                key={index}
                                iconHref={benefit.iconHref}
                                title={benefit.title}
                                description={benefit.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Benefits