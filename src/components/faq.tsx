import React from 'react'

// FAQ questions data
const faqQuestions = [
    "What makes this task tool different from others?",
    "Can I use this for a large team or company?",
    "Is the AI really useful or just a gimmick?",
    "What integrations are supported?",
    "Is my data secure?",
    "Can I customize workflows for different projects?"
];

const FAQ = () => {
    return (
        <section className="py-16 px-4" id="faq">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <div className="flex flex-col items-center">
                        {/* Badge */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(250,250,250)] border border-[rgb(229,229,232)] rounded-[17px] shadow-[0px_2px_5px_0px_rgb(240,241,242)]">
                                <div className="opacity-100">
                                    <svg
                                        className="w-5 h-5"
                                        role="presentation"
                                        viewBox="0 0 24 24"
                                        fill="rgb(56,56,61)"
                                    >
                                        <use href="#3346926003"></use>
                                    </svg>
                                </div>
                                <p className="text-sm font-normal leading-[1.3] tracking-[-0.01em] text-center text-[rgb(56,56,61)] m-0"
                                    style={{ fontFamily: 'Switzer, sans-serif' }}>
                                    FAQ
                                </p>
                            </div>
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
                    <div className="flex flex-col gap-4">
                        {faqQuestions.map((question, index) => (
                            <div key={index} className="w-full will-change-transform opacity-100 transform-none">
                                <div
                                    className="w-full bg-[rgb(251,251,251)] border border-[rgb(229,229,232)] rounded-[10px] p-6 cursor-pointer hover:shadow-md transition-shadow"
                                    tabIndex={0}
                                    role="button"
                                    aria-expanded="false"
                                >
                                    <div className="opacity-100">
                                        <div className="opacity-100">
                                            <div className="flex items-center justify-between opacity-100">
                                                <div className="flex-1 outline-none flex flex-col justify-start shrink-0">
                                                    <h6 className="text-lg lg:text-base font-semibold leading-[1.2] tracking-[0em] text-left text-[rgb(38,38,38)] m-0"
                                                        style={{ fontFamily: 'Switzer, sans-serif' }}>
                                                        {question}
                                                    </h6>
                                                </div>
                                                <div className="ml-4 opacity-100">
                                                    <div className="relative w-5 h-5 opacity-100">
                                                        {/* Horizontal bar */}
                                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[rgb(0,94,255)] rounded-[1px] -translate-y-1/2"></div>
                                                        {/* Vertical bar */}
                                                        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-[rgb(0,94,255)] rounded-[1px] -translate-x-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ