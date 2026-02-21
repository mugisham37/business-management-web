import React from 'react'

// Color constants
const COLORS = {
  borderColor: 'rgb(229, 229, 232)',
  cardBackground: 'rgb(251, 251, 251)',
  shadowColor: 'rgb(248, 249, 250)',
  metricBlue: 'rgb(0, 94, 255)',
  badgeBackground: 'rgb(250, 250, 250)',
  badgeShadow: 'rgb(240, 241, 242)',
  iconColor: 'rgb(56, 56, 61)',
  darkText: 'rgb(38, 38, 38)',
  lightText: 'rgb(56, 56, 61)'
}

// Metrics data
const METRICS_DATA = [
  {
    value: "0K+",
    title: "Tasks Managed Weekly",
    description: "Thousands of workflows run every single week."
  },
  {
    value: "0%+",
    title: "Task Completion Rate",
    description: "Tasks are completed faster, with fewer delays."
  },
  {
    value: "0.0",
    title: "User Satisfaction Score",
    description: "Praised for speed, clarity, and collaboration."
  }
]

// MetricCard component
const MetricCard = ({ value, title, description }: {
  value: string
  title: string
  description: string
}) => (
  <div className="w-full" style={{willChange: "transform", opacity: 0, transform: "translateY(50px)"}}>
    <div 
      className="w-full rounded-[10px]"
      style={{
        border: `1px solid ${COLORS.borderColor}`,
        backgroundColor: COLORS.cardBackground,
        boxShadow: `0px 3px 5px 0px ${COLORS.shadowColor}`,
        opacity: 1
      }}
    >
      <div className="w-full p-6" style={{opacity: 1}}>
        <div className="w-full h-full flex items-center justify-center overflow-hidden select-none">
          <span 
            className="font-['Switzer','Switzer_Placeholder',sans-serif] text-center block w-full select-none"
            style={{
              fontWeight: 500,
              fontSize: "40px",
              fontStyle: "normal",
              letterSpacing: "-0.02em",
              lineHeight: "1em",
              color: COLORS.metricBlue,
              fontVariantNumeric: "tabular-nums",
              fontFeatureSettings: '"tnum"'
            }}
          >
            {value}
          </span>
        </div>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-2" style={{opacity: 1}}>
        <div className="outline-none flex flex-col justify-start flex-shrink-0">
          <h5 
            className="font-['Switzer','Switzer_Placeholder',sans-serif] text-lg font-semibold tracking-normal leading-[1.2em] text-left m-0"
            style={{color: COLORS.darkText}}
          >
            {title}
          </h5>
        </div>
        <div className="outline-none flex flex-col justify-start flex-shrink-0">
          <p 
            className="font-['Switzer','Switzer_Placeholder',sans-serif] text-base font-normal tracking-normal leading-[1.4em] text-left m-0"
            style={{color: COLORS.lightText}}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  </div>
)

const Metrics = () => {
  return (
    <section className="w-full py-16 px-4" id="metrics">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full flex justify-center">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[17px]"
                  style={{
                    border: `1px solid ${COLORS.borderColor}`,
                    backgroundColor: COLORS.badgeBackground,
                    boxShadow: `0px 2px 5px 0px ${COLORS.badgeShadow}`,
                    opacity: 1
                  }}
                >
                  <div className="w-5 h-5 flex items-center justify-center" style={{opacity: 1}}>
                    <svg 
                      className="w-full h-full" 
                      role="presentation"
                      viewBox="0 0 24 24"
                      style={{opacity: 1}}
                    >
                      <use href="#2327548604"></use>
                    </svg>
                  </div>
                  <div className="outline-none flex flex-col justify-start flex-shrink-0">
                    <p 
                      className="font-['Switzer','Switzer_Placeholder',sans-serif] text-sm font-normal tracking-[-0.01em] leading-[1.3em] text-center m-0"
                      style={{color: COLORS.darkText}}
                    >
                      Proof In The Numbers
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full flex justify-center">
                  <div className="outline-none flex flex-col justify-start flex-shrink-0 max-w-3xl">
                    <h2 
                      className="font-['Switzer','Switzer_Placeholder',sans-serif] text-[50px] font-semibold tracking-[-0.02em] leading-[1em] text-center m-0"
                      style={{color: COLORS.darkText}}
                    >
                      Built to scale, proven to perform.
                    </h2>
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <div className="outline-none flex flex-col justify-start flex-shrink-0 max-w-2xl">
                    <p 
                      className="font-['Switzer','Switzer_Placeholder',sans-serif] text-base font-normal tracking-normal leading-[1.4em] text-center m-0"
                      style={{color: COLORS.lightText}}
                    >
                      Behind every number is a team achieving more — see how high-performing workflows, speed, and satisfaction come together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {METRICS_DATA.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Metrics
