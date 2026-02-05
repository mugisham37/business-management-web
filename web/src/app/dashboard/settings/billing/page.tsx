"use client"

import * as React from "react"
import { RiArrowRightUpLine } from "@remixicon/react"
import { CircleCheck, Plus } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Divider } from "@/components/ui/Divider"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { ProgressCircle } from "@/components/ui/ProgressCircle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { Switch } from "@/components/ui/Switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/Table"
import { cx } from "@/lib/utils"

interface BillingItem {
  name: string
  quantity: number
  unit: string
  price: string
}

interface UsageItem {
  name: string
  description: string
  value: string
  capacity?: string
  percentageValue?: number
}

interface PaymentCard {
  id: string
  provider: string
  type: string
  lastFour: string
  expiryDate: string
  isActive: boolean
}

interface AddOn {
  id: string
  name: string
  description: string
  price: string
  isActive: boolean
  learnMoreUrl?: string
}

interface State {
  value: string
  label: string
}

const billingData: BillingItem[] = [
  {
    name: "Starter Tier (Start-Up Discount)¹",
    quantity: 1,
    unit: "$90",
    price: "$90",
  },
  {
    name: "Bank & CPA Integration",
    quantity: 1,
    unit: "$25",
    price: "$25",
  },
  {
    name: "Corporate Card (VISA World Elite)",
    quantity: 2,
    unit: "$45",
    price: "$90",
  },
]

const usageData: UsageItem[] = [
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
    name: "Bandwidth",
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

const paymentCards: PaymentCard[] = [
  {
    id: "card-1",
    provider: "MasterCard",
    type: "Credit",
    lastFour: "1234",
    expiryDate: "1/2028",
    isActive: true,
  },
]

const addOns: AddOn[] = [
  {
    id: "bot-protection",
    name: "Advanced bot protection",
    description: "Safeguard your assets with our cutting-edge bot protection. Our AI solution identifies and mitigates automated traffic to protect your workspace from bad bots.",
    price: "$25/month",
    isActive: false,
    learnMoreUrl: "#",
  },
  {
    id: "workspace-insights",
    name: "Workspace insights",
    description: "Real-time analysis of your workspace's usage, enabling you to make well-informed decisions for optimization.",
    price: "$50/month",
    isActive: false,
    learnMoreUrl: "#",
  },
]

const states: State[] = [
  { value: "colorado", label: "Colorado" },
  { value: "florida", label: "Florida" },
  { value: "georgia", label: "Georgia" },
  { value: "delaware", label: "Delaware" },
  { value: "hawaii", label: "Hawaii" },
]

export default function Billing() {
  const [isSpendMgmtEnabled, setIsSpendMgmtEnabled] = React.useState(true)
  const [isAddCardLoading, setIsAddCardLoading] = React.useState(false)
  const [isAddressLoading, setIsAddressLoading] = React.useState(false)
  const [isSpendControlLoading, setIsSpendControlLoading] = React.useState(false)
  const [activeAddOns, setActiveAddOns] = React.useState<Record<string, boolean>>({})

  const handleAddCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAddCardLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsAddCardLoading(false)
  }

  const handleUpdateAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAddressLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsAddressLoading(false)
  }

  const handleSpendControlUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSpendControlLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSpendControlLoading(false)
  }

  const handleAddOnToggle = (addOnId: string, isActive: boolean) => {
    setActiveAddOns(prev => ({ ...prev, [addOnId]: isActive }))
  }

  const subtotal = 205.00
  const vatRate = 0.077
  const vatAmount = subtotal * vatRate
  const total = subtotal + vatAmount
  const currentSpend = 280
  const spendLimit = 350
  const spendPercentage = (currentSpend / spendLimit) * 100

  return (
    <div className="space-y-10">
      <div className="rounded-lg bg-gray-50 p-6 ring-1 ring-inset ring-gray-200 dark:bg-gray-400/10 dark:ring-gray-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
          This workspace is currently on free plan
        </h4>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Boost your analytics and unlock advanced features with our premium plans.{" "}
          <a
            href="#"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
          >
            Compare plans
            <RiArrowRightUpLine className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </p>
      </div>

      <section aria-labelledby="billing-overview-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="billing-overview-heading"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Billing Overview
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Overview of current billing cycle based on fixed and on-demand charges.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <h3
                  id="current-cycle-heading"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-50"
                >
                  Current billing cycle (Aug 31 – Sep 30, 2024)
                </h3>
                <TableRoot className="mt-4" aria-labelledby="current-cycle-heading">
                  <Table variant="tremor">
                    <TableCaption variant="tremor" className="text-left text-xs">
                      ¹Includes 10,000 trackable expenses/month, USD 0.10 for each additional expense.
                    </TableCaption>
                    <TableHead variant="tremor">
                      <TableRow variant="tremor">
                        <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                          Item
                        </TableHeaderCell>
                        <TableHeaderCell variant="tremor" className="text-right text-xs font-medium uppercase">
                          Quantity
                        </TableHeaderCell>
                        <TableHeaderCell variant="tremor" className="text-right text-xs font-medium uppercase">
                          Unit price
                        </TableHeaderCell>
                        <TableHeaderCell variant="tremor" className="text-right text-xs font-medium uppercase">
                          Price
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody variant="tremor">
                      {billingData.map((item) => (
                        <TableRow key={item.name} variant="tremor">
                          <TableCell variant="tremor" className="py-2.5">
                            {item.name}
                          </TableCell>
                          <TableCell variant="tremor" className="py-2.5 text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell variant="tremor" className="py-2.5 text-right">
                            {item.unit}
                          </TableCell>
                          <TableCell variant="tremor" className="py-2.5 text-right">
                            {item.price}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFoot variant="tremor">
                      <TableRow variant="tremor">
                        <TableHeaderCell
                          scope="row"
                          colSpan={3}
                          variant="tremor"
                          className="pb-1.5 text-right font-normal text-gray-600 dark:text-gray-400"
                        >
                          Subtotal
                        </TableHeaderCell>
                        <TableCell variant="tremor" className="pb-1.5 text-right font-normal">
                          ${subtotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow variant="tremor">
                        <TableHeaderCell
                          scope="row"
                          colSpan={3}
                          variant="tremor"
                          className="py-1.5 text-right font-normal text-gray-600 dark:text-gray-400"
                        >
                          VAT (7.7%)
                        </TableHeaderCell>
                        <TableCell variant="tremor" className="py-1.5 text-right font-normal">
                          ${vatAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow variant="tremor">
                        <TableHeaderCell
                          scope="row"
                          colSpan={3}
                          variant="tremor"
                          className="py-1.5 text-right font-semibold"
                        >
                          Total
                        </TableHeaderCell>
                        <TableCell variant="tremor" className="py-1.5 text-right font-semibold text-gray-900 dark:text-gray-50">
                          ${total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFoot>
                  </Table>
                </TableRoot>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Usage breakdown (May 2024)
                </h3>
                <ul
                  role="list"
                  className="mt-4 w-full divide-y divide-gray-200 border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800"
                >
                  {usageData.map((item) => (
                    <li key={item.name} className="px-2 py-4 text-sm md:p-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-gray-50">
                            {item.name}
                          </p>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {item.value}
                          </p>
                        </div>
                        <div className="w-full md:w-2/3">
                          {item.percentageValue && (
                            <ProgressBar
                              value={item.percentageValue}
                              variant="default"
                              size="sm"
                              className="mt-2"
                              showAnimation
                            />
                          )}
                          <p className="mt-1 flex items-center justify-between text-xs text-gray-500">
                            <span>{item.description}</span>
                            <span>{item.capacity}</span>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-2 py-4 md:p-4">
                  <p className="flex items-center justify-between text-sm font-medium text-gray-900 dark:text-gray-50">
                    <span>Total for May 24</span>
                    <span className="font-semibold">${currentSpend}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section aria-labelledby="payment-method-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="payment-method-heading"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Payment method
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Payments will be taken from the card(s) listed below. You can add additional credit cards.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <h3
                id="cards-heading"
                className="text-sm font-semibold text-gray-900 dark:text-gray-50"
              >
                Cards
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="primary" className="gap-2">
                    <Plus className="-ml-1 size-4 shrink-0" aria-hidden="true" />
                    Add card
                  </Button>
                </DialogTrigger>
                <DialogContent variant="tremor" className="sm:max-w-lg">
                  <DialogHeader variant="tremor">
                    <DialogTitle variant="tremor">Add New Card</DialogTitle>
                    <DialogDescription variant="tremor" className="mt-1 text-sm leading-6">
                      Fill in the details below to add a new card.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCard} className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="cardName" className="font-medium">
                        Cardholder Name
                      </Label>
                      <Input
                        type="text"
                        id="cardName"
                        name="cardName"
                        variant="tremor"
                        className="mt-2"
                        placeholder="Cardholder Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="font-medium">
                        Card Number
                      </Label>
                      <Input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        variant="tremor"
                        className="mt-2"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="font-medium">
                          Expiry Date
                        </Label>
                        <Input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          variant="tremor"
                          className="mt-2"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="font-medium">
                          CVV
                        </Label>
                        <Input
                          type="text"
                          id="cvv"
                          name="cvv"
                          variant="tremor"
                          className="mt-2"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardType" className="font-medium">
                        Card Type
                      </Label>
                      <Select name="cardType">
                        <SelectTrigger id="cardType" variant="tremor" className="mt-2 w-full">
                          <SelectValue placeholder="Select Card Type" />
                        </SelectTrigger>
                        <SelectContent variant="tremor">
                          <SelectItem variant="tremor" value="credit">Credit</SelectItem>
                          <SelectItem variant="tremor" value="debit">Debit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter variant="tremor" className="mt-6">
                      <DialogClose asChild>
                        <Button
                          className="mt-2 w-full sm:mt-0 sm:w-fit"
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        className="w-full gap-2 sm:w-fit"
                        variant="primary"
                        type="submit"
                        isLoading={isAddCardLoading}
                        loadingText="Adding card..."
                      >
                        Add Card
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <TableRoot className="mt-4" aria-labelledby="cards-heading">
              <Table variant="tremor">
                <TableHead variant="tremor">
                  <TableRow variant="tremor">
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                      Provider
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                      Status
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                      Type
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                      Number (Last 4)
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase">
                      Exp. Date
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-right text-xs font-medium uppercase">
                      <span className="sr-only">Edit</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody variant="tremor">
                  {paymentCards.map((card) => (
                    <TableRow key={card.id} variant="tremor">
                      <TableCell variant="tremor" className="py-2.5">
                        {card.provider}
                      </TableCell>
                      <TableCell variant="tremor" className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <CircleCheck
                            className={cx(
                              "size-4",
                              card.isActive
                                ? "text-emerald-600 dark:text-emerald-500"
                                : "text-gray-400 dark:text-gray-600"
                            )}
                            aria-hidden="true"
                          />
                          <span>{card.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell variant="tremor" className="py-2.5">
                        {card.type}
                      </TableCell>
                      <TableCell variant="tremor" className="py-2.5">
                        ****{card.lastFour}
                      </TableCell>
                      <TableCell variant="tremor" className="py-2.5">
                        {card.expiryDate}
                      </TableCell>
                      <TableCell variant="tremor" className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                          aria-label={`Edit ${card.provider} ending in ${card.lastFour}`}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          </div>
        </div>
      </section>

      <Divider />

      <section aria-labelledby="cost-spend-control">
        <form onSubmit={handleSpendControlUpdate}>
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
            <div>
              <h2
                id="cost-spend-control"
                className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
              >
                Cost spend control
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Set hard caps for on-demand charges.
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ProgressCircle
                    value={isSpendMgmtEnabled ? spendPercentage : 0}
                    radius={20}
                    strokeWidth={4.5}
                    variant="default"
                    showAnimation
                  />
                  <div>
                    {isSpendMgmtEnabled ? (
                      <>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          ${currentSpend} / {spendLimit} ({spendPercentage.toFixed(1)}%)
                        </p>
                        <Label
                          htmlFor="spend-mgmt"
                          className="text-gray-500 dark:text-gray-500"
                        >
                          Spend management enabled
                        </Label>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          $0 / 0 (0%)
                        </p>
                        <Label
                          htmlFor="spend-mgmt"
                          className="text-gray-500 dark:text-gray-500"
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
                  variant="tremor"
                  checked={isSpendMgmtEnabled}
                  onCheckedChange={setIsSpendMgmtEnabled}
                />
              </div>
              <div
                className={cx(
                  "transform-gpu transition-all ease-[cubic-bezier(0.16,1,0.3,1.03)] will-change-transform overflow-hidden",
                  isSpendMgmtEnabled ? "h-52 md:h-32 opacity-100" : "h-0 opacity-0"
                )}
                style={{
                  transitionDuration: "300ms",
                  animationFillMode: "backwards",
                }}
              >
                <div
                  className={cx(
                    "animate-slideDownAndFade transition",
                    isSpendMgmtEnabled ? "" : "hidden"
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
                      <Label htmlFor="hard-cap" className="font-medium">
                        Set amount ($)
                      </Label>
                      <Input
                        id="hard-cap"
                        name="hard-cap"
                        defaultValue={spendLimit}
                        type="number"
                        variant="tremor"
                        className="mt-2"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notification-email" className="font-medium">
                        Provide email for notifications
                      </Label>
                      <Input
                        id="notification-email"
                        name="notification-email"
                        placeholder="admin@company.com"
                        type="email"
                        variant="tremor"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSpendControlLoading}
                      loadingText="Updating..."
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>

      <Divider />

      <section aria-labelledby="billing-address-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="billing-address-heading"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Billing address
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              If you would like to add a postal address to every invoice, enter it here.
            </p>
          </div>
          <div className="md:col-span-2">
            <h3
              id="update-address-heading"
              className="text-sm font-semibold text-gray-900 dark:text-gray-50"
            >
              Update address
            </h3>
            <form
              onSubmit={handleUpdateAddress}
              className="mt-6 space-y-4"
              aria-labelledby="update-address-heading"
            >
              <div>
                <Label htmlFor="address-line-1" className="font-medium">
                  Address line 1
                </Label>
                <Input
                  id="address-line-1"
                  name="address-line-1"
                  placeholder="Address line 1"
                  autoComplete="address-line1"
                  defaultValue="8272 Postal Way"
                  variant="tremor"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="address-line-2" className="font-medium">
                  Address line 2
                </Label>
                <Input
                  id="address-line-2"
                  name="address-line-2"
                  placeholder="Address line 2"
                  autoComplete="address-line2"
                  variant="tremor"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="city" className="font-medium">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  autoComplete="address-level2"
                  defaultValue="Denver"
                  variant="tremor"
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="state" className="font-medium">
                    State
                  </Label>
                  <Select defaultValue={states[0].value}>
                    <SelectTrigger id="state" name="state" variant="tremor" className="mt-2">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent variant="tremor">
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value} variant="tremor">
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postal-code" className="font-medium">
                    Postal code
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="postal-code"
                    name="postal-code"
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    defaultValue="63001"
                    variant="tremor"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAddressLoading}
                  loadingText="Updating..."
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Divider />

      <section aria-labelledby="add-ons">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="add-ons"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Add-Ons
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Additional services to boost your services.
            </p>
          </div>
          <div className="space-y-6 md:col-span-2">
            {addOns.map((addOn) => (
              <Card key={addOn.id} variant="tremor" className="overflow-hidden p-0">
                <div className="px-4 pb-6 pt-4">
                  <span className="text-sm text-gray-500">{addOn.price}</span>
                  <h4 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {addOn.name}
                  </h4>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {addOn.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={addOn.id}
                      name={addOn.id}
                      variant="tremor"
                      checked={activeAddOns[addOn.id] || addOn.isActive}
                      onCheckedChange={(checked) => handleAddOnToggle(addOn.id, checked)}
                    />
                    <Label htmlFor={addOn.id}>Activate</Label>
                  </div>
                  {addOn.learnMoreUrl && (
                    <a
                      href={addOn.learnMoreUrl}
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-500 dark:hover:text-indigo-400"
                    >
                      Learn more
                      <RiArrowRightUpLine className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}