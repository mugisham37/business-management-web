"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion"

const faqs = [
  {
    question:
      "How secure is the platform in terms of protecting my business data?",
    answer:
      "We implement enterprise-grade security with multi-layer authentication, end-to-end encryption, and continuous monitoring. Every action is logged, data is encrypted both in transit and at rest, and we maintain SOC 2 compliance to ensure your business information stays protected.",
  },
  {
    question: "Can I start small and upgrade as my business grows?",
    answer:
      "Absolutely. Our platform is designed to scale with you. Start with the Starter plan as a solo entrepreneur, then seamlessly upgrade to Teams or Business as you add locations, employees, and need more advanced features. Your data and settings transfer automatically with no disruption.",
  },
  {
    question:
      "Does the software integrate with my existing tools and services?",
    answer:
      "Yes. We offer pre-built integrations with popular payment processors, shipping carriers, accounting software, e-commerce platforms, and marketing tools. Our API also allows custom integrations with industry-specific systems you already use.",
  },
  {
    question:
      "What happens to my data if I need to export or migrate?",
    answer:
      "Your data is always yours. We provide comprehensive export tools in standard formats (CSV, Excel, JSON) for all your business information. Automated backups run continuously, and you can restore your entire business to any point in time within your plan's retention period.",
  },
  {
    question:
      "What kind of support can I expect with each plan?",
    answer:
      "Starter plans include community support and email responses within 2-4 days. Teams plans get priority email support with 1-2 day response times plus business hours chat. Business plans receive 24/7 dedicated support with priority handling and a dedicated account manager.",
  },
]

export function Faqs() {
  return (
    <section 
      className="sm:mt-36" 
      aria-labelledby="faq-title"
      style={{ marginTop: 'var(--spacing-gallery-top)' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-14">
        <div className="col-span-full sm:col-span-5">
          <h2
            id="faq-title"
            className="heading-gradient scroll-my-24 pr-2"
            style={{ 
              fontSize: 'var(--text-2xl)',
              lineHeight: 'var(--leading-section)'
            }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-landing-body mt-4 text-base leading-7">
            Can&rsquo;t find the answer you&rsquo;re looking for? Don&rsquo;t
            hesitate to get in touch with our{" "}
            <a
              href="#"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              customer support
            </a>{" "}
            team.
          </p>
        </div>
        <div className="col-span-full mt-6 lg:col-span-7 lg:mt-0">
          <Accordion type="multiple" className="mx-auto">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="py-3 first:pb-3 first:pt-0"
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="text-landing-body">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
