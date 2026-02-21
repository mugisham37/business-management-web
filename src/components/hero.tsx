import React from 'react'
import { Badge } from '@/components/reui/badge'
import { Button } from '@/components/reui/button'
import { ButtonGroup } from '@/components/reui/button-group'
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '@/components/reui/avatar'
import { AspectRatio } from '@/components/reui/aspect-ratio'

// Font configuration - Add Switzer font
const fontStyles = `
  @font-face {
    font-family: 'Switzer';
    src: url(https://framerusercontent.com/third-party-assets/fontshare/wf/BLNB4FAQFNK56DWWNF7PMGTCOTZHOEII/ST3WKSSDMBK2MIQQO3MAVYWLF4FTOLFV/6IN5WOLRCYP4G4MOCOHOMXNON6Q7MDAR.woff2);
    font-display: swap;
    font-style: normal;
    font-weight: 400;
  }
  @font-face {
    font-family: 'Switzer';
    src: url(https://framerusercontent.com/third-party-assets/fontshare/wf/OYB4CXKJQXKTNSLJMTDQOIVUL2V5EL7S/WYO2P7DQVV5RNXGMCUO2HL4RJP4VFUAS/6XPIMU23OJVRY676OG5YVJMWEHWICATX.woff2);
    font-display: swap;
    font-style: normal;
    font-weight: 500;
  }
  @font-face {
    font-family: 'Switzer';
    src: url(https://framerusercontent.com/third-party-assets/fontshare/wf/5SZVFDB7V52TI6ULVC6J3WQZQCIZVDV5/ODYPSTCUDMKSTYIPTV4CLQ7URIK7XYBJ/YS3VPNVO4B3TOJMEXDGFZQ4TLZGGSRZC.woff2);
    font-display: swap;
    font-style: normal;
    font-weight: 600;
  }
  @font-face {
    font-family: 'Switzer';
    src: url(https://framerusercontent.com/third-party-assets/fontshare/wf/HBNTRIISA5MEXGL5WPYI7CV2HIWTDV3Q/YDPDINVT673XLXNSTMLG4JNCZZMVVNPN/Y7SCNZJOT2MW5ADSGOFLDGH4TNL4JCQY.woff2);
    font-display: swap;
    font-style: normal;
    font-weight: 700;
  }
  @font-face {
    font-family: 'Switzer';
    src: url(https://framerusercontent.com/third-party-assets/fontshare/wf/A54N3N7J5AY6YOPYJKLHF5VH7G7HSSUN/ERWIWIB434FMFHQFSSBD233EP3C62HOI/TOHQHMLIEIPKVF2JPM6SVKXFYGO5G2TJ.woff2);
    font-display: block;
    font-style: normal;
    font-weight: 900;
  }
`

// Avatar data configuration
const AVATAR_DATA = [
  {
    width: 800,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png?scale-down-to=1024 682w,https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png 800w",
    src: "https://framerusercontent.com/images/8wRQDTwiBme4MkhgYNtrPBgjEg.png"
  },
  {
    width: 840,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png?scale-down-to=1024 716w,https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png 840w",
    src: "https://framerusercontent.com/images/QJMEu1GvwxokTlkbQ1oeAad8AR0.png"
  },
  {
    width: 1200,
    height: 799,
    srcSet: "https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png?scale-down-to=512 512w,https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png 1200w",
    src: "https://framerusercontent.com/images/K0Q8Zo65cAEGLpM46ruLjgnUNs.png"
  },
  {
    width: 904,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png?scale-down-to=1024 771w,https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png 904w",
    src: "https://framerusercontent.com/images/0g2BAxpvasUh7eDWCbWaHzI5M.png"
  },
  {
    width: 900,
    height: 1200,
    srcSet: "https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png?scale-down-to=1024 768w,https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png 900w",
    src: "https://framerusercontent.com/images/dszBO0TTCQR4Shc9dBPSLaJe4.png"
  }
]

// Reusable Avatar component using reui
const HeroAvatar: React.FC<{ data: typeof AVATAR_DATA[0]; index: number }> = ({ data, index }) => (
  <Avatar size="default" className="w-7 h-7">
    <AvatarImage
      src={data.src}
      srcSet={data.srcSet}
      width={data.width}
      height={data.height}
      sizes="28px"
      alt=""
      className="object-cover object-center"
    />
    <AvatarFallback>U</AvatarFallback>
  </Avatar>
)

// Reusable Button component using reui
interface ButtonProps {
  variant: 'primary' | 'secondary'
  text: string
  showArrow?: boolean
}

const HeroButton: React.FC<ButtonProps> = ({ variant, text, showArrow = false }) => {
  const isPrimary = variant === 'primary'
  
  return (
    <Button
      asChild
      variant={isPrimary ? 'default' : 'outline'}
      size="default"
      className={`
        rounded-[27px] px-[18px] py-2 h-auto
        text-sm font-normal tracking-[-0.01em] leading-[1.3em]
        gap-2
        ${isPrimary 
          ? 'bg-[#262626] text-white hover:bg-[#262626]/90' 
          : 'bg-white text-[#262626] border-[#E5E5E8] shadow-[0px_5px_10px_0px_#F8F9FA] hover:bg-gray-50'
        }
      `}
      style={{ fontFamily: 'Switzer, sans-serif' }}
    >
      <a
        href="https://www.framer.com?via=green13"
        target="_blank"
        rel="noopener"
      >
        <span>{text}</span>
        {showArrow && (
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center" style={{ mask: 'radial-gradient(50% 50%, rgb(0, 0, 0) 97.7319%, rgba(0, 0, 0, 0) 100%)' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="w-full h-full"
              style={{ fill: '#262626' }}
            >
              <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
            </svg>
          </div>
        )}
      </a>
    </Button>
  )
}

const hero = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      <section className="py-16 px-4 md:px-8 lg:px-16" id="hero">
        <div className="max-w-7xl mx-auto">
          {/* Heading & Supporting Text */}
          <div className="flex flex-col items-center gap-8 mb-12">
            {/* Heading Container */}
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Badge using reui */}
              <Badge 
                variant="outline"
                size="default"
                className="inline-flex items-center gap-2 px-4 py-2 h-auto bg-[#FAFAFA] border-[#E5E5E8] rounded-[17px] shadow-[0px_2px_5px_0px_#F0F1F2]"
                style={{ fontFamily: 'Switzer, sans-serif' }}
              >
                <div className="w-5 h-5">
                  <svg
                    role="presentation"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                    style={{ fill: '#38383D' }}
                  >
                    <use href="#1529132500"></use>
                  </svg>
                </div>
                <span className="text-sm text-[#262626] font-normal tracking-[-0.01em] leading-[1.3em]">
                  AI Project Tool
                </span>
              </Badge>

              {/* Heading Content */}
              <div className="flex flex-col items-center gap-4 max-w-4xl">
                <h1 
                  className="text-[34px] md:text-[56px] lg:text-[60px] font-semibold leading-[1em] tracking-[-0.02em] text-center text-black m-0"
                  style={{ fontFamily: 'Switzer, sans-serif' }}
                >
                  Launch your SaaS tool, smarter and faster
                </h1>
                <p 
                  className="text-base text-[#38383D] font-normal leading-[1.4em] text-center max-w-2xl m-0"
                  style={{ fontFamily: 'Switzer, sans-serif' }}
                >
                  Build a stunning SaaS landing page that communicates your value, captures leads, and converts—without writing a single line of code.
                </p>
              </div>

              {/* Buttons using reui ButtonGroup */}
              <ButtonGroup orientation="horizontal" className="flex-wrap justify-center gap-3 mt-4">
                <HeroButton
                  variant="primary"
                  text="Start Free Trial"
                  showArrow={true}
                />
                <HeroButton
                  variant="secondary"
                  text="Join Waitlist"
                />
              </ButtonGroup>
            </div>

            {/* Social Trust using reui AvatarGroup */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <AvatarGroup className="*:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
                {AVATAR_DATA.map((avatar, index) => (
                  <HeroAvatar key={index} data={avatar} index={index} />
                ))}
              </AvatarGroup>
              <p 
                className="text-sm text-[#38383D] font-normal leading-[1.3em] m-0"
                style={{ fontFamily: 'Switzer, sans-serif' }}
              >
                Trusted already by 1.2k+
              </p>
            </div>
          </div>

          {/* Visual Container using reui AspectRatio */}
          <div className="relative w-full max-w-5xl mx-auto mt-12">
            <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden bg-white">
              <video
                src="https://framerusercontent.com/assets/jl25p5MbzRr21hTaVDiw9zoPxEk.mp4"
                loop={true}
                preload="auto"
                poster="https://framerusercontent.com/images/bNkwYVRtMaXt2uYdJ6wlbJVlIk.png"
                muted={true}
                playsInline={true}
                autoPlay={true}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      </section>
    </>
  )
}

export default hero