import React from 'react'
import { Card, CardContent } from '@/components/reui/card'
import { Button } from '@/components/reui/button'
import { AspectRatio } from '@/components/reui/aspect-ratio'

const Cta = () => {
    const imageConfig = {
        url: 'https://framerusercontent.com/images/lRd1pQS0NmPLbdlITbdktCLKxk0.png',
        width: 2277,
        height: 1512,
        sizes: '320px',
        alt: ''
    }

    return (
        <div className="flex items-center justify-center w-full">
            <div className="flex-none h-auto w-auto">
                <section
                    className="flex flex-row items-start justify-center py-20 px-5 w-full max-w-[390px] sm:max-w-[810px] lg:max-w-[1200px] sm:py-[50px] sm:px-10 lg:py-[100px] lg:px-[100px] lg:pb-[150px] gap-[63px] sm:gap-[42px]"
                    style={{ opacity: 1 }}
                >
                    <div
                        className="flex flex-col items-center justify-center gap-10 max-w-[580px] sm:max-w-[850px] lg:max-w-[1100px] flex-1 min-w-0"
                        style={{ willChange: 'transform', opacity: 0, transform: 'translateY(50px)' }}
                    >
                        <div className="flex flex-col items-center justify-center gap-2.5 min-h-min overflow-hidden p-0 relative w-full z-[1]">
                            <Card
                                className="flex flex-col sm:flex-row items-center justify-center gap-[15px] sm:gap-0 p-0 sm:pt-2.5 sm:pr-0 sm:pb-0 sm:pl-[45px] lg:pt-2.5 lg:pr-0 lg:pb-0 lg:pl-[50px] lg:gap-[18px] bg-[rgb(248,249,250)] rounded-xl min-h-min overflow-hidden relative w-full z-[1]"
                                style={{ opacity: 1 }}
                            >
                                <CardContent
                                    className="flex flex-col items-center sm:items-start lg:items-start justify-start gap-[18px] sm:gap-[22px] lg:gap-[25px] pt-[45px] px-5 pb-0 sm:p-0 lg:p-0 w-full sm:flex-1 sm:min-w-0 min-h-min overflow-hidden relative"
                                    style={{ opacity: 1 }}
                                >
                                    <div
                                        className="flex flex-col items-center sm:items-start lg:items-start justify-center gap-2.5 sm:gap-[5px] lg:gap-2.5 max-w-[520px] sm:max-w-none lg:max-w-none min-h-min overflow-hidden p-0 relative w-full"
                                        style={{ opacity: 1 }}
                                    >
                                        <div className="flex-none h-auto relative whitespace-pre-wrap break-words w-full sm:w-full lg:w-[90%]">
                                            <h3
                                                className="m-0 text-center sm:text-left lg:text-left"
                                                style={{
                                                    fontFamily: '"Switzer", sans-serif',
                                                    fontSize: '28px',
                                                    fontWeight: 600,
                                                    lineHeight: '1.2em',
                                                    letterSpacing: '0em',
                                                    color: 'rgb(38, 38, 38)',
                                                    textTransform: 'none',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Ready to simplify your team&apos;s workflow?
                                            </h3>
                                        </div>
                                        <div className="flex-none h-auto max-w-[400px] sm:max-w-[450px] lg:max-w-[450px] relative whitespace-pre-wrap break-words w-full">
                                            <p
                                                className="m-0 text-center sm:text-left lg:text-left opacity-90"
                                                style={{
                                                    fontFamily: '"Switzer", sans-serif',
                                                    fontSize: '16px',
                                                    fontWeight: 400,
                                                    lineHeight: '1.4em',
                                                    letterSpacing: '0em',
                                                    color: 'rgb(56, 56, 61)',
                                                    textTransform: 'none',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                Book a demo to see how Taskos helps teams move faster and work smarter.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-none h-auto relative w-auto" style={{ opacity: 1 }}>
                                        <Button
                                            asChild
                                            className="py-2 px-[18px] bg-[rgb(38,38,38)] rounded-[20px] shadow-none"
                                            style={{
                                                opacity: 1,
                                                willChange: 'transform'
                                            }}
                                        >
                                            <a
                                                href="https://www.framer.com?via=green13"
                                                target="_blank"
                                                rel="noopener"
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: '"Switzer", sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                        lineHeight: '1.3em',
                                                        letterSpacing: '-0.01em'
                                                    }}
                                                >
                                                    Book a Demo
                                                </span>
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                                <div
                                    className="flex flex-row items-center justify-center gap-2.5 h-[234px] sm:h-[282px] lg:h-[290px] min-h-min overflow-visible p-0 relative w-full sm:flex-1 sm:min-w-0 lg:flex-1 lg:min-w-0 rounded-[10px]"
                                    style={{ opacity: 1 }}
                                >
                                    <div
                                        className="flex-none h-[212px] sm:h-[276px] lg:h-[374px] overflow-visible relative w-[320px] sm:w-[415px] lg:w-[563px] z-[1]"
                                        style={{
                                            position: 'absolute',
                                            left: 'calc(50% - 320px / 2)',
                                            top: 'calc(49.19% - 212px / 2)'
                                        }}
                                    >
                                        <AspectRatio ratio={imageConfig.width / imageConfig.height}>
                                            <img
                                                decoding="async"
                                                loading="lazy"
                                                width={imageConfig.width}
                                                height={imageConfig.height}
                                                sizes={imageConfig.sizes}
                                                srcSet={`${imageConfig.url}?scale-down-to=512 512w,${imageConfig.url}?scale-down-to=1024 1024w,${imageConfig.url}?scale-down-to=2048 2048w,${imageConfig.url} ${imageConfig.width}w`}
                                                src={`${imageConfig.url}?scale-down-to=2048`}
                                                alt={imageConfig.alt}
                                                className="block w-full h-full object-cover object-center rounded-[inherit]"
                                            />
                                        </AspectRatio>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Cta