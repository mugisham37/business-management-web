import React from 'react'

// Reusable style objects
const commonStyles = {
    richTextContainer: {
        outline: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'flex-start',
        flexShrink: 0,
        transform: 'none'
    },
    contentSection: {
        willChange: 'transform',
        opacity: 1,
        transform: 'none'
    }
}

// Terms content data
const termsContent = [
    {
        id: 'acceptance-of-terms',
        className: 'framer-1axffql',
        titleClassName: 'framer-1uvhigq',
        contentClassName: 'framer-1skpheg',
        title: 'Acceptance of Terms',
        content: 'By accessing or using our platform, you agree to comply with these Terms of Use and all applicable laws and regulations. Continued use of the service after updates to the terms constitutes acceptance of any modifications. If you do not agree, you must immediately stop using the platform and terminate your account.',
        hasStrong: false
    },
    {
        id: 'user-responsibilities',
        className: 'framer-1dt5ids',
        titleClassName: 'framer-gyr52m',
        contentClassName: 'framer-1ygwxt8',
        title: 'User Responsibilities',
        content: 'Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to use the platform solely for lawful purposes, refrain from unauthorized or abusive behavior, and promptly notify us of any suspected security breaches or misuse of your account.',
        hasStrong: true
    },
    {
        id: 'service-availability',
        className: 'framer-1rzf8h6',
        titleClassName: 'framer-1hboh5a',
        contentClassName: 'framer-11sltd6',
        title: 'Service Availability',
        content: 'While we strive to keep our platform operational 24/7, we cannot guarantee uninterrupted access. We reserve the right to suspend or restrict access temporarily or permanently for maintenance, security, or technical reasons. We are not liable for any loss or inconvenience resulting from service downtime or disruptions beyond our control.',
        hasStrong: true
    },
    {
        id: 'intellectual-property',
        className: 'framer-1bvt99e',
        titleClassName: 'framer-1c5nzgs',
        contentClassName: 'framer-nei7mr',
        title: 'Intellectual Property',
        content: 'All content, features, and functionalities on the platform, including but not limited to software code, text, graphics, and logos, are the exclusive property of our company or its licensors. You may not copy, modify, distribute, or create derivative works based on any part of the service without prior written consent from us.',
        hasStrong: true
    },
    {
        id: 'termination-of-use',
        className: 'framer-1bvtef3',
        titleClassName: 'framer-1wsb8k9',
        contentClassName: 'framer-1um3s6v',
        title: 'Termination of Use',
        content: 'We reserve the right to suspend or terminate your account and access to the platform at our discretion, especially in cases of suspected violation of these Terms of Use, illegal activities, or behavior that harms other users or the service itself. Upon termination, your right to use the platform will cease immediately without prior notice.',
        hasStrong: true
    }
]

// Reusable term section component
const TermSection = ({ 
    id, 
    className, 
    titleClassName, 
    contentClassName, 
    title, 
    content, 
    hasStrong 
}: {
    id: string
    className: string
    titleClassName: string
    contentClassName: string
    title: string
    content: string
    hasStrong: boolean
}) => (
    <div className={className} data-framer-name="Content" id={id} style={commonStyles.contentSection}>
        <div className={titleClassName} data-framer-name="Title"
            data-framer-component-type="RichTextContainer"
            style={commonStyles.richTextContainer}>
            <h5 className="framer-text framer-styles-preset-1h8kgs8" data-styles-preset="WvFMHHPMB">
                {hasStrong ? <strong className="framer-text">{title}</strong> : title}
            </h5>
        </div>
        <div className={contentClassName} data-framer-name="Content"
            data-framer-component-type="RichTextContainer"
            style={commonStyles.richTextContainer}>
            <p className="framer-text framer-styles-preset-111x1mv" data-styles-preset="o5a2l5TBf"
                style={{'--framer-text-alignment': 'left'} as React.CSSProperties}>
                {content}
            </p>
        </div>
    </div>
)

const page = () => {
    return (
        <section className="framer-g19yuj" data-framer-name="Hero Section" id="hero">
            <div className="framer-1dqui7i" data-framer-name="Title">
                <div className="framer-80aa4p" data-framer-name="Heading Content">
                    <div className="framer-uzclov" data-framer-appear-id="uzclov" data-framer-name="Heading"
                        data-framer-component-type="RichTextContainer"
                        style={{outline: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', opacity: 1, flexShrink: 0, transform: 'none', willChange: 'transform'}}>
                        <h2 className="framer-text framer-styles-preset-199apa9" data-styles-preset="Ty6zNsrjE">
                            Terms of Use</h2>
                    </div>
                    <div className="framer-po10on" data-framer-appear-id="po10on" data-framer-name="Subheading"
                        data-framer-component-type="RichTextContainer"
                        style={{outline: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', opacity: 1, flexShrink: 0, transform: 'perspective(1200px)', willChange: 'transform'}}>
                        <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx">Clear
                            guidelines to ensure fair, safe, and effective use of our services.</p>
                    </div>
                </div>
            </div>
            <div className="framer-sv86mz" data-border="true" data-framer-appear-id="sv86mz"
                data-framer-name="Content" style={{opacity: 1, transform: 'none', willChange: 'transform'}}>
                <div className="framer-11n2sj2" data-framer-name="Container">
                    {termsContent.map((term) => (
                        <TermSection key={term.id} {...term} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default page