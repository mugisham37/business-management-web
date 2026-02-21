import React from 'react'

interface PolicySection {
  id: string;
  title: string;
  content: string;
  hasStrong?: boolean;
}

const policySections: PolicySection[] = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    content: 'We gather essential data such as task activity, user preferences, interaction history, and device information to ensure the platform runs smoothly and delivers an optimized experience. Our data collection practices include logs of feature usage and error reports, which help us identify issues and improve the system. Personal data collected is always limited to what is necessary for delivering our core functionalities, and we avoid collecting any sensitive or unrelated information that could compromise user privacy.',
    hasStrong: false
  },
  {
    id: 'data-usage',
    title: 'Data Usage',
    content: 'Collected data is used solely to provide, maintain, and continuously improve our services. This includes customizing features to better match your workflows, ensuring reliable operation of the platform, and conducting performance analysis to identify and fix bugs. We do not sell or lease your data to third parties, and we never use it for unrelated marketing or promotional purposes outside of the services we offer.',
    hasStrong: true
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    content: 'Information is shared only with trusted third-party service providers who assist us in operating our platform, such as hosting providers, analytics services, and payment processors. All partners are required to comply with strict confidentiality agreements and data protection obligations, ensuring your information is handled securely and only for necessary service-related tasks. We do not share data with advertisers or external parties without your consent.',
    hasStrong: true
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: 'We implement advanced encryption technologies, secure servers, and regular security audits to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security protocols include multi-factor authentication, encrypted data storage, and intrusion detection systems that actively monitor potential threats and vulnerabilities.',
    hasStrong: true
  },
  {
    id: 'user-rights',
    title: 'User Rights',
    content: 'You have the right to access, update, correct, or delete your personal data at any time. These actions can be taken directly through your account settings or by reaching out to our support team. We strive to process requests promptly and transparently, and we are committed to empowering you with control over your data, in accordance with applicable privacy laws.',
    hasStrong: true
  },
  {
    id: 'policy-updates',
    title: 'Policy Updates',
    content: 'We may revise this Privacy Policy periodically to reflect changes in our services, legal requirements, or industry standards. Whenever updates are made, we will notify users through in-app notifications, emails, or website banners. We encourage you to review the Privacy Policy regularly to stay informed about how we protect your information and uphold your privacy rights.',
    hasStrong: true
  }
];

const titleStyle = {
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  flexShrink: 0,
  transform: 'none'
} as const;

const contentStyle = {
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  flexShrink: 0,
  transform: 'none'
} as const;

const sectionStyle = {
  willChange: 'transform',
  opacity: 1,
  transform: 'none'
} as const;

const PolicySectionItem: React.FC<PolicySection> = ({ id, title, content, hasStrong }) => (
  <div className="framer-133351n" data-framer-name="Content" id={id} style={sectionStyle}>
    <div className="framer-j0lezj" data-framer-name="Title" data-framer-component-type="RichTextContainer" style={titleStyle}>
      <h5 className="framer-text framer-styles-preset-1h8kgs8" data-styles-preset="WvFMHHPMB">
        {hasStrong ? <strong className="framer-text">{title}</strong> : title}
      </h5>
    </div>
    <div className="framer-aucqy9" data-framer-name="Content" data-framer-component-type="RichTextContainer" style={contentStyle}>
      <p 
        className="framer-text framer-styles-preset-111x1mv" 
        data-styles-preset="o5a2l5TBf"
        style={id === 'data-collection' ? {'--framer-text-alignment': 'left'} as React.CSSProperties : undefined}
      >
        {content}
      </p>
    </div>
  </div>
);

const page = () => {
  return (
    <section className="framer-aboa0z" data-framer-name="Hero Section" id="hero">
      <div className="framer-1uglu1n" data-framer-name="Title">
        <div className="framer-9zqgsy" data-framer-name="Heading Content">
          <div 
            className="framer-guooxy" 
            data-framer-appear-id="guooxy" 
            data-framer-name="Heading"
            data-framer-component-type="RichTextContainer"
            style={{
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              opacity: 1,
              flexShrink: 0,
              transform: 'none',
              willChange: 'transform'
            }}
          >
            <h2 className="framer-text framer-styles-preset-199apa9" data-styles-preset="Ty6zNsrjE">
              Privacy Policy
            </h2>
          </div>
          <div 
            className="framer-u2j3tj" 
            data-framer-appear-id="u2j3tj" 
            data-framer-name="Subheading"
            data-framer-component-type="RichTextContainer"
            style={{
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              opacity: 1,
              flexShrink: 0,
              transform: 'perspective(1200px)',
              willChange: 'transform'
            }}
          >
            <p className="framer-text framer-styles-preset-wct5n4" data-styles-preset="OvgFe4dMx">
              Protecting your data with transparency and care.
            </p>
          </div>
        </div>
      </div>
      <div 
        className="framer-194l2vw" 
        data-border="true" 
        data-framer-appear-id="194l2vw"
        data-framer-name="Content" 
        style={{opacity: 1, transform: 'none', willChange: 'transform'}}
      >
        <div className="framer-1rnu4ee" data-framer-name="Container">
          {policySections.map((section) => (
            <PolicySectionItem key={section.id} {...section} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default page