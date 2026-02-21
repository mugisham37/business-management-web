import React from 'react'

const Cta = () => {
    const richTextContainerStyle = {
        outline: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'flex-start',
        flexShrink: 0,
        transform: 'none'
    }

    const buttonBorderStyle = {
        '--border-bottom-width': '0px',
        '--border-color': 'rgba(0, 0, 0, 0)',
        '--border-left-width': '0px',
        '--border-right-width': '0px',
        '--border-style': 'solid',
        '--border-top-width': '0px'
    } as React.CSSProperties

    const imageConfig = {
        url: 'https://framerusercontent.com/images/lRd1pQS0NmPLbdlITbdktCLKxk0.png',
        width: 2277,
        height: 1512,
        sizes: '320px',
        alt: ''
    }

    return (
        <div className="framer-ckn2al" data-framer-name="CTA Section">
            <div className="framer-lfqpij-container">
                <div className="ssr-variant hidden-x4vgtb hidden-c3pthz">
                    <section
                        className="framer-LanID framer-DZNJn framer-ae7Kc framer-1wsq02t framer-v-4yxg1b"
                        data-framer-name="Phone"
                        style={{ width: '100%', opacity: 1 }}
                    >
                        <div
                            className="framer-18lqsyv"
                            data-framer-name="CTA"
                            style={{ willChange: 'transform', opacity: 0, transform: 'translateY(50px)' }}
                        >
                            <div className="framer-q3918f" data-framer-name="Container" style={{ opacity: 1 }}>
                                <div
                                    className="framer-vberre"
                                    data-framer-name="Content"
                                    style={{
                                        backgroundColor: 'var(--token-0c21c7c4-decf-4cb8-98b2-1f4ecf98c018, rgb(248, 249, 250))',
                                        borderRadius: '12px',
                                        opacity: 1
                                    }}
                                >
                                    <div className="framer-1mzj3z0" data-framer-name="Heading &amp; Button" style={{ opacity: 1 }}>
                                        <div className="framer-15fa1ts" data-framer-name="Heading &amp; Supporting Text" style={{ opacity: 1 }}>
                                            <div
                                                className="framer-1771gfq"
                                                data-framer-component-type="RichTextContainer"
                                                style={{
                                                    ...richTextContainerStyle,
                                                    '--framer-paragraph-spacing': '0px',
                                                    opacity: 1
                                                } as React.CSSProperties}
                                            >
                                                <h3
                                                    className="framer-text framer-styles-preset-5b0viy"
                                                    data-styles-preset="w_1gSUoSw"
                                                    style={{ '--framer-text-alignment': 'center' } as React.CSSProperties}
                                                >
                                                    Ready to simplify your team&apos;s workflow?
                                                </h3>
                                            </div>
                                            <div
                                                className="framer-ybsbx3"
                                                data-framer-component-type="RichTextContainer"
                                                style={{
                                                    ...richTextContainerStyle,
                                                    '--framer-link-text-color': 'rgb(0, 153, 255)',
                                                    '--framer-link-text-decoration': 'underline',
                                                    opacity: 0.9
                                                } as React.CSSProperties}
                                            >
                                                <p
                                                    className="framer-text framer-styles-preset-wct5n4"
                                                    data-styles-preset="OvgFe4dMx"
                                                    style={{ '--framer-text-alignment': 'center' } as React.CSSProperties}
                                                >
                                                    Book a demo to see how Taskos helps teams move faster and work smarter.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="framer-5s2c6f-container" style={{ opacity: 1 }}>
                                            <a
                                                className="framer-i8Jnw framer-YF6mi framer-1jz64ot framer-v-1alh3iz framer-1jhx1jk"
                                                data-framer-name="Black"
                                                data-highlight="true"
                                                href="https://www.framer.com?via=green13"
                                                target="_blank"
                                                rel="noopener"
                                                tabIndex={0}
                                                style={{
                                                    ...buttonBorderStyle,
                                                    backgroundColor: 'var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))',
                                                    borderRadius: '20px',
                                                    boxShadow: 'none',
                                                    opacity: 1
                                                }}
                                            >
                                                <div className="framer-12n0srg" data-framer-name="Container" style={{ opacity: 1 }}>
                                                    <div className="framer-1669q28" data-framer-name="Text" style={{ opacity: 1 }}>
                                                        <div
                                                            className="framer-1fovsuz"
                                                            data-framer-name="Text"
                                                            data-framer-component-type="RichTextContainer"
                                                            style={{
                                                                ...richTextContainerStyle,
                                                                '--extracted-r6o4lv': 'var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))',
                                                                '--framer-paragraph-spacing': '0px',
                                                                opacity: 1
                                                            } as React.CSSProperties}
                                                        >
                                                            <p
                                                                className="framer-text framer-styles-preset-kmaoy8"
                                                                data-styles-preset="MV92va9oP"
                                                                style={{
                                                                    '--framer-text-color': 'var(--extracted-r6o4lv, var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255)))'
                                                                } as React.CSSProperties}
                                                            >
                                                                Book a Demo
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="framer-laea7c" data-framer-name="Image" style={{ borderRadius: '10px', opacity: 1 }}>
                                        <div className="framer-ssurd7" data-framer-name="Image" style={{ opacity: 1 }}>
                                            <div
                                                data-framer-background-image-wrapper="true"
                                                style={{ position: 'absolute', borderRadius: 'inherit', inset: '0px' }}
                                            >
                                                <img
                                                    decoding="async"
                                                    loading="lazy"
                                                    width={imageConfig.width}
                                                    height={imageConfig.height}
                                                    sizes={imageConfig.sizes}
                                                    srcSet={`${imageConfig.url}?scale-down-to=512 512w,${imageConfig.url}?scale-down-to=1024 1024w,${imageConfig.url}?scale-down-to=2048 2048w,${imageConfig.url} ${imageConfig.width}w`}
                                                    src={`${imageConfig.url}?scale-down-to=2048`}
                                                    alt={imageConfig.alt}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: 'inherit',
                                                        objectPosition: 'center center',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Cta