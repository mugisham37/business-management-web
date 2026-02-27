"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Divider } from "@/components/ui/divider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ProgressCircle } from "@/components/ui/progress-circle"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { RiArrowRightUpLine } from "@remixicon/react"
import React from "react"

const data: {
  name: string
  description: string
  value: string
  capacity?: string
  percentageValue?: number
}[] = [
  {
    name: "Starter plan",
    description: "Discounted plan for start-ups and growing companies",
    value: "$90",
  },
  {
    name: "Storage",
    description: "Used 10.1 GB",
    value: "$40",
    capacity: "100 GB included",
    percentageValue: 10.1,
  },
  {
    name: "Bandwith",
    description: "Used 2.9 GB",
    value: "$10",
    capacity: "5 GB included",
    percentageValue: 58,
  },
  {
    name: "Users",
    description: "Used 9",
    value: "$20",
    capacity: "50 users included",
    percentageValue: 18,
  },
  {
    name: "Query super caching (EU-Central 1)",
    description: "4 GB query cache, $120/mo",
    value: "$120.00",
  },
]

export default function Billing() {
  const [isSpendMgmtEnabled, setIsSpendMgmtEnabled] = React.useState(true)
  return (
    <>
      <div className="rounded-lg bg-muted p-6 ring-1 ring-inset ring-border">
        <h4 className="text-sm font-semibold text-foreground">
          This workspace is currently on free plan
        </h4>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Boost your analytics and unlock advanced features with our premium
          plans.{" "}
          <a
            href="#"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/90"
          >
            Compare plans
            <RiArrowRightUpLine
              className="size-4 shrink-0"
              aria-hidden="true"
            />
          </a>
        </p>
      </div>
      <div className="mt-6 space-y-10">
        <section aria-labelledby="billing-overview">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="billing-overview"
                className="scroll-mt-10 font-semibold text-foreground"
              >
                Billing
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Overview of current billing cycle based on fixed and on-demand
                charges.
              </p>
            </div>
            <div className="md:col-span-2">
              <ul
                role="list"
                className="w-full divide-y divide-border border-b border-border"
              >
                {data.map((item) => (
                  <li key={item.name} className="px-2 py-4 text-sm md:p-4">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="font-medium text-foreground/80">
                          {item.value}
                        </p>
                      </div>
                      <div className="w-full md:w-2/3">
                        {item.percentageValue && (
                          <ProgressBar
                            value={item.percentageValue}
                            className="mt-2 [&>*]:h-1.5"
                          />
                        )}
                        <p className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.description}</span>
                          <span>{item.capacity}</span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-2 py-4 md:p-4">
                <p className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>Total for May 24</span>
                  <span className="font-semibold">$280</span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <Divider />
        <section aria-labelledby="cost-spend-control">
          <form>
            <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
              <div>
                <h2
                  id="cost-spend-control"
                  className="scroll-mt-10 font-semibold text-foreground"
                >
                  Cost spend control
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Set hard caps for on-demand charges.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <ProgressCircle
                      value={isSpendMgmtEnabled ? 62.2 : 0}
                      radius={20}
                      strokeWidth={4.5}
                    />
                    <div>
                      {isSpendMgmtEnabled ? (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            &#36;280 / 350 (62.2&#37;)
                          </p>
                          <Label
                            htmlFor="spend-mgmt"
                            className="text-muted-foreground"
                          >
                            Spend management enabled
                          </Label>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            &#36;0 / 0 (0&#37;)
                          </p>
                          <Label
                            htmlFor="spend-mgmt"
                            className="text-muted-foreground"
                          >
                            Spend management disabled
                          </Label>
                        </>
                      )}
                    </div>
                  </div>
                  <Switch
                    id="spend-mgmt"
                    name="spend-mgmt"
                    checked={isSpendMgmtEnabled}
                    onCheckedChange={() => {
                      setIsSpendMgmtEnabled(!isSpendMgmtEnabled)
                    }}
                  />
                </div>
                <div
                  className={cn(
                    "transform-gpu transition-all ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform",
                    isSpendMgmtEnabled ? "h-52 md:h-32" : "h-0",
                  )}
                  style={{
                    transitionDuration: "300ms",
                    animationFillMode: "backwards",
                  }}
                >
                  <div
                    className={cn(
                      "animate-slideDownAndFade transition",
                      isSpendMgmtEnabled ? "" : "hidden",
                    )}
                    style={{
                      animationDelay: "100ms",
                      animationDuration: "300ms",
                      transitionDuration: "300ms",
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <Label className="font-medium">Set amount ($)</Label>
                        <Input
                          id="hard-cap"
                          name="hard-cap"
                          defaultValue={350}
                          type="number"
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="font-medium">
                          Provide email for notifications
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          placeholder="admin@company.com"
                          type="email"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Update</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
        <Divider />
        <section aria-labelledby="add-ons">
          <form>
            <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
              <div>
                <h2
                  id="add-ons"
                  className="scroll-mt-10 font-semibold text-foreground"
                >
                  Add-Ons
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Additional services to boost your services.
                </p>
              </div>
              <div className="space-y-6 md:col-span-2">
                <Card className="overflow-hidden p-0">
                  <div className="px-4 pb-6 pt-4">
                    <span className="text-sm text-muted-foreground">$25/month</span>
                    <h4 className="mt-4 text-sm font-semibold text-foreground">
                      Advanced bot protection
                    </h4>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Safeguard your assets with our cutting-edge bot
                      protection. Our AI solution identifies and mitigates
                      automated traffic to protect your workspace from bad bots.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <Switch id="bot-protection" name="bot-protection" />
                      <Label htmlFor="bot-protection">Activate</Label>
                    </div>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/90"
                    >
                      Learn more
                      <RiArrowRightUpLine
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </Card>
                <Card className="overflow-hidden p-0">
                  <div className="px-4 pb-6 pt-4">
                    <span className="text-sm text-muted-foreground">$50/month</span>
                    <h4 className="mt-4 text-sm font-semibold text-foreground">
                      Workspace insights
                    </h4>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                      Real-time analysis of your workspace&#39;s usage, enabling
                      you to make well-informed decisions for optimization.
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <Switch id="insights" name="insights" />
                      <Label htmlFor="insights">Activate</Label>
                    </div>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/90"
                    >
                      Learn more
                      <RiArrowRightUpLine
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
