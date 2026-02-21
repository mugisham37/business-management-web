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

const PolicySectionItem: React.FC<PolicySection> = ({ id, title, content, hasStrong }) => (
  <div className="opacity-100" id={id}>
    <div className="flex flex-col justify-start flex-shrink-0">
      <h5 className="font-['Switzer'] text-[20px] lg:text-[18px] font-semibold leading-[1.2em] tracking-normal text-[#262626] text-left">
        {hasStrong ? <strong>{title}</strong> : title}
      </h5>
    </div>
    <div className="flex flex-col justify-start flex-shrink-0">
      <p className="font-['Switzer'] text-base font-normal leading-[1.4em] tracking-normal text-[#53535c] text-left">
        {content}
      </p>
    </div>
  </div>
);

const page = () => {
  return (
    <section className="relative w-full" id="hero">
      <div className="flex flex-col items-start">
        <div className="flex flex-col items-start">
          <div className="flex flex-col justify-start opacity-100 flex-shrink-0">
            <h2 className="font-['Switzer'] text-[50px] lg:text-[38px] md:text-[28px] font-semibold leading-[1em] tracking-[-0.02em] text-black text-center">
              Privacy Policy
            </h2>
          </div>
          <div className="flex flex-col justify-start opacity-100 flex-shrink-0">
            <p className="font-['Switzer'] text-base font-normal leading-[1.4em] tracking-normal text-[#53535c] text-center">
              Protecting your data with transparency and care.
            </p>
          </div>
        </div>
      </div>
      <div className="opacity-100 border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-4">
          {policySections.map((section) => (
            <PolicySectionItem key={section.id} {...section} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default page