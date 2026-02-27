import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/reui/card'
import { Separator } from '@/components/reui/separator'

// Terms content data
const termsContent = [
    {
        id: 'acceptance-of-terms',
        title: 'Acceptance of Terms',
        content: 'By accessing or using our platform, you agree to comply with these Terms of Use and all applicable laws and regulations. Continued use of the service after updates to the terms constitutes acceptance of any modifications. If you do not agree, you must immediately stop using the platform and terminate your account.',
        hasStrong: false
    },
    {
        id: 'user-responsibilities',
        title: 'User Responsibilities',
        content: 'Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to use the platform solely for lawful purposes, refrain from unauthorized or abusive behavior, and promptly notify us of any suspected security breaches or misuse of your account.',
        hasStrong: true
    },
    {
        id: 'service-availability',
        title: 'Service Availability',
        content: 'While we strive to keep our platform operational 24/7, we cannot guarantee uninterrupted access. We reserve the right to suspend or restrict access temporarily or permanently for maintenance, security, or technical reasons. We are not liable for any loss or inconvenience resulting from service downtime or disruptions beyond our control.',
        hasStrong: true
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        content: 'All content, features, and functionalities on the platform, including but not limited to software code, text, graphics, and logos, are the exclusive property of our company or its licensors. You may not copy, modify, distribute, or create derivative works based on any part of the service without prior written consent from us.',
        hasStrong: true
    },
    {
        id: 'termination-of-use',
        title: 'Termination of Use',
        content: 'We reserve the right to suspend or terminate your account and access to the platform at our discretion, especially in cases of suspected violation of these Terms of Use, illegal activities, or behavior that harms other users or the service itself. Upon termination, your right to use the platform will cease immediately without prior notice.',
        hasStrong: true
    }
]

// Reusable term section component using reui Card
const TermSection = ({ 
    id, 
    title, 
    content, 
    hasStrong 
}: {
    id: string
    title: string
    content: string
    hasStrong: boolean
}) => (
    <Card 
        className="mb-8 opacity-100 transform-none will-change-transform border-0 shadow-none bg-transparent p-0" 
        id={id}
    >
        <CardHeader className="mb-4 p-0">
            <CardTitle 
                className="text-lg md:text-xl font-semibold leading-[1.2em] text-left text-[#262626] m-0"
                style={{ fontFamily: "'Switzer', sans-serif" }}
            >
                {hasStrong ? <strong>{title}</strong> : title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <p 
                className="text-base font-normal leading-[1.4em] text-left text-[#53535c] m-0"
                style={{ fontFamily: "'Switzer', sans-serif" }}
            >
                {content}
            </p>
        </CardContent>
    </Card>
)

const page = () => {
    return (
        <section className="w-full py-16 px-4" id="hero">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <div className="mb-6">
                        <h2 
                            className="text-[28px] md:text-[38px] lg:text-[50px] font-semibold leading-[1em] tracking-[-0.02em] text-center text-black m-0"
                            style={{ fontFamily: "'Switzer', sans-serif" }}
                        >
                            Terms of Use
                        </h2>
                    </div>
                    <div>
                        <p 
                            className="text-base font-normal leading-[1.4em] text-center text-[#53535c] m-0"
                            style={{ fontFamily: "'Switzer', sans-serif" }}
                        >
                            Clear guidelines to ensure fair, safe, and effective use of our services.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto opacity-100 transform-none will-change-transform">
                <div className="space-y-8">
                    {termsContent.map((term) => (
                        <TermSection key={term.id} {...term} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default page