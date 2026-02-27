'use client'

import React from 'react'
import { Button } from '@/components/reui/button'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/reui/navigation-menu'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/reui/drawer'

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
    <>
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
        <div className="flex-none h-0.5 overflow-hidden relative w-full will-change-transform bg-[#262626] rounded-[2px] opacity-100"></div>
    </>
)

// Menu item component for desktop
const MenuItem = ({ href, label }: { href: string; label: string }) => (
    <NavigationMenuItem>
        <NavigationMenuLink 
            href={href}
            className="flex-none h-auto relative whitespace-pre w-auto flex flex-col justify-start shrink-0 opacity-100"
        >
            <span 
                className="font-['Switzer'] text-sm font-medium text-[#262626] hover:text-[#38383d] text-center transition-colors"
                style={{
                    letterSpacing: '0em',
                    lineHeight: '1.3em',
                    textTransform: 'none',
                    textDecoration: 'none',
                    margin: 0
                }}
            >
                {label}
            </span>
        </NavigationMenuLink>
    </NavigationMenuItem>
)

// Menu item component for mobile drawer
const MobileMenuItem = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => (
    <a 
        href={href}
        onClick={onClick}
        className="flex-none h-auto relative whitespace-pre w-auto flex flex-col justify-start shrink-0 opacity-100 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
        <span 
            className="font-['Switzer'] text-base font-medium text-[#262626] hover:text-[#38383d]"
            style={{
                letterSpacing: '0em',
                lineHeight: '1.3em',
                textTransform: 'none',
                textDecoration: 'none',
                margin: 0
            }}
        >
            {label}
        </span>
    </a>
)

const Nav = () => {
    const [open, setOpen] = React.useState(false)

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
                                <Drawer open={open} onOpenChange={setOpen}>
                                    <DrawerTrigger asChild>
                                        <button 
                                            className="flex flex-none flex-col flex-nowrap gap-1.5 h-[34px] items-center content-center justify-start overflow-visible pt-2 px-0.5 pb-0.5 relative w-[34px] aspect-square cursor-pointer opacity-100 bg-transparent border-0 outline-none"
                                            aria-label="Open menu"
                                        >
                                            <HamburgerIcon />
                                        </button>
                                    </DrawerTrigger>
                                    <DrawerContent className="max-h-[85vh]">
                                        <DrawerHeader className="text-left">
                                            <DrawerTitle className="font-['Inter'] text-xl font-extrabold text-[#262626]">
                                                Menu
                                            </DrawerTitle>
                                        </DrawerHeader>
                                        <nav className="flex flex-col gap-1 px-4 py-2 overflow-y-auto">
                                            {menuItems.map((item) => (
                                                <MobileMenuItem 
                                                    key={item.href} 
                                                    {...item} 
                                                    onClick={() => setOpen(false)}
                                                />
                                            ))}
                                        </nav>
                                        <DrawerFooter className="pt-4">
                                            <Button 
                                                asChild 
                                                className="w-full bg-[#262626] hover:bg-[#38383d] text-white rounded-[20px] h-10 font-['Switzer'] text-sm font-normal"
                                                style={{ letterSpacing: '-0.01em' }}
                                            >
                                                <a
                                                    href="https://www.framer.com?via=green13"
                                                    target="_blank"
                                                    rel="noopener"
                                                >
                                                    Get Started
                                                </a>
                                            </Button>
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>
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
                                <NavigationMenu viewport={false} className="relative">
                                    <NavigationMenuList className="flex flex-none flex-row flex-nowrap gap-[25px] h-min items-center content-center justify-center overflow-visible p-0 relative w-min opacity-100">
                                        {menuItems.map((item) => (
                                            <MenuItem key={item.href} {...item} />
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            </div>

                            <div className="flex-none h-auto relative w-auto opacity-100">
                                <Button 
                                    asChild 
                                    className="flex flex-row flex-nowrap gap-2.5 h-min items-center content-center justify-center overflow-hidden py-2 px-[18px] relative no-underline w-min cursor-pointer bg-[#262626] hover:bg-[#38383d] rounded-[20px] opacity-100 border-0 shadow-none will-change-transform transition-colors"
                                >
                                    <a
                                        href="https://www.framer.com?via=green13"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        <span
                                            className="font-['Switzer'] text-sm font-normal text-white text-center"
                                            style={{
                                                letterSpacing: '-0.01em',
                                                lineHeight: '1.3em',
                                                textTransform: 'none',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            Get Started
                                        </span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default Nav
