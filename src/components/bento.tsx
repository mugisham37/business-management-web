import React from 'react'

const COMMON_TEXT_CONTAINER_STYLE: React.CSSProperties = {
  outline: "none",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  flexShrink: 0,
  transform: "none"
};

const COMMON_IMAGE_WRAPPER_STYLE: React.CSSProperties = {
  position: "absolute",
  borderRadius: "inherit",
  inset: "0px"
};

const COMMON_IMAGE_STYLE: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  borderRadius: "inherit",
  objectPosition: "center center",
  objectFit: "cover"
};

interface CardData {
  cardClass: string;
  containerClass: string;
  headingContainerClass: string;
  headingClass: string;
  supportingTextClass: string;
  visualContainerClass: string;
  heading: string;
  supportingText: string;
  visualClass?: string;
  visualStyle?: React.CSSProperties;
  imageData?: {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    sizes: string;
  };
  hasPattern?: boolean;
  patternClass?: string;
  patternUrl?: string;
  patternSize?: string;
  additionalVisuals?: Array<{
    class: string;
    style: React.CSSProperties;
    imageData: {
      src: string;
      srcSet: string;
      width: number;
      height: number;
      sizes: string;
    };
  }>;
}

const CARDS_DATA: CardData[] = [
  {
    cardClass: "framer-1rlvqi6",
    containerClass: "framer-xqb2wi",
    headingContainerClass: "framer-z1axju",
    headingClass: "framer-1dgf9f3",
    supportingTextClass: "framer-137prnh",
    visualContainerClass: "framer-bnhzoh",
    heading: "Stay organized, effortlessly.",
    supportingText: "Easily track tasks, assignees, and statuses in one place.",
    visualClass: "framer-e2erwe",
    visualStyle: { willChange: "transform", opacity: 0, transform: "translateX(100px) translateY(50px) rotate(10deg)" },
    imageData: {
      src: "https://framerusercontent.com/images/754QQka8w4iGvi2zXOe03bOKReA.png?scale-down-to=1024",
      srcSet: "https://framerusercontent.com/images/754QQka8w4iGvi2zXOe03bOKReA.png?scale-down-to=1024 701w,https://framerusercontent.com/images/754QQka8w4iGvi2zXOe03bOKReA.png 1126w",
      width: 1126,
      height: 1643,
      sizes: "248px"
    }
  },
  {
    cardClass: "framer-1c2oejc",
    containerClass: "framer-cwlfkj",
    headingContainerClass: "framer-m2ci33",
    headingClass: "framer-x3t0s0",
    supportingTextClass: "framer-12xi9ha",
    visualContainerClass: "framer-56wjpy",
    heading: "Built for fast-moving teams.",
    supportingText: "Collaborate in real time with live edits and comments.",
    visualClass: "framer-1mnb9xe",
    visualStyle: { willChange: "transform", opacity: 0, transform: "translate(-50%, -50%) translateY(50px)" },
    imageData: {
      src: "https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=1024",
      srcSet: "https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=512 512w,https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png 1703w",
      width: 1703,
      height: 1063,
      sizes: "277px"
    },
    hasPattern: true,
    patternClass: "framer-a7imdl",
    patternUrl: "https://framerusercontent.com/images/wGAHOWhVswEtWkOKTJN6s2CW0.svg",
    patternSize: "31.5px"
  },
  {
    cardClass: "framer-1ukvcmo",
    containerClass: "framer-1egzlal",
    headingContainerClass: "framer-1o4xnsa",
    headingClass: "framer-1uiub2k",
    supportingTextClass: "framer-ij1up4",
    visualContainerClass: "framer-1yt7xb4",
    heading: "Precision-Driven Portfolio Growth",
    supportingText: "View tasks as lists, boards, calendars, or timelines.",
    visualStyle: { willChange: "transform", opacity: 0, transform: "translateY(50px)" },
    additionalVisuals: [
      {
        class: "framer-31rptr",
        style: { opacity: 1, transform: "translate(-50%, -50%)" },
        imageData: {
          src: "https://framerusercontent.com/images/4fFv4rUqMG231ZaYSJVqPkeVQI.png?scale-down-to=1024",
          srcSet: "https://framerusercontent.com/images/4fFv4rUqMG231ZaYSJVqPkeVQI.png?scale-down-to=512 512w,https://framerusercontent.com/images/4fFv4rUqMG231ZaYSJVqPkeVQI.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/4fFv4rUqMG231ZaYSJVqPkeVQI.png 1567w",
          width: 1567,
          height: 979,
          sizes: "277px"
        }
      },
      {
        class: "framer-uuzka5",
        style: { opacity: 0.5, transform: "none" },
        imageData: {
          src: "https://framerusercontent.com/images/v3bENZaol8fuP9s7pgABa7DCa0.png?scale-down-to=1024",
          srcSet: "https://framerusercontent.com/images/v3bENZaol8fuP9s7pgABa7DCa0.png?scale-down-to=512 512w,https://framerusercontent.com/images/v3bENZaol8fuP9s7pgABa7DCa0.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/v3bENZaol8fuP9s7pgABa7DCa0.png 1564w",
          width: 1564,
          height: 648,
          sizes: "276px"
        }
      }
    ]
  },
  {
    cardClass: "framer-qspql",
    containerClass: "framer-y0tu4",
    headingContainerClass: "framer-11b2kqe",
    headingClass: "framer-1uo0ccg",
    supportingTextClass: "framer-cdcqqm",
    visualContainerClass: "framer-1jsr59i",
    heading: "Precision-Driven Portfolio Growth",
    supportingText: "Let AI suggest assignments, priorities, and deadlines.",
    visualClass: "framer-1cuq7pr",
    visualStyle: { willChange: "transform", opacity: 1, transform: "none" },
    imageData: {
      src: "https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=4096",
      srcSet: "https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=512 512w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=4096 4096w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png 4230w",
      width: 4230,
      height: 1259,
      sizes: "612px"
    },
    hasPattern: true,
    patternClass: "framer-k576yp",
    patternUrl: "https://framerusercontent.com/images/9c47fOR3CNoSsEtr6IEYJoKM.svg",
    patternSize: "64.5px auto"
  }
];

const RichTextContainer: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={className} style={COMMON_TEXT_CONTAINER_STYLE} data-framer-component-type="RichTextContainer">
    {children}
  </div>
);

const CardImage: React.FC<{ imageData: CardData['imageData']; name: string }> = ({ imageData, name }) => (
  <div data-framer-background-image-wrapper="true" style={COMMON_IMAGE_WRAPPER_STYLE}>
    <img
      decoding="async"
      loading="lazy"
      width={imageData!.width}
      height={imageData!.height}
      sizes={imageData!.sizes}
      srcSet={imageData!.srcSet}
      src={imageData!.src}
      alt=""
      style={COMMON_IMAGE_STYLE}
    />
  </div>
);

const BentoCard: React.FC<{ card: CardData; index: number }> = ({ card, index }) => (
  <div className={card.cardClass} data-border="true" data-framer-name={`Card ${index + 1}`}>
    <div className={card.containerClass} data-framer-name="Container">
      <div className={card.headingContainerClass} data-framer-name="Heading &amp; Supporting Text">
        <RichTextContainer className={card.headingClass}>
          <h6 className="framer-text framer-styles-preset-1h8kgs8" data-styles-preset="WvFMHHPMB">
            {card.heading}
          </h6>
        </RichTextContainer>
        <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
          <div className={card.supportingTextClass} data-framer-component-type="RichTextContainer" style={COMMON_TEXT_CONTAINER_STYLE}>
            <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx" style={{"--framer-text-alignment": "left"} as React.CSSProperties}>
              {card.supportingText}
            </p>
          </div>
        </div>
      </div>
      <div className={card.visualContainerClass} data-framer-name="Visual">
        {card.additionalVisuals ? (
          <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
            <div className={card.visualContainerClass} data-framer-name="Visual" style={card.visualStyle}>
              {card.additionalVisuals.map((visual, idx) => (
                <div key={idx} className={visual.class} data-framer-name={`Bento Card ${index + 1}-${idx + 1}`} style={visual.style}>
                  <CardImage imageData={visual.imageData} name={`Bento Card ${index + 1}-${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
            <div className={card.visualClass} data-framer-name={`Bento Card ${index + 1}`} style={card.visualStyle}>
              {card.imageData && <CardImage imageData={card.imageData} name={`Bento Card ${index + 1}`} />}
            </div>
          </div>
        )}
      </div>
    </div>
    {card.hasPattern && (
      <div className={index === 1 ? "ssr-variant hidden-187ctmn hidden-72rtr7" : ""}>
        <div className={card.patternClass} data-framer-name="Pattern">
          <div
            style={{
              position: "absolute",
              borderRadius: "inherit",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: `url(${card.patternUrl})`,
              backgroundRepeat: "repeat",
              backgroundPosition: "center bottom",
              border: 0,
              backgroundSize: card.patternSize
            }}
            data-framer-background-image-wrapper="true"
          />
        </div>
      </div>
    )}
  </div>
);

const bento = () => {
  return (
    <section className="framer-1fltcdt" data-framer-name="Bento Section" id="bento">
      <div className="framer-1okdqm0" data-framer-name="Heading &amp; Supporting Text">
        <div className="framer-xvim9" data-framer-name="Heading Container">
          <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
            <div className="framer-1i1kp67-container">
              <div
                className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                data-border="true"
                data-framer-name="Badge"
                style={{
                  "--border-bottom-width": "1px",
                  "--border-color": "var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))",
                  "--border-left-width": "1px",
                  "--border-right-width": "1px",
                  "--border-style": "solid",
                  "--border-top-width": "1px",
                  backgroundColor: "var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))",
                  borderRadius: "17px",
                  boxShadow: "0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))",
                  opacity: 1
                } as React.CSSProperties}
              >
                <div className="framer-1l1ajhh" data-framer-name="Icon" style={{opacity: 1}}>
                  <svg
                    className="framer-NCvKy framer-qgvfsn"
                    role="presentation"
                    viewBox="0 0 24 24"
                    style={{
                      "--1m6trwb": "0",
                      "--21h8s6": "var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))",
                      "--pgex8v": "1.4",
                      opacity: 1
                    } as React.CSSProperties}
                  >
                    <use href="#3205468132"></use>
                  </svg>
                </div>
                <div
                  className="framer-1710qob"
                  data-framer-component-type="RichTextContainer"
                  style={{
                    outline: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    flexShrink: 0,
                    "--extracted-r6o4lv": "var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))",
                    "--framer-link-text-color": "rgb(0, 153, 255)",
                    "--framer-link-text-decoration": "underline",
                    transform: "none",
                    opacity: 1
                  } as React.CSSProperties}
                >
                  <p
                    className="framer-text framer-styles-preset-kmaoy8"
                    data-styles-preset="MV92va9oP"
                    style={{"--framer-text-color": "var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))"} as React.CSSProperties}
                  >
                    Productivity Features
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="framer-1j9fip8" data-framer-name="Heading Content">
            <div className="framer-1o9421h" data-framer-name="Container">
              <RichTextContainer className="framer-nifmjq">
                <h2 className="framer-text framer-styles-preset-199apa9" data-styles-preset="Ty6zNsrjE">
                  Made for how your team actually works.
                </h2>
              </RichTextContainer>
              <RichTextContainer className="framer-14xkuiq">
                <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx">
                  From fast-moving startups to structured enterprises, Taskos adapts to your team's real-world workflows — not the other way around.
                </p>
              </RichTextContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="framer-1unr5hv" data-framer-name="Bento Card">
        {CARDS_DATA.map((card, index) => (
          <BentoCard key={index} card={card} index={index} />
        ))}
      </div>
    </section>
  );
};

export default bento;
