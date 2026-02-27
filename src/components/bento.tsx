import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/reui/card'
import { Badge } from '@/components/reui/badge'
import { AspectRatio } from '@/components/reui/aspect-ratio'
import { cn } from '@/lib/utils'

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
  gridArea: string;
  heading: string;
  supportingText: string;
  visualStyle?: React.CSSProperties;
  imageData?: {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    sizes: string;
  };
  hasPattern?: boolean;
  patternUrl?: string;
  patternSize?: string;
  additionalVisuals?: Array<{
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
    gridArea: "1 / 1 / 5 / 2",
    heading: "Stay organized, effortlessly.",
    supportingText: "Easily track tasks, assignees, and statuses in one place.",
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
    gridArea: "1 / 2 / 3 / 4",
    heading: "Built for fast-moving teams.",
    supportingText: "Collaborate in real time with live edits and comments.",
    visualStyle: { willChange: "transform", opacity: 0, transform: "translate(-50%, -50%) translateY(50px)" },
    imageData: {
      src: "https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=1024",
      srcSet: "https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=512 512w,https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/u9vXDNZXsIIYCyXyKzDOhTNI.png 1703w",
      width: 1703,
      height: 1063,
      sizes: "277px"
    },
    hasPattern: true,
    patternUrl: "https://framerusercontent.com/images/wGAHOWhVswEtWkOKTJN6s2CW0.svg",
    patternSize: "31.5px"
  },
  {
    gridArea: "3 / 2 / 5 / 4",
    heading: "Precision-Driven Portfolio Growth",
    supportingText: "View tasks as lists, boards, calendars, or timelines.",
    visualStyle: { willChange: "transform", opacity: 0, transform: "translateY(50px)" },
    additionalVisuals: [
      {
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
    gridArea: "1 / 4 / 5 / 5",
    heading: "Precision-Driven Portfolio Growth",
    supportingText: "Let AI suggest assignments, priorities, and deadlines.",
    visualStyle: { willChange: "transform", opacity: 1, transform: "none" },
    imageData: {
      src: "https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=4096",
      srcSet: "https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=512 512w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=2048 2048w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png?scale-down-to=4096 4096w,https://framerusercontent.com/images/q8nMo4EzNGxlO2SEKr1MiO2u9G0.png 4230w",
      width: 4230,
      height: 1259,
      sizes: "612px"
    },
    hasPattern: true,
    patternUrl: "https://framerusercontent.com/images/9c47fOR3CNoSsEtr6IEYJoKM.svg",
    patternSize: "64.5px auto"
  }
];

const CardImage: React.FC<{ imageData: CardData['imageData'] }> = ({ imageData }) => {
  const aspectRatio = imageData!.width / imageData!.height;
  
  return (
    <div style={COMMON_IMAGE_WRAPPER_STYLE}>
      <AspectRatio ratio={aspectRatio} className="w-full h-full">
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
      </AspectRatio>
    </div>
  );
};

const BentoCard: React.FC<{ card: CardData }> = ({ card }) => (
  <Card 
    className={cn(
      "flex flex-col items-center justify-center gap-2.5 p-6 bg-[#f8f9fa] border-[#e5e5e8] rounded-[10px] overflow-hidden",
      "relative"
    )}
    style={{ gridArea: card.gridArea }}
  >
    {/* Container */}
    <div className="flex flex-col items-start justify-start gap-5 w-full h-full relative">
      {/* Heading & Supporting Text */}
      <CardHeader className="flex flex-col items-start justify-start gap-2.5 w-full p-0">
        {/* Heading */}
        <CardTitle className="font-['Switzer'] text-[20px] md:text-[18px] font-semibold leading-[1.2em] text-[#262626] text-left m-0">
          {card.heading}
        </CardTitle>
        {/* Supporting Text */}
        <CardDescription className="font-['Switzer'] text-base font-normal leading-[1.4em] text-[#53535c] text-left m-0">
          {card.supportingText}
        </CardDescription>
      </CardHeader>
      
      {/* Visual Container */}
      <CardContent className="flex-1 w-full relative overflow-hidden p-0">
        {card.additionalVisuals ? (
          <div className="absolute inset-0" style={card.visualStyle}>
            {card.additionalVisuals.map((visual, idx) => (
              <div 
                key={idx} 
                className="absolute left-1/2 top-1/2 w-full h-full"
                style={visual.style}
              >
                <CardImage imageData={visual.imageData} />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0" style={card.visualStyle}>
            {card.imageData && <CardImage imageData={card.imageData} />}
          </div>
        )}
      </CardContent>
    </div>
    
    {/* Pattern */}
    {card.hasPattern && (
      <div className="absolute inset-0 pointer-events-none">
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
        />
      </div>
    )}
  </Card>
);

const bento = () => {
  return (
    <section className="flex flex-col items-center justify-start gap-[63px] overflow-hidden py-[150px] px-[100px] md:py-[100px] md:px-[50px] sm:py-[80px] sm:px-[25px] w-full" id="bento">
      {/* Heading & Supporting Text */}
      <div className="flex flex-col items-center justify-center gap-[111px] md:gap-[80px] sm:gap-[60px] w-full">
        <div className="flex flex-col items-center justify-center gap-[25px] w-full">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2.5 min-h-[28px] min-w-[115px] overflow-hidden">
            <Badge 
              variant="outline" 
              size="default"
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-1.5 bg-[#fafafa] border-[#e5e5e8] rounded-[17px]"
              )}
              style={{
                boxShadow: "0px 2px 5px 0px #f0f1f2"
              }}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  role="presentation"
                  viewBox="0 0 24 24"
                  style={{ color: "#38383d" }}
                >
                  <use href="#3205468132"></use>
                </svg>
              </div>
              <span className="font-['Switzer'] text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-[#262626] text-center">
                Productivity Features
              </span>
            </Badge>
          </div>
          
          {/* Heading Content */}
          <div className="flex flex-col items-center justify-center gap-[15px] w-full">
            <div className="flex flex-col items-center justify-center gap-[15px] w-full">
              <h2 className="font-['Switzer'] text-[50px] lg:text-[38px] sm:text-[28px] font-semibold leading-none tracking-[-0.02em] text-black text-center m-0 max-w-[650px]">
                Made for how your team actually works.
              </h2>
              <p className="font-['Switzer'] text-base font-normal leading-[1.4em] text-[#53535c] text-center m-0 max-w-[650px]">
                From fast-moving startups to structured enterprises, Taskos adapts to your team's real-world workflows — not the other way around.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bento Grid */}
      <div 
        className="grid gap-2.5 w-full max-w-[1100px] overflow-hidden"
        style={{
          gridTemplateColumns: "repeat(4, minmax(50px, 1fr))",
          gridTemplateRows: "repeat(4, minmax(0, 1fr))",
          height: "611px"
        }}
      >
        {CARDS_DATA.map((card, index) => (
          <BentoCard key={index} card={card} />
        ))}
      </div>
    </section>
  );
};

export default bento;
