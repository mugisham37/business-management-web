import React from 'react'

// Testimonial data
interface Testimonial {
    name: string
    role: string
    quote: string
    image: {
        src: string
        srcSet: string
        width: number
        height: number
    }
}

const TESTIMONIALS_ROW_1: Testimonial[] = [
    {
        name: "Ava Cooper",
        role: "Customer Success Lead",
        quote: "We're hitting deadlines faster than ever — with fewer surprises and more clarity.",
        image: {
            src: "https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png",
            srcSet: "https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png?scale-down-to=1024 682w,https://framerusercontent.com/images/XGjLkiPfXbIhxnQlqAz55Ger9cw.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Liam Thompson",
        role: "Tech Lead",
        quote: "We've tried many platforms — this is the first that adapts to how we actually work.",
        image: {
            src: "https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png",
            srcSet: "https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png?scale-down-to=1024 682w,https://framerusercontent.com/images/eI3NH7IbjTlbBX2q4wbntD9xc.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Chloe Bennett",
        role: "Product Manager",
        quote: "This tool reduced status meetings and keeps us focused on key goals.",
        image: {
            src: "https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg",
            srcSet: "https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg?scale-down-to=1024 698w,https://framerusercontent.com/images/gcvmIxm2XRx6NG3kYAPz3zZXc6E.jpg 818w",
            width: 818,
            height: 1200
        }
    }
]

const TESTIMONIALS_ROW_2: Testimonial[] = [
    {
        name: "Ethan Hayes",
        role: "Engineering Manager",
        quote: "I can finally see what everyone's working on without constantly checking in.",
        image: {
            src: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png",
            srcSet: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png?scale-down-to=1024 682w,https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Sophia Martinez",
        role: "UX Designer",
        quote: "The interface is intuitive and the collaboration features are exactly what we needed.",
        image: {
            src: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png",
            srcSet: "https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png?scale-down-to=1024 682w,https://framerusercontent.com/images/Hy0Ov0Ql0Hy0Ov0Ql0Hy0Ov0Ql0.png 800w",
            width: 800,
            height: 1200
        }
    },
    {
        name: "Mason Rivera",
        role: "Scrum Master",
        quote: "Real-time edits and AI suggestions make our sprint planning incredibly smooth.",
        image: {
            src: "https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png",
            srcSet: "https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png?scale-down-to=512 512w,https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png?scale-down-to=1024 1024w,https://framerusercontent.com/images/ZZOy9M6PFFs3LeWq2i3jw9ao4o.png 1200w",
            width: 1200,
            height: 1200
        }
    }
]

// Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
    <div className="opacity-100" style={{fontFamily: 'Switzer, sans-serif'}}>
        <div className="border border-[#f2f2f2] bg-[#f8f9fa] rounded-xl shadow-[0px_0px_2px_0px_#f8f9fa]">
            <div className="border border-[#e5e5e8] bg-[#fbfbfb] rounded-[10px]">
                <div className="border-b border-[#e5e5e8] p-4">
                    <div className="flex gap-3 items-start">
                        <div className="rounded-[10px] w-[43px] h-[43px] flex-shrink-0 overflow-hidden relative">
                            <img 
                                decoding="async"
                                width={testimonial.image.width}
                                height={testimonial.image.height}
                                sizes="43px"
                                srcSet={testimonial.image.srcSet}
                                src={testimonial.image.src}
                                alt=""
                                className="block w-full h-full rounded-[inherit] object-cover object-center"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <h5 className="text-[16px] font-semibold leading-[1.3em] tracking-[0em] text-[#38383d] text-left m-0">
                                {testimonial.name}
                            </h5>
                            <h6 className="text-[14px] font-normal leading-[1.3em] tracking-[-0.01em] text-[#53535c] text-left opacity-80 m-0">
                                {testimonial.role}
                            </h6>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-[16px] font-normal leading-[1.4em] tracking-[0em] text-[#53535c] text-left m-0">
                        {testimonial.quote}
                    </p>
                </div>
            </div>
        </div>
    </div>
)

// Testimonial Group Component
const TestimonialGroup: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => (
    <div className="flex flex-col gap-[10px] flex-shrink-0">
        {testimonials.map((testimonial, index) => (
            <div key={`${testimonial.name}-${index}`} className="w-full">
                <TestimonialCard testimonial={testimonial} />
            </div>
        ))}
    </div>
)

// Testimonial Row Component
const TestimonialRow: React.FC<{ testimonials: Testimonial[], maskGradient: string, transform?: string }> = ({ 
    testimonials, 
    maskGradient,
    transform 
}) => (
    <div className="w-full h-full">
        <section 
            className="flex w-full h-full max-w-full max-h-full items-center justify-center m-0 p-[10px] overflow-hidden"
            style={{
                listStyleType: "none",
                opacity: "1",
                maskImage: maskGradient,
                WebkitMaskImage: maskGradient
            }}
        >
            <ul 
                className="flex w-full h-full max-w-full max-h-full items-center justify-start m-0 p-0 gap-[10px] relative flex-row"
                style={{
                    listStyleType: "none",
                    willChange: "auto",
                    transform: transform || "translateX(0px)",
                    left: transform ? "-1764px" : undefined
                }}
            >
                <li>
                    <TestimonialGroup testimonials={testimonials} />
                </li>
                <li aria-hidden="true">
                    <TestimonialGroup testimonials={testimonials} />
                </li>
                <li aria-hidden="true">
                    <TestimonialGroup testimonials={testimonials} />
                </li>
            </ul>
        </section>
    </div>
)

const Testimonials = () => {
    return (
        <section 
            id="testimonials"
            className="flex flex-row flex-nowrap items-start justify-center w-full px-[100px] pt-[150px] pb-[50px] gap-[63px]"
            style={{
                fontFamily: 'Switzer, sans-serif',
                background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
                minHeight: 'min-content',
                overflow: 'visible',
                position: 'relative'
            }}
        >
            <div className="flex flex-col flex-nowrap items-start justify-center gap-[45px] max-w-[1100px] w-full flex-1">
                <div className="flex flex-col flex-nowrap items-start justify-start gap-[111px] w-full z-[1]">
                    <div className="flex flex-col flex-nowrap items-center justify-start gap-[10px] w-full">
                        <div className="w-full">
                            <div className="flex items-center justify-center w-full mb-4">
                                <div 
                                    className="inline-flex items-center justify-center gap-[6px] px-[14px] py-[8px] border border-[#e5e5e8] bg-[#fafafa] rounded-[17px]"
                                    style={{
                                        boxShadow: '0px 2px 5px 0px #f0f1f2'
                                    }}
                                >
                                    <div className="flex items-center justify-center opacity-100">
                                        <svg 
                                            className="w-5 h-5" 
                                            viewBox="0 0 24 24"
                                            style={{opacity: "1"}}
                                        >
                                            <use href="#535726797"></use>
                                        </svg>
                                    </div>
                                    <p className="text-[14px] font-normal leading-[1.3em] tracking-[-0.01em] text-[#38383d] m-0">
                                        What Teams Are Saying
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-start gap-[10px] w-full">
                                <div className="w-full">
                                    <h2 
                                        className="text-center m-0 lg:text-[50px] md:text-[38px] text-[28px] font-semibold leading-[1em] tracking-[-0.02em] text-black"
                                    >
                                        See what our users are saying.
                                    </h2>
                                </div>
                                <div className="w-full">
                                    <p className="text-[16px] font-normal leading-[1.4em] tracking-[0em] text-[#53535c] text-center m-0">
                                        Real stories from teams who streamlined their workflow and delivered
                                        more with less.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-start gap-[10px] w-full h-[400px] z-0">
                    <div 
                        className="flex flex-col items-center justify-center gap-[2px] w-full"
                        style={{
                            willChange: "transform", 
                            opacity: "0", 
                            transform: "translateY(80px)",
                            minHeight: 'min-content'
                        }}
                    >
                        <div className="w-full flex-none h-auto relative">
                            <TestimonialRow 
                                testimonials={TESTIMONIALS_ROW_1}
                                maskGradient="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 6%, rgb(0, 0, 0) 94%, rgba(0, 0, 0, 0) 100%)"
                            />
                        </div>
                        <div className="w-full flex-none h-auto relative">
                            <TestimonialRow 
                                testimonials={TESTIMONIALS_ROW_2}
                                maskGradient="linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)"
                                transform="translateX(0px)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Testimonials
