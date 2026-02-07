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
      "How secure is the database software in terms of protecting sensitive data?",
    answer:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat",
  },
  {
    question: "Can the database be self-hosted?",
    answer:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat",
  },
  {
    question:
      "Does the software support integration with other systems and applications?",
    answer:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat",
  },
  {
    question:
      "How easy is it to back up and restore data using the database software?",
    answer:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat",
  },
  {
    question:
      "What level of technical support and maintenance is provided for the software?",
    answer:
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat",
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
            Can&rsquo;t find the answer you&rsquo;re looking for? Don&rsquo;t
            hesitate to get in touch with our{" "}
            <a
              href="#"
              className="faqs-description-link"
            >
              customer support
            </a>{" "}
            team.
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
