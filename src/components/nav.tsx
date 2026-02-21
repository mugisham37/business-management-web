import React from 'react'

// Menu items configuration
const menuItems = [
    { href: './#bento', label: 'Features' },
    { href: './blog#hero', label: 'Blog' },
    { href: './changelog#hero', label: 'Changelog' },
    { href: './privacy-policy#hero', label: 'Privacy Policy' },
    { href: './terms-of-use#hero', label: 'Terms of Use' },
    { href: './contact#hero', label: 'Contact Us' }
]

// Logo component (reusable)
const Logo = () => (
    <a 
        className="flex flex-none flex-row flex-nowrap gap-2.5 h-min items-center content-center justify-start overflow-visible p-0 relative no-underline w-min opacity-100" 
        href="./#hero"
    >
        <div className="flex flex-none flex-row flex-nowrap gap-[7px] h-min items-center content-center justify-center overflow-visible p-0 relative w-min opacity-100">
            <div
                className="flex-none h-8 relative w-8 shrink-0 opacity-100"
                aria-hidden="true"
                style={{ imageRendering: 'pixelated' }}
            >
                <div className="w-full h-full" style={{ aspectRatio: 'inherit' }}>
                    <svg className="w-full h-full">
                        <use href="#svg9326151606"></use>
                    </svg>
                </div>
            </div>
            <div className="flex-none h-auto relative whitespace-pre w-auto flex flex-col justify-start shrink-0 opacity-100">
                <p 
                    className="font-['Inter'] text-base font-extrabold text-[#262626] text-left"
                    style={{ 
                        letterSpacing: '-0.03em', 
                        lineHeight: '1.3em',
                        textTransform: 'none',
                        textDecoration: 'none',
                        margin: 0
                    }}
                >
                    ReadyLaunch
                </p>
            </div>
        </div>
    </a>
)

// Hamburger menu icon
const HamburgerIcon = () => (
    <div 
        className="flex flex-none flex-col flex-nowrap gap-1.5 h-[34px] items-center content-center justify-start overflow-visible pt-2 px-0.5 pb-0.5 relative w-[34px] aspect-square cursor-pointer opacity-100" 
        tabIndex={0}
    >
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
    </div>
)

// Menu item component
const MenuItem = ({ href, label }: { href: string; label: string }) => (
    <div className="flex-none h-auto relative whitespace-pre w-auto flex flex-col justify-start shrink-0 opacity-100">
        <p 
            className="font-['Switzer'] text-sm font-medium text-[#53535c] text-center"
            style={{
                letterSpacing: '0em',
                lineHeight: '1.3em',
                textTransform: 'none',
                textDecoration: 'none',
                margin: 0
            }}
        >
            <a 
                className="text-[#262626] hover:text-[#38383d] no-underline transition-colors" 
                href={href}
            >
                {label}
            </a>
        </p>
    </div>
)

const Nav = () => {
    return (
        <>
            {/* Mobile Navigation */}
            <div className="flex-none h-auto md:hidden">
                <div className="contents">
                    <nav
                        className="flex flex-row flex-nowrap gap-5 h-min items-center content-center justify-center overflow-visible py-[18px] px-5 relative w-[390px] w-full opacity-100"
                        style={{
                            backdropFilter: 'none',
                            background: 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgba(0, 0, 0, 0) 100%)',
                            willChange: 'auto'
                        }}
                    >
                        <div className="flex flex-1 flex-row flex-nowrap h-min items-center content-center justify-between overflow-visible p-0 relative w-px z-[1] opacity-100">
                            <div className="flex flex-none flex-row flex-nowrap gap-2.5 h-min items-center content-center justify-between overflow-visible p-0 relative w-full opacity-100">
                                <Logo />
                                <HamburgerIcon />
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Desktop Navigation */}
            <div className="flex-none h-auto hidden md:block">
                <div className="contents">
                    <nav
                        className="flex flex-row flex-nowrap gap-5 h-[70px] items-center content-center justify-center overflow-visible px-10 relative w-[1200px] w-full opacity-100"
                        style={{
                            backdropFilter: 'none',
                            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgb(255, 255, 255) 100%)'
                        }}
                    >
                        <div className="flex flex-1 flex-row flex-nowrap h-min items-center content-center justify-between max-w-[1100px] overflow-visible p-0 relative w-px z-[1] opacity-100">
                            <div className="flex flex-none flex-row flex-nowrap gap-2.5 h-min items-center content-center justify-start overflow-visible p-0 relative w-min opacity-100">
                                <Logo />
                            </div>

                            <div className="flex flex-none flex-row flex-nowrap gap-[25px] h-min items-center content-center justify-center overflow-visible p-0 relative w-min opacity-100">
                                <div className="flex flex-none flex-row flex-nowrap gap-[25px] h-min items-center content-center justify-center overflow-visible p-0 relative w-min opacity-100">
                                    {menuItems.map((item) => (
                                        <MenuItem key={item.href} {...item} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex-none h-auto relative w-auto opacity-100">
                                <a
                                    className="flex flex-row flex-nowrap gap-2.5 h-min items-center content-center justify-center overflow-hidden py-2 px-[18px] relative no-underline w-min cursor-pointer bg-[#262626] rounded-[20px] opacity-100 border-0 shadow-none will-change-transform"
                                    href="https://www.framer.com?via=green13"
                                    target="_blank"
                                    rel="noopener"
                                    tabIndex={0}
                                >
                                    <div className="flex flex-none flex-row flex-nowrap gap-2 h-6 items-center content-center justify-start overflow-visible p-0 relative w-min opacity-100">
                                        <div className="flex flex-none flex-col flex-nowrap gap-2.5 h-min items-center content-center justify-center overflow-visible p-0 relative w-min opacity-100">
                                            <div className="flex-none h-auto relative whitespace-pre w-auto z-[1] flex flex-col justify-start shrink-0 opacity-100">
                                                <p
                                                    className="font-['Switzer'] text-sm font-normal text-white text-center"
                                                    style={{
                                                        letterSpacing: '-0.01em',
                                                        lineHeight: '1.3em',
                                                        textTransform: 'none',
                                                        textDecoration: 'none',
                                                        margin: 0
                                                    }}
                                                >
                                                    Get Started
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Nav
