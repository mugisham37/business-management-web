import React from 'react'
import { Button } from '@/components/reui/button'
import { Separator } from '@/components/reui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/reui/tooltip'
import { ButtonGroup } from '@/components/reui/button-group'

// Footer link component
const FooterLink = ({ href, text }: { href: string; text: string }) => (
  <div className="flex-none h-auto relative whitespace-pre w-auto">
    <Button 
      variant="link" 
      size="sm" 
      asChild
      className="h-auto p-0 font-['Switzer',sans-serif] font-normal text-sm tracking-[-0.01em] leading-[1.3] text-[rgb(214,214,214)] hover:text-white transition-colors"
    >
      <a href={href}>
        {text}
      </a>
    </Button>
  </div>
)

// Section header component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex-none h-auto relative whitespace-pre w-auto">
    <h6 className="m-0 font-['Switzer',sans-serif] font-semibold text-base tracking-normal leading-[1.3] text-white text-center">
      {title}
    </h6>
  </div>
)

// Social icon component
const SocialIcon = ({ 
  href, 
  name, 
  size,
  children 
}: { 
  href: string; 
  name: string;
  size: number;
  children: React.ReactNode 
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        asChild
        className="h-auto w-auto p-0 hover:bg-transparent hover:opacity-80 transition-opacity"
      >
        <a 
          href={href} 
          target="_blank" 
          rel="noopener"
          aria-label={name}
        >
          <div 
            className="flex-none relative"
            style={{ width: `${size}px`, height: `${size}px`, aspectRatio: '1 / 1' }}
          >
            <div className="flex max-w-full max-h-full items-center justify-center h-full w-full">
              {children}
            </div>
          </div>
        </a>
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-xs">{name}</p>
    </TooltipContent>
  </Tooltip>
)

const Footer = () => {
  const servicesLinks = [
    { href: './#bento', text: 'Features' },
    { href: './#benefits', text: 'Benefits' },
    { href: './#pricing', text: 'Pricing' },
    { href: './#faq', text: 'FAQ' }
  ]

  const companyLinks = [
    { href: './blog#hero', text: 'Blog' },
    { href: './changelog#hero', text: 'Changelog' },
    { href: './privacy-policy#hero', text: 'Privacy Policy' },
    { href: './terms-of-use#hero', text: 'Terms of Use' },
    { href: './contact#hero', text: 'Contact Us' }
  ]

  return (
    <TooltipProvider delayDuration={200}>
      <footer className="flex-none h-auto w-full relative">
        <div className="bg-black w-full">
        {/* Desktop: w-[1200px] px-[100px] py-[60px] pb-[50px], Tablet: w-[810px] px-10 py-[50px] pb-10, Mobile: w-[390px] px-5 py-[50px] */}
        <div className="flex flex-row flex-nowrap items-center justify-center gap-2.5 h-min overflow-hidden px-5 py-[50px] relative w-[390px] mx-auto sm:w-[390px] sm:px-5 sm:py-[50px] md:w-[810px] md:px-10 md:py-[50px] md:pb-10 lg:w-[1200px] lg:px-[100px] lg:py-[60px] lg:pb-[50px]">
          {/* Inner Container - Desktop: gap-[65px] max-w-[1100px], Tablet: gap-10 max-w-[810px], Mobile: gap-[34px] max-w-none */}
          <div className="flex flex-col items-start justify-center flex-1 gap-[34px] h-min overflow-hidden p-0 relative w-px md:gap-10 md:max-w-[810px] lg:gap-[65px] lg:max-w-[1100px]">
            {/* Logo Section - Desktop: flex-row justify-between, Mobile: flex-col gap-8 justify-center */}
            <div className="flex flex-col items-start justify-center flex-none gap-8 h-min overflow-visible p-0 relative w-full md:flex-row md:justify-between md:gap-0">
              {/* Logo Link */}
              <a 
                href="./#hero"
                className="flex items-center justify-start flex-none gap-2.5 h-min overflow-visible p-0 relative w-min no-underline"
              >
                <div className="flex items-center justify-center flex-none gap-[7px] h-min overflow-visible p-0 relative w-min">
                  {/* Logo SVG */}
                  <div 
                    className="flex-none h-8 relative w-8 shrink-0"
                    style={{ imageRendering: 'pixelated' }}
                    aria-hidden="true"
                  >
                    <div className="w-full h-full" style={{ aspectRatio: 'inherit' }}>
                      <svg className="w-full h-full">
                        <use href="#svg11630543270"></use>
                      </svg>
                    </div>
                  </div>
                  {/* Logo Text */}
                  <div className="flex-none h-auto relative whitespace-pre w-auto">
                    <p className="m-0 font-['Inter',sans-serif] font-extrabold text-base tracking-[-0.03em] leading-[1.3] text-white text-left">
                      ReadyLaunch
                    </p>
                  </div>
                </div>
              </a>
              
              {/* Links Container - Desktop: flex-row gap-[90px] flex-[0.7], Tablet: flex-row gap-[60px] flex-1, Mobile: flex-col gap-[60px] w-[70%] */}
              <div className="flex flex-col items-start justify-end flex-none gap-[60px] h-min overflow-visible p-0 relative w-[70%] md:flex-row md:flex-1 md:gap-[60px] lg:flex-[0.7] lg:gap-[90px]">
                {/* Services Section - Desktop/Tablet: gap-[11px], Mobile: gap-2.5 */}
                <div className="flex flex-col items-start justify-center flex-none gap-2.5 h-min overflow-visible p-0 relative w-min z-[2] md:gap-[11px]">
                  <SectionHeader title="Services" />
                  {servicesLinks.map((link, index) => (
                    <FooterLink key={index} {...link} />
                  ))}
                </div>

                {/* Company Section */}
                <div className="flex flex-col items-start justify-center flex-none gap-2.5 h-min overflow-visible p-0 relative w-min z-[2] md:gap-[11px]">
                  <SectionHeader title="Company" />
                  {companyLinks.map((link, index) => (
                    <FooterLink key={index} {...link} />
                  ))}
                </div>

                {/* Social Section */}
                <div className="flex flex-col items-start justify-center flex-none gap-[19px] h-min overflow-visible p-0 relative w-min">
                  <div className="flex flex-col items-start justify-center flex-none gap-[25px] h-min overflow-visible p-0 relative w-min z-[2] md:gap-[14px]">
                    {/* Social Icons - Desktop: gap-[19px], Tablet: gap-[15px], Mobile: gap-[25px] */}
                    <ButtonGroup 
                      orientation="horizontal" 
                      className="gap-[25px] pt-[2px] md:gap-[15px] lg:gap-[19px]"
                    >
                      <SocialIcon 
                        href="https://x.com/greeenyang" 
                        name="X (Twitter)"
                        size={16}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="100%"
                          height="100%"
                          fill="rgb(255, 255, 255)"
                          viewBox="0 0 16 16">
                          <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                        </svg>
                      </SocialIcon>
                      
                      <SocialIcon 
                        href="https://www.framer.com?via=green13" 
                        name="Instagram"
                        size={20}
                      >
                        <svg 
                          width="100%" 
                          height="100%" 
                          viewBox="0 0 24 24"
                          fill="rgb(255, 255, 255)"
                          xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.0281 2.00073C14.1535 2.00259 14.7238 2.00855 15.2166 2.02322L15.4107 2.02956C15.6349 2.03753 15.8561 2.04753 16.1228 2.06003C17.1869 2.1092 17.9128 2.27753 18.5503 2.52503C19.2094 2.7792 19.7661 3.12253 20.3219 3.67837C20.8769 4.2342 21.2203 4.79253 21.4753 5.45003C21.7219 6.0867 21.8903 6.81337 21.9403 7.87753C21.9522 8.1442 21.9618 8.3654 21.9697 8.58964L21.976 8.78373C21.9906 9.27647 21.9973 9.84686 21.9994 10.9723L22.0002 11.7179C22.0003 11.809 22.0003 11.903 22.0003 12L22.0002 12.2821L21.9996 13.0278C21.9977 14.1532 21.9918 14.7236 21.9771 15.2163L21.9707 15.4104C21.9628 15.6347 21.9528 15.8559 21.9403 16.1225C21.8911 17.1867 21.7219 17.9125 21.4753 18.55C21.2211 19.2092 20.8769 19.7659 20.3219 20.3217C19.7661 20.8767 19.2069 21.22 18.5503 21.475C17.9128 21.7217 17.1869 21.89 16.1228 21.94C15.8561 21.9519 15.6349 21.9616 15.4107 21.9694L15.2166 21.9757C14.7238 21.9904 14.1535 21.997 13.0281 21.9992L12.2824 22C12.1913 22 12.0973 22 12.0003 22L11.7182 22L10.9725 21.9993C9.8471 21.9975 9.27672 21.9915 8.78397 21.9768L8.58989 21.9705C8.36564 21.9625 8.14444 21.9525 7.87778 21.94C6.81361 21.8909 6.08861 21.7217 5.45028 21.475C4.79194 21.2209 4.23444 20.8767 3.67861 20.3217C3.12278 19.7659 2.78028 19.2067 2.52528 18.55C2.27778 17.9125 2.11028 17.1867 2.06028 16.1225C2.0484 15.8559 2.03871 15.6347 2.03086 15.4104L2.02457 15.2163C2.00994 14.7236 2.00327 14.1532 2.00111 13.0278L2.00098 10.9723C2.00284 9.84686 2.00879 9.27647 2.02346 8.78373L2.02981 8.58964C2.03778 8.3654 2.04778 8.1442 2.06028 7.87753C2.10944 6.81253 2.27778 6.08753 2.52528 5.45003C2.77944 4.7917 3.12278 4.2342 3.67861 3.67837C4.23444 3.12253 4.79278 2.78003 5.45028 2.52503C6.08778 2.27753 6.81278 2.11003 7.87778 2.06003C8.14444 2.04816 8.36564 2.03847 8.58989 2.03062L8.78397 2.02433C9.27672 2.00969 9.8471 2.00302 10.9725 2.00086L13.0281 2.00073ZM12.0003 7.00003C9.23738 7.00003 7.00028 9.23956 7.00028 12C7.00028 14.7629 9.23981 17 12.0003 17C14.7632 17 17.0003 14.7605 17.0003 12C17.0003 9.23713 14.7607 7.00003 12.0003 7.00003ZM12.0003 9.00003C13.6572 9.00003 15.0003 10.3427 15.0003 12C15.0003 13.6569 13.6576 15 12.0003 15C10.3434 15 9.00028 13.6574 9.00028 12C9.00028 10.3431 10.3429 9.00003 12.0003 9.00003ZM17.2503 5.50003C16.561 5.50003 16.0003 6.05994 16.0003 6.74918C16.0003 7.43843 16.5602 7.9992 17.2503 7.9992C17.9395 7.9992 18.5003 7.4393 18.5003 6.74918C18.5003 6.05994 17.9386 5.49917 17.2503 5.50003Z" />
                        </svg>
                      </SocialIcon>
                      
                      <SocialIcon 
                        href="https://www.framer.com?via=green13" 
                        name="YouTube"
                        size={21}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="100%"
                          height="100%"
                          fill="rgb(255, 255, 255)"
                          viewBox="0 0 16 16">
                          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
                        </svg>
                      </SocialIcon>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Copyright Section */}
            <div className="flex flex-col items-start justify-start flex-none gap-[7px] h-min overflow-visible p-0 relative w-full">
              {/* Divider Line */}
              <Separator className="opacity-70 bg-[rgb(145,145,145)]" />
              {/* Copyright Text */}
              <div className="flex-none h-auto relative w-auto">
                <div className="font-['Inter',sans-serif] text-xs text-[rgb(145,145,145)] font-normal tracking-[-0.01em] leading-[1.3em]">
                  2026 Copyright © ReadyLaunch. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </TooltipProvider>
  )
}

export default Footer
