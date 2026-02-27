import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/reui/card'

// Changelog data structure
interface ChangelogEntry {
    date: string
    time: string
    title: string
    content: React.ReactNode
}

const changelogData: ChangelogEntry[] = [
    {
        date: 'Jul 15, 2025',
        time: '3:00 PM',
        title: 'Introducing Advanced Analytics & Custom Views',
        content: (
            <>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    We're excited to roll out powerful new updates designed to give your team deeper
                    insights and more flexibility in managing workflows:
                </p>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    <br />
                </p>
                <ul className="text-base font-normal leading-[1.4em] text-[#53535c] text-left list-none pl-0">
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            📊 <strong className="font-semibold">Advanced Analytics Dashboard</strong>: Dive into detailed reports on task
                            completion rates, team productivity, and project timelines with customizable data visualizations.
                        </p>
                    </li>
                </ul>
                <ul className="text-base font-normal leading-[1.4em] text-[#53535c] text-left list-none pl-0">
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            🔍 <strong className="font-semibold">Customizable Views</strong>: Create and save personalized board, timeline, or calendar views
                            tailored to your team's unique processes and preferences.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            📅 <strong className="font-semibold">Improved Scheduling</strong>: Enhanced date-picker with smart suggestions based on team
                            availability, reducing scheduling conflicts and missed deadlines.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            🔔 <strong className="font-semibold">Notification Overhaul</strong>: Receive real-time updates only for tasks you follow,
                            minimizing noise and keeping you focused.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            🔐 <strong className="font-semibold">Security Enhancements</strong>: Strengthened encryption protocols and added two-factor
                            authentication for better protection of your organization's data.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            🛠️ <strong className="font-semibold">Bug Fixes & Performance Boosts</strong>: General improvements to task assignment
                            speed, reduced loading times, and smoother experience on mobile devices.
                        </p>
                    </li>
                </ul>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    These updates are part of our ongoing commitment to helping you manage tasks smarter
                    and keep teams aligned effortlessly.
                </p>
            </>
        )
    },
    {
        date: 'Jul 1, 2025',
        time: '2:30 PM',
        title: 'Enhanced Smart Assignment Algorithms',
        content: (
            <>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    We've upgraded our task assignment algorithms for even smarter and faster workflow
                    distribution. Enjoy more accurate task suggestions, better workload balancing, and smoother project progress across your team.
                </p>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    <br />
                </p>
                <ul className="text-base font-normal leading-[1.4em] text-[#53535c] text-left list-none pl-0">
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Algorithms analyze workload patterns to prevent overloads.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Task suggestions now adapt to shifting team priorities.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Improved distribution ensures balanced team collaboration.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Enhanced learning from project history for future assignments.
                        </p>
                    </li>
                </ul>
            </>
        )
    },
    {
        date: 'Jun 30, 2025',
        time: '9:00 AM',
        title: 'Improved Real-Time Notifications',
        content: (
            <>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    Stay updated with our revamped real-time notifications. Our new system delivers faster
                    alerts for task updates, assignments, and comments to keep everyone on the same page without delays.
                </p>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    <br />
                </p>
                <ul className="text-base font-normal leading-[1.4em] text-[#53535c] text-left list-none pl-0">
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Push notifications arrive instantly for all task changes.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Comments now trigger immediate updates for involved members.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Redesigned alerts reduce missed updates.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Priority-based notifications help focus on what matters most.
                        </p>
                    </li>
                </ul>
            </>
        )
    },
    {
        date: 'May 1, 2025',
        time: '4:45 PM',
        title: 'New Integrations with Calendar Tools',
        content: (
            <>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    We've introduced seamless integrations with major calendar apps to help you schedule
                    tasks and milestones directly from your favorite calendar tools, ensuring deadlines and reminders are always in sync.
                </p>
                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left mb-5">
                    <br />
                </p>
                <ul className="text-base font-normal leading-[1.4em] text-[#53535c] text-left list-none pl-0">
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Google Calendar integration supports two-way syncing.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Outlook calendar support for enterprise teams.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Tasks auto-populate calendar events with due dates.
                        </p>
                    </li>
                    <li className="mb-5">
                        <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                            Calendar changes instantly update task schedules.
                        </p>
                    </li>
                </ul>
            </>
        )
    }
]

// Reusable ChangelogCard component using reui Card
const ChangelogCard = ({ date, time, title, content }: ChangelogEntry) => (
    <Card className="w-full bg-white rounded-2xl border border-[#e5e5e8] shadow-sm p-0">
        <CardContent className="flex flex-col gap-6 p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <p className="text-lg md:text-base font-semibold leading-[1.2em] text-[#262626] text-left tracking-normal">
                        {date}
                    </p>
                    <p className="text-sm font-normal leading-[1.3em] text-[#005eff] text-left tracking-[-0.01em]">
                        {time}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#38383d]" role="presentation" viewBox="0 0 24 24">
                        <use href="#1808785782"></use>
                    </svg>
                    <p className="text-sm font-normal leading-[1.3em] text-[#005eff] text-center tracking-[-0.01em]">
                        Change Log
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                    <h4 className="text-[22px] font-semibold leading-[1.2em] text-[#262626] text-left tracking-normal">
                        {title}
                    </h4>
                    <div className="text-base font-normal leading-[1.4em] text-[#53535c] text-left">
                        {content}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

const Page = () => {
    return (
        <section className="flex flex-col items-center justify-start py-20 px-6 w-full" id="hero">
            <div className="flex flex-col items-center justify-start gap-12 w-full max-w-7xl">
                <div className="flex flex-col items-center justify-start gap-8 w-full opacity-100">
                    <div className="flex flex-col items-center justify-start gap-6 w-full">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#fafafa] border border-[#e5e5e8] rounded-[17px] shadow-[0px_2px_5px_0px_#f0f1f2]">
                            <div className="flex items-center justify-center opacity-100">
                                <svg className="w-6 h-6 text-[#38383d]" role="presentation" viewBox="0 0 24 24">
                                    <use href="#4184916183"></use>
                                </svg>
                            </div>
                            <p className="text-sm font-normal leading-[1.3em] text-[#262626] text-center tracking-[-0.01em]">
                                Release Notes
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-start gap-4 w-full max-w-3xl">
                            <div className="flex flex-col items-center justify-start w-full">
                                <h2 className="text-[50px] md:text-[38px] sm:text-[28px] font-semibold leading-none text-black text-center tracking-[-0.02em]">
                                    See What's New &amp; Improved
                                </h2>
                            </div>
                            <div className="flex flex-col items-center justify-start w-full">
                                <p className="text-base font-normal leading-[1.4em] text-[#53535c] text-center tracking-normal">
                                    Stay up to date with the latest updates, enhancements, and fixes — all in one place.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-6 w-full opacity-100">
                    {changelogData.map((entry, index) => (
                        <ChangelogCard key={index} {...entry} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Page
