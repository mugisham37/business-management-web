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
              Organize everything
            </p>
          </div>
          <p className="code-example-tabs-description">
            Track inventory, customers, orders, and finances in one place. Simple setup, powerful organization.
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
              Access instantly
            </p>
          </div>
          <p className="code-example-tabs-description">
            Get the data you need with smart filters and reports. Find anything in seconds, not hours.
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
