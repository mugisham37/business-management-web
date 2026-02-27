import { Badge } from '@/components/reui/badge'
import { Card, CardContent, CardFooter } from '@/components/reui/card'

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
  <div className="w-full transition-all duration-300">
    <Card className="w-full rounded-[10px] border-border bg-card shadow-[0px_3px_5px_0px_rgb(248,249,250)] dark:shadow-[0px_3px_5px_0px_rgba(0,0,0,0.3)]">
      <CardContent className="w-full p-6">
        <div className="w-full h-full flex items-center justify-center overflow-hidden select-none">
          <span 
            className="font-['Switzer','Switzer_Placeholder',sans-serif] text-center block w-full select-none text-[40px] font-medium tracking-[-0.02em] leading-[1em] text-primary tabular-nums"
            style={{
              fontFeatureSettings: '"tnum"'
            }}
          >
            {value}
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 flex-col items-start gap-2">
        <h5 className="font-['Switzer','Switzer_Placeholder',sans-serif] text-lg font-semibold tracking-normal leading-[1.2em] text-left m-0 text-foreground">
          {title}
        </h5>
        <p className="font-['Switzer','Switzer_Placeholder',sans-serif] text-base font-normal tracking-normal leading-[1.4em] text-left m-0 text-muted-foreground">
          {description}
        </p>
      </CardFooter>
    </Card>
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
                <Badge 
                  variant="outline" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[17px] border-border bg-[rgb(250,250,250)] shadow-[0px_2px_5px_0px_rgb(240,241,242)] dark:bg-muted dark:shadow-[0px_2px_5px_0px_rgba(0,0,0,0.3)]"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg 
                      className="w-full h-full" 
                      role="presentation"
                      viewBox="0 0 24 24"
                    >
                      <use href="#2327548604"></use>
                    </svg>
                  </div>
                  <span className="font-['Switzer','Switzer_Placeholder',sans-serif] text-sm font-normal tracking-[-0.01em] leading-[1.3em] text-center text-foreground">
                    Proof In The Numbers
                  </span>
                </Badge>
              </div>
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full flex justify-center">
                  <h2 className="font-['Switzer','Switzer_Placeholder',sans-serif] text-[50px] font-semibold tracking-[-0.02em] leading-[1em] text-center m-0 max-w-3xl text-foreground">
                    Built to scale, proven to perform.
                  </h2>
                </div>
                <div className="w-full flex justify-center">
                  <p className="font-['Switzer','Switzer_Placeholder',sans-serif] text-base font-normal tracking-normal leading-[1.4em] text-center m-0 max-w-2xl text-muted-foreground">
                    Behind every number is a team achieving more — see how high-performing workflows, speed, and satisfaction come together.
                  </p>
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
