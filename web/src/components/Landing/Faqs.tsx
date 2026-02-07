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
      "How secure is my business data with your platform?",
    answer:
      "We use bank-level encryption and industry-standard security protocols to protect your data. All information is encrypted both in transit and at rest, with regular security audits and compliance certifications.",
  },
  {
    question: "Can I use this for both retail and wholesale operations?",
    answer:
      "Absolutely! Our platform is designed to handle all business types—from retail stores and wholesale distributors to manufacturing and industrial operations. You can customize workflows to match your specific needs.",
  },
  {
    question:
      "Does the software integrate with my existing accounting tools?",
    answer:
      "Yes, we integrate with popular accounting software like QuickBooks, Xero, and Sage, as well as payment processors, CRM systems, and over a hundred other business tools to streamline your operations.",
  },
  {
    question:
      "How easy is it to migrate my current business data?",
    answer:
      "Very easy! We provide guided import tools and templates for common data formats. Our support team can also assist with data migration to ensure a smooth transition with zero downtime.",
  },
  {
    question:
      "What kind of support and training do you provide?",
    answer:
      "We offer comprehensive onboarding, video tutorials, documentation, and live chat support. Premium plans include dedicated account managers and personalized training sessions for your team.",
  },
]

export function Faqs() {
  return (
    <section className="faqs-section" aria-labelledby="faq-title">
      <div className="faqs-grid">
        <div className="faqs-left-column">
          <h2
            id="faq-title"
            className="faqs-heading"
          >
            Frequently Asked Questions
          </h2>
          <p className="faqs-description">
            Can&rsquo;t find what you need? Our{" "}
            <a
              href="#"
              className="faqs-description-link"
            >
              customer support
            </a>{" "}
            team is here to help.
          </p>
        </div>
        <div className="faqs-right-column">
          <Accordion type="multiple" className="faqs-accordion">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="faqs-accordion-item"
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="faqs-accordion-content">
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
