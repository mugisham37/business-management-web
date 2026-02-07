"use client"
import * as Tabs from "@radix-ui/react-tabs"
import { RiCodeSSlashLine, RiShapesLine } from "@remixicon/react"
import Arrow from "../ui/Arrow"

export default function CodeExampleTabs({
  tab1,
  tab2,
}: {
  tab1?: any
  tab2?: any
}) {
  return (
    <Tabs.Root
      className="code-example-tabs-root"
      defaultValue="tab1"
      orientation="vertical"
    >
      <Tabs.List
        className="code-example-tabs-list"
        aria-label="Select code"
      >
        <Tabs.Trigger
          className="code-example-tabs-trigger"
          value="tab1"
        >
          <div className="code-example-tabs-arrow">
            <Arrow
              width={18}
              height={8}
              className="code-example-tabs-arrow-svg"
            />
          </div>
          <div className="code-example-tabs-header">
            <div className="code-example-tabs-icon-wrapper">
              <RiShapesLine aria-hidden="true" className="code-example-tabs-icon" />
            </div>
            <p className="code-example-tabs-title">
              Model everything
            </p>
          </div>
          <p className="code-example-tabs-description">
            Data integrity and query efficiency for diverse data types including
            geospatial and time-series. Easy to create, effortless to maintain.
          </p>
        </Tabs.Trigger>
        <Tabs.Trigger
          className="code-example-tabs-trigger"
          value="tab2"
        >
          <div className="code-example-tabs-arrow">
            <Arrow
              width={18}
              height={8}
              className="code-example-tabs-arrow-svg"
            />
          </div>
          <div className="code-example-tabs-header">
            <div className="code-example-tabs-icon-wrapper">
              <RiCodeSSlashLine aria-hidden="true" className="code-example-tabs-icon" />
            </div>
            <p className="code-example-tabs-title">
              Query efficiently
            </p>
          </div>
          <p className="code-example-tabs-description">
            Leverage a developer-native query API to efficiently manage
            PostgreSQL data. Initialize once, scale infinitely.
          </p>
        </Tabs.Trigger>
      </Tabs.List>
      <div className="code-example-tabs-content-wrapper">
        <Tabs.Content value="tab1">{tab1}</Tabs.Content>
        <Tabs.Content value="tab2">{tab2}</Tabs.Content>
      </div>
    </Tabs.Root>
  )
}
