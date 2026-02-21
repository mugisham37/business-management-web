import { Badge } from '@/components/reui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/reui/accordion'

// FAQ data with questions and answers
const faqData = [
    {
        question: "What makes this task tool different from others?",
        answer: "Our tool combines AI-powered automation with intuitive design, making task management effortless. Unlike traditional tools, we focus on intelligent prioritization and seamless team collaboration."
    },
    {
        question: "Can I use this for a large team or company?",
        answer: "Absolutely! Our platform scales from small teams to enterprise organizations. We offer advanced features like role-based permissions, custom workflows, and dedicated support for larger teams."
    },
    {
        question: "Is the AI really useful or just a gimmick?",
        answer: "The AI is a core feature that learns from your workflow patterns to provide smart suggestions, automate repetitive tasks, and help prioritize work. It's designed to save you hours each week."
    },
    {
        question: "What integrations are supported?",
        answer: "We integrate with popular tools like Slack, GitHub, Jira, Google Workspace, Microsoft Teams, and many more. Our API also allows custom integrations for your specific needs."
    },
    {
        question: "Is my data secure?",
        answer: "Security is our top priority. We use enterprise-grade encryption, regular security audits, and comply with GDPR, SOC 2, and other industry standards. Your data is always protected."
    },
    {
        question: "Can I customize workflows for different projects?",
        answer: "Yes! Each project can have its own custom workflow, templates, and automation rules. You have complete flexibility to adapt the tool to your team's unique processes."
    }
];

const FAQ = () => {
    return (
        <section className="py-16 px-4" id="faq">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="flex flex-col items-center">
                        {/* Badge */}
                        <div className="mb-6">
                            <Badge 
                                variant="outline" 
                                size="lg"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(250,250,250)] border-[rgb(229,229,232)] rounded-[17px] shadow-[0px_2px_5px_0px_rgb(240,241,242)]"
                            >
                                <svg
                                    className="w-5 h-5"
                                    role="presentation"
                                    viewBox="0 0 24 24"
                                    fill="rgb(56,56,61)"
                                >
                                    <use href="#3346926003"></use>
                                </svg>
                                <span className="text-sm font-normal leading-[1.3] tracking-[-0.01em] text-[rgb(56,56,61)]"
                                    style={{ fontFamily: 'Switzer, sans-serif' }}>
                                    FAQ
                                </span>
                            </Badge>
                        </div>

                        {/* Heading Content */}
                        <div className="flex flex-col items-center max-w-4xl">
                            <div className="mb-4">
                                <h2 className="text-[50px] lg:text-[38px] md:text-[28px] font-semibold leading-[1] tracking-[-0.02em] text-center text-black m-0"
                                    style={{ fontFamily: 'Switzer, sans-serif' }}>
                                    Answers to help you get started faster.
                                </h2>
                            </div>
                            <div>
                                <p className="text-base font-normal leading-[1.4] tracking-[0em] text-center text-[rgb(56,56,61)] m-0"
                                    style={{ fontFamily: 'Switzer, sans-serif' }}>
                                    Real stories from teams who streamlined their workflow and delivered more with less.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ List */}
                <div className="max-w-4xl mx-auto">
                    <Accordion type="single" collapsible className="flex flex-col gap-4">
                        {faqData.map((item, index) => (
                            <AccordionItem 
                                key={index} 
                                value={`item-${index}`}
                                className="w-full will-change-transform opacity-100 transform-none bg-[rgb(251,251,251)] border border-[rgb(229,229,232)] rounded-[10px] overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <AccordionTrigger className="w-full p-6 [&[data-state=open]_.faq-icon-vertical]:rotate-90 [&[data-state=open]_.faq-icon-vertical]:opacity-0">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex-1 outline-none flex flex-col justify-start shrink-0 text-left">
                                            <h6 className="text-lg lg:text-base font-semibold leading-[1.2] tracking-[0em] text-[rgb(38,38,38)] m-0"
                                                style={{ fontFamily: 'Switzer, sans-serif' }}>
                                                {item.question}
                                            </h6>
                                        </div>
                                        <div className="ml-4 opacity-100 shrink-0">
                                            <div className="relative w-5 h-5 opacity-100">
                                                {/* Horizontal bar */}
                                                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[rgb(0,94,255)] rounded-[1px] -translate-y-1/2 transition-transform"></div>
                                                {/* Vertical bar */}
                                                <div className="faq-icon-vertical absolute top-0 left-1/2 w-[2px] h-full bg-[rgb(0,94,255)] rounded-[1px] -translate-x-1/2 transition-all duration-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <p className="text-base font-normal leading-[1.6] tracking-[0em] text-[rgb(56,56,61)] m-0"
                                        style={{ fontFamily: 'Switzer, sans-serif' }}>
                                        {item.answer}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}

export default FAQ