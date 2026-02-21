import React from 'react'

interface BenefitCardProps {
    iconHref: string;
    title: string;
    description: string;
}

const benefitsData: BenefitCardProps[] = [
    {
        iconHref: "#617290613",
        title: "Zero Overlap Planning",
        description: "Prevent task conflicts with built-in smart scheduling."
    },
    {
        iconHref: "#1067826548",
        title: "Click-to-Act Notifications",
        description: "Act fast with alerts—no clutter or missed updates."
    },
    {
        iconHref: "#2840072777",
        title: "Offline-Ready Sync",
        description: "Stay synced—updates auto-load once you're online."
    },
    {
        iconHref: "#987190984",
        title: "Built-In Audit Trail",
        description: "Track every edit and action with built-in transparency."
    },
    {
        iconHref: "#1283949305",
        title: "Smart Recurring Tasks",
        description: "Automate with flexible task logic and helpful reminders."
    },
    {
        iconHref: "#3494739676",
        title: "Human-Centered Design",
        description: "Built for clarity, ease, and real-world user needs and habits."
    }
];

const BenefitCard: React.FC<BenefitCardProps> = ({ iconHref, title, description }) => {
    return (
        <div className="w-full border border-[rgb(229,229,232)] bg-white rounded-[10px] shadow-[0px_2px_5px_0px_rgb(248,249,250)] p-6">
            <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-[rgb(240,248,255)] rounded-lg flex items-center justify-center">
                    <svg 
                        role="presentation"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 stroke-[rgb(66,135,255)]"
                        style={{ strokeWidth: 1.5, fill: 'none' }}
                    >
                        <use href={iconHref}></use>
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h6 className="font-['Switzer',sans-serif] text-lg font-semibold leading-[1.2] text-[rgb(38,38,38)] text-left m-0">
                        {title}
                    </h6>
                    <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4] text-[rgb(56,56,61)] text-left opacity-90 m-0">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Benefits = () => {
    return (
        <section className="py-16 px-4" id="benefits">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center gap-8 mb-12">
                    <div className="flex flex-col items-center gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 border border-[rgb(229,229,232)] bg-[rgb(250,250,250)] rounded-[17px] shadow-[0px_2px_5px_0px_rgb(240,241,242)]">
                            <svg
                                role="presentation"
                                viewBox="0 0 24 24"
                                className="w-5 h-5 stroke-[rgb(56,56,61)]"
                                style={{ strokeWidth: 1.4, fill: 'none' }}
                            >
                                <use href="#3282134952"></use>
                            </svg>
                            <p className="font-['Switzer',sans-serif] text-sm font-normal leading-[1.3] tracking-[-0.01em] text-[rgb(38,38,38)] m-0">
                                Why Teams Choose Us
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <h2 className="font-['Switzer',sans-serif] text-[50px] font-semibold leading-[1] tracking-[-0.02em] text-black text-center m-0">
                                Boost clarity, speed, and team flow.
                            </h2>
                            <p className="font-['Switzer',sans-serif] text-base font-normal leading-[1.4] text-[rgb(56,56,61)] text-center max-w-2xl m-0">
                                Packed with thoughtful features that help teams stay aligned, avoid
                                confusion, and move fast — without the chaos.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefitsData.map((benefit, index) => (
                        <BenefitCard
                            key={index}
                            iconHref={benefit.iconHref}
                            title={benefit.title}
                            description={benefit.description}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Benefits