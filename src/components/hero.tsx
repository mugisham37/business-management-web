import React from 'react'

// Reusable style constants
const COMMON_STYLES = {
  opacity1: { opacity: "1" } as React.CSSProperties,
  flexColumn: {
    outline: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    flexShrink: "0"
  } as React.CSSProperties,
  imageWrapper: {
    position: "absolute",
    borderRadius: "inherit",
    top: "0",
    right: "0",
    bottom: "0",
    left: "0"
  } as React.CSSProperties,
  imageStyle: {
    display: "block",
    width: "100%",
    height: "100%",
    borderRadius: "inherit",
    objectPosition: "center",
    objectFit: "cover"
  } as React.CSSProperties
}

// Avatar data configuration
const AVATAR_DATA = [
  {
    className: "framer-1wo8obo",
    width: 800,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png?scale-down-to=1024 682w,https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png 800w",
    src: "https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png",
    transform: undefined
  },
  {
    className: "framer-opum0o",
    width: 840,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png?scale-down-to=1024 716w,https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png 840w",
    src: "https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png",
    transform: "translate(-50%, -50%)"
  },
  {
    className: "framer-1kppgrc",
    width: 1200,
    height: 799,
    srcSet: "https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png?scale-down-to=512 512w,https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png 1200w",
    src: "https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png",
    transform: "translate(-50%, -50%)"
  },
  {
    className: "framer-1rq7k0",
    width: 904,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png?scale-down-to=1024 771w,https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png 904w",
    src: "https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png",
    transform: "translate(-50%, -50%)"
  },
  {
    className: "framer-q5wh5f",
    width: 900,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png?scale-down-to=1024 768w,https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png 900w",
    src: "https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png",
    transform: "translate(-50%, -50%)"
  }
]

// Reusable Avatar component
const Avatar: React.FC<{ data: typeof AVATAR_DATA[0] }> = ({ data }) => (
  <div className={data.className} style={data.transform ? { transform: data.transform } : undefined}>
    <div style={COMMON_STYLES.imageWrapper} data-framer-background-image-wrapper="true">
      <img
        decoding="async"
        width={data.width}
        height={data.height}
        sizes="28px"
        srcSet={data.srcSet}
        src={data.src}
        alt=""
        style={COMMON_STYLES.imageStyle}
      />
    </div>
  </div>
)

// Reusable Button component
interface ButtonProps {
  variant: 'primary' | 'secondary'
  text: string
  containerClass: string
  variantClass: string
  frameName: string
  showArrow?: boolean
}

const HeroButton: React.FC<ButtonProps> = ({ variant, text, containerClass, variantClass, frameName, showArrow = false }) => {
  const isPrimary = variant === 'primary'
  
  const buttonStyle = {
    "--border-bottom-width": isPrimary ? "0px" : "1px",
    "--border-color": isPrimary ? "rgba(0, 0, 0, 0)" : "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(234, 237, 241))",
    "--border-left-width": isPrimary ? "0px" : "1px",
    "--border-right-width": isPrimary ? "0px" : "1px",
    "--border-style": "solid",
    "--border-top-width": isPrimary ? "0px" : "1px",
    backgroundColor: isPrimary ? "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))" : "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))",
    borderRadius: "27px",
    boxShadow: isPrimary ? "none" : "0px 5px 10px 0px var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))",
    opacity: "1"
  } as React.CSSProperties

  const textColor = isPrimary 
    ? "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))"
    : "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))"

  const textContainerStyle = {
    ...COMMON_STYLES.flexColumn,
    "--extracted-r6o4lv": textColor,
    "--framer-paragraph-spacing": "0px",
    transform: "none",
    opacity: "1"
  } as React.CSSProperties

  return (
    <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
      <div className={containerClass}>
        <a
          className={`framer-i8Jnw framer-YF6mi framer-1jz64ot ${variantClass} framer-1jhx1jk`}
          data-framer-name={frameName}
          data-highlight="true"
          data-border={!isPrimary ? "true" : undefined}
          href="https://www.framer.com?via=green13"
          target="_blank"
          rel="noopener"
          tabIndex={0}
          style={buttonStyle}
        >
          <div className="framer-12n0srg" data-framer-name="Container" style={COMMON_STYLES.opacity1}>
            <div className="framer-1669q28" data-framer-name="Text" style={COMMON_STYLES.opacity1}>
              <div
                className="framer-1fovsuz"
                data-framer-name="Text"
                data-framer-component-type="RichTextContainer"
                style={textContainerStyle}
              >
                <p
                  className="framer-text framer-styles-preset-kmaoy8"
                  data-styles-preset="MV92va9oP"
                  style={{ "--framer-text-color": `var(--extracted-r6o4lv, ${textColor})` } as React.CSSProperties}
                >
                  {text}
                </p>
              </div>
            </div>
            {showArrow && (
              <div
                className="framer-1mxeorf"
                data-framer-name="Arrow"
                style={{
                  backgroundColor: "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))",
                  mask: "radial-gradient(50% 50%, rgb(0, 0, 0) 97.7319%, rgba(0, 0, 0, 0) 100%)",
                  opacity: "1"
                }}
              >
                <div className="framer-nrss4v-container" style={COMMON_STYLES.opacity1}>
                  <div style={{ display: "contents" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 256 256"
                      focusable="false"
                      color="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))"
                      style={{
                        userSelect: "none",
                        width: "100%",
                        height: "100%",
                        display: "inline-block",
                        fill: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
                        color: "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
                        flexShrink: "0"
                      }}
                    >
                      <g color="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </a>
      </div>
    </div>
  )
}

const hero = () => {
  return (
    <section className="framer-1ju9km5" data-framer-name="Hero Section" id="hero">
                    <div className="framer-4unfev" data-framer-name="Heading & Supporting Text">
                        <div className="framer-kcmu88" data-framer-name="Heading Container">
                            <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                <div className="framer-1dibk0q-container" data-framer-appear-id="1dibk0q"
                                    style={{ opacity: "1", transform: "none", willChange: "transform" }}>
                                    <div className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                                        data-border="true" data-framer-name="Badge"
                                        style={{"--border-bottom-width": "1px", "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))", "--border-left-width": "1px", "--border-right-width": "1px", "--border-style": "solid", "--border-top-width": "1px", "backgroundColor": "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))", "borderRadius": "17px", "boxShadow": "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))", "opacity": "1"} as React.CSSProperties}>
                                        <div className="framer-1l1ajhh" data-framer-name="Icon" style={COMMON_STYLES.opacity1}><svg
                                                className="framer-LmhHe framer-qgvfsn" role="presentation"
                                                viewBox="0 0 24 24"
                                                style={{"--1m6trwb": "0", "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))", "--pgex8v": "1.4", "opacity": "1"} as React.CSSProperties}>
                                                <use href="#1529132500"></use>
                                            </svg></div>
                                        <div className="framer-1710qob" data-framer-component-type="RichTextContainer"
                                            style={{
                                              ...COMMON_STYLES.flexColumn,
                                              "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
                                              "--framer-link-text-color": "rgb(0, 153, 255)",
                                              "--framer-link-text-decoration": "underline",
                                              transform: "none",
                                              opacity: "1"
                                            } as React.CSSProperties}>
                                            <p className="framer-text framer-styles-preset-kmaoy8"
                                                data-styles-preset="MV92va9oP"
                                                style={{"--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))"} as React.CSSProperties}>
                                                AI Project Tool</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="framer-1af0tnz" data-framer-name="Heading Content">
                                <div className="framer-14lj2mo" data-framer-name="Container">
                                    <div className="framer-bkpwdd" data-framer-appear-id="bkpwdd" data-framer-name="Heading"
                                        style={{
                                          ...COMMON_STYLES.flexColumn,
                                          opacity: "1",
                                          transform: "none",
                                          willChange: "transform"
                                        }}
                                        data-framer-component-type="RichTextContainer">
                                        <h1 className="framer-text framer-styles-preset-18ehe4m"
                                            data-styles-preset="kDwrjMuv7">Launch your SaaS tool, smarter and faster
                                        </h1>
                                    </div>
                                    <div className="framer-1uk34jx" data-framer-name="Supporting text"
                                        style={{
                                          ...COMMON_STYLES.flexColumn,
                                          willChange: "transform",
                                          opacity: "1",
                                          transform: "perspective(1200px)"
                                        }}
                                        data-framer-component-type="RichTextContainer">
                                        <p className="framer-text framer-styles-preset-wct5n4"
                                            data-styles-preset="OvgFe4dMx">Build a stunning SaaS landing page that
                                            communicates your value, captures leads, and converts—without writing a
                                            single line of code.</p>
                                    </div>
                                </div>
                                <div className="framer-1jc27pn" data-framer-appear-id="1jc27pn" data-framer-name="Button"
                                    style={{ opacity: "1", transform: "none", willChange: "transform" }}>
                                    <HeroButton
                                      variant="primary"
                                      text="Start Free Trial"
                                      containerClass="framer-cdcok3-container"
                                      variantClass="framer-v-1uge9f"
                                      frameName="Light Arrow - Phone"
                                      showArrow={true}
                                    />
                                    <HeroButton
                                      variant="secondary"
                                      text="Join Waitlist"
                                      containerClass="framer-1np96zq-container"
                                      variantClass="framer-v-f1hqh9"
                                      frameName="Border - Phone"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="framer-1bhe5y" data-framer-appear-id="1bhe5y" data-framer-name="Social Trust"
                            style={{ opacity: "1", transform: "none", willChange: "transform" }}>
                            <div className="framer-elw1j5" data-framer-name="Avatars">
                                {AVATAR_DATA.map((avatar, index) => (
                                  <Avatar key={index} data={avatar} />
                                ))}
                            </div>
                            <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
                                <div className="framer-18v5tzb" data-framer-name="Title"
                                    data-framer-component-type="RichTextContainer"
                                    style={{ ...COMMON_STYLES.flexColumn, transform: "none" }}>
                                    <p className="framer-text framer-styles-preset-1x4srpb" data-styles-preset="WGktsHNSh">
                                        Trusted already by 1.2k+</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="framer-1ytjer" data-framer-name="Visual Container">
                        <div className="ssr-variant hidden-187ctmn">
                            <div data-framer-component-type="SVG" data-framer-name="Icon"
                                style={{"imageRendering": "pixelated", "flexShrink": "0", "fill": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(0, 0, 0))", "color": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(0, 0, 0))"}}
                                className="framer-1vvurf7" aria-hidden="true">
                                <div className="svgContainer" style={{"width": "100%", "height": "100%", "aspectRatio": "inherit"}}><svg
                                        style={{"width": "100%", "height": "100%"}} viewBox="0 0 106 106" preserveAspectRatio="none"
                                        width="100%" height="100%">
                                        <use href="#svg-941756012_3603"></use>
                                    </svg></div>
                            </div>
                        </div>
                        <div className="framer-pjtjzt-container">{/*-->
                            <div className="ssr-variant hidden-187ctmn"><video
                                    src="https://framerusercontent.com/assets/jl25p5MbzRr21hTaVDiw9zoPxEk.mp4" loop={true}
                                    preload="auto"
                                    poster="https://framerusercontent.com/images/bNkwYVRtMaXt2uYdJ6wlbJVlIk.png"
                                    muted={true} playsInline={true}
                                    style={{"cursor": "auto", "width": "100%", "height": "100%", "borderRadius": "0px", "display": "block", "objectFit": "cover", "backgroundColor": "var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))", "objectPosition": "50% 50%"}}
                                    autoPlay={true}></video></div><!--/*/}
                        </div>
                    </div>
                </section>
  )
}

export default hero