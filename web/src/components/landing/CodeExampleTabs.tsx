"use client"
import * as Tabs from "@radix-ui/react-tabs"
import { RiCodeSSlashLine, RiShapesLine } from "@remixicon/react"
import Arrow from "@/components/ui/arrow"

export default function CodeExampleTabs({
  tab1,
  tab2,
}: {
  tab1?: any
  tab2?: any
}) {
  return (
    <Tabs.Root
      className="mt-14 grid grid-cols-12 gap-8"
      defaultValue="tab1"
      orientation="vertical"
    >
      <Tabs.List
        className="col-span-full flex w-full flex-col gap-8 md:order-2 md:col-span-5"
        aria-label="Select code"
      >
        <Tabs.Trigger
          className="group relative flex flex-1 flex-col items-start justify-start rounded-xl p-6 text-left shadow-lg ring-1 ring-border"
          value="tab1"
        >
          <div className="absolute -left-[36px] top-1/2 hidden -rotate-90 group-data-[state=active]:flex">
            <Arrow
              width={18}
              height={8}
              className="fill-foreground"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="aspect-square w-fit rounded-lg bg-card p-2 text-muted-foreground ring-1 ring-border transition-all group-data-[state=active]:text-primary group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/20">
              <RiShapesLine aria-hidden="true" className="size-5" />
            </div>
            <p className="font-semibold tracking-tight text-muted-foreground transition-all group-data-[state=active]:text-primary sm:text-lg">
              Model everything
            </p>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            Data integrity and query efficiency for diverse data types including
            geospatial and time-series. Easy to create, effortless to maintain.
          </p>
        </Tabs.Trigger>
        <Tabs.Trigger
          className="group relative flex flex-1 flex-col items-start justify-start rounded-xl p-6 text-left shadow-lg ring-1 ring-border"
          value="tab2"
        >
          <div className="absolute -left-[36px] top-1/2 hidden -rotate-90 sm:group-data-[state=active]:flex">
            <Arrow
              width={18}
              height={8}
              className="fill-foreground"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="data-state aspect-square w-fit rounded-lg bg-card p-2 text-muted-foreground ring-1 ring-border transition-all group-data-[state=active]:text-primary group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/20">
              <RiCodeSSlashLine aria-hidden="true" className="size-5" />
            </div>
            <p className="font-semibold tracking-tight text-muted-foreground transition-all group-data-[state=active]:text-primary sm:text-lg">
              Query efficiently
            </p>
          </div>
          <p className="mt-4 leading-7 text-muted-foreground">
            Leverage a developer-native query API to efficiently manage
            PostgreSQL data. Initialize once, scale infinitely.
          </p>
        </Tabs.Trigger>
      </Tabs.List>
      <div className="col-span-full md:col-span-7">
        <Tabs.Content value="tab1">{tab1}</Tabs.Content>
        <Tabs.Content value="tab2">{tab2}</Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
