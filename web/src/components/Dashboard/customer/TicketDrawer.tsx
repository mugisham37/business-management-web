"use client"
import { Button } from "@/components/ui/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer"
import { RadioCardGroup, RadioCardItem } from "@/components/ui/RadioGroup"
import {
  Select,
  SelectContent,
  SelectItemExtended,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  categoryTypes,
  policyTypes,
  priorities,
  ticketTypes,
  type Category,
  type PolicyType,
  type Ticket,
} from "@/data/support/schema"
import React from "react"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/TextArea"

type TicketFormData = Partial<Ticket>

interface TicketDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormPageProps {
  formData: TicketFormData
  onUpdateForm: (updates: Partial<TicketFormData>) => void
}

const SummaryItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) => (
  <div className="ticket-summary-item">
    <p className="ticket-summary-label">
      {label}
    </p>
    <p className="ticket-summary-value">{value ?? "Not provided"}</p>
  </div>
)

const FormField = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="form-field-container">
    <Label className="form-label-standard">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
)

const FirstPage = ({ formData, onUpdateForm }: FormPageProps) => (
  <>
    <DrawerHeader>
      <DrawerTitle>
        <p>Create Support Ticket</p>
        <span className="text-sm font-normal text-[var(--muted-foreground)]">
          Ticket Type & Category
        </span>
      </DrawerTitle>
    </DrawerHeader>
    <DrawerBody className="ticket-drawer-body space-y-6 overflow-y-scroll">
      <FormField label="Contact Type">
        <RadioCardGroup
          defaultValue={formData.type}
          className="ticket-form-radio-grid-2"
          onValueChange={(value: string) => onUpdateForm({ type: value })}
        >
          {ticketTypes.map((type) => (
            <RadioCardItem
              key={type.value}
              value={type.value}
              className="ticket-radio-card focus-ring-blue data-[state=checked]:checked-state"
            >
              {type.name}
              <span className="ticket-radio-card-description">
                {type.extended}
              </span>
            </RadioCardItem>
          ))}
        </RadioCardGroup>
      </FormField>

      <FormField label="Category">
        <Select
          value={formData.category}
          onValueChange={(value: Category) => onUpdateForm({ category: value })}
        >
          <SelectTrigger variant="tremor">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent variant="tremor">
            {categoryTypes.map((category) => (
              <SelectItemExtended
                key={category.value}
                value={category.value}
                option={category.name}
                description={category.description}
              />
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Policy Type">
        <Select
          value={formData.policyType}
          onValueChange={(value: PolicyType) =>
            onUpdateForm({ policyType: value })
          }
        >
          <SelectTrigger variant="tremor">
            <SelectValue placeholder="Select Policy Type" />
          </SelectTrigger>
          <SelectContent variant="tremor">
            {policyTypes.map((type) => (
              <SelectItemExtended
                key={type.value}
                value={type.value}
                option={type.name}
                description={type.description}
              />
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Policy Number">
        <Input
          variant="tremor"
          disabled
          name="policyNumber"
          value={formData.policyNumber}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateForm({ policyNumber: e.target.value })}
          placeholder="Auto generated"
        />
      </FormField>
    </DrawerBody>
  </>
)

const SecondPage = ({ formData, onUpdateForm }: FormPageProps) => (
  <>
    <DrawerHeader>
      <DrawerTitle>
        <p>Ticket Details</p>
        <span className="text-sm font-normal text-[var(--muted-foreground)]">
          Priority & Description
        </span>
      </DrawerTitle>
    </DrawerHeader>
    <DrawerBody className="ticket-drawer-body space-y-6 overflow-y-scroll">
      <FormField label="Priority Level">
        <RadioCardGroup
          defaultValue={formData.priority}
          className="ticket-form-radio-grid-1"
          onValueChange={(value: string) => onUpdateForm({ priority: value })}
        >
          {priorities.map((priority) => (
            <RadioCardItem
              key={priority.value}
              value={priority.value}
              className="ticket-radio-card focus-ring-blue data-[state=checked]:checked-state"
            >
              <div className="flex items-center justify-between">
                <span>{priority.label}</span>
                <span className="ticket-radio-card-description">
                  SLA: {priority.sla}
                </span>
              </div>
              <span className="ticket-radio-card-description">
                {priority.description}
              </span>
            </RadioCardItem>
          ))}
        </RadioCardGroup>
      </FormField>

      <FormField label="Description">
        <Textarea
          variant="tremor"
          name="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdateForm({ description: e.target.value })}
          placeholder="Detailed description of the issue..."
          className="h-32"
        />
      </FormField>

      <FormField label="Expected Call Duration (minutes)">
        <Input
          variant="tremor"
          name="duration"
          type="number"
          enableStepper={true}
          value={formData.duration || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onUpdateForm({ duration: e.target.value || null })
          }}
          placeholder="0"
          min="0"
        />
      </FormField>
    </DrawerBody>
  </>
)

const SummaryPage = ({ formData }: { formData: TicketFormData }) => (
  <>
    <DrawerHeader>
      <DrawerTitle>
        <p>Review Ticket</p>
        <span className="text-sm font-normal text-[var(--muted-foreground)]">
          Please review all details before submitting
        </span>
      </DrawerTitle>
    </DrawerHeader>
    <DrawerBody className="ticket-drawer-body space-y-4 overflow-y-scroll">
      <div className="ticket-summary-section">
        <div className="ticket-summary-header">
          <h3 className="font-medium">Ticket Information</h3>
          <div className="mt-4 space-y-4">
            <SummaryItem
              label="Type"
              value={
                ticketTypes.find((t) => t.value === formData.type)?.name ??
                undefined
              }
            />
            <SummaryItem
              label="Category"
              value={
                categoryTypes.find((c) => c.value === formData.category)
                  ?.name ?? undefined
              }
            />
            <SummaryItem
              label="Policy Type"
              value={
                policyTypes.find((p) => p.value === formData.policyType)
                  ?.name ?? undefined
              }
            />
            <SummaryItem
              label="Priority"
              value={
                priorities.find((p) => p.value === formData.priority)?.label ??
                undefined
              }
            />
          </div>
        </div>
        <div className="ticket-summary-body">
          <h3 className="font-medium">Details</h3>
          <div className="mt-4 space-y-4">
            <SummaryItem
              label="Description"
              value={formData.description || undefined}
            />
            <SummaryItem
              label="Call Duration"
              value={
                formData.duration
                  ? `${formData.duration} minute${formData.duration === "1" ? "" : "s"}`
                  : undefined
              }
            />
            <SummaryItem
              label="Created"
              value={
                formData.created
                  ? new Date(formData.created).toLocaleString()
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </DrawerBody>
  </>
)

export function TicketDrawer({ open, onOpenChange }: TicketDrawerProps) {
  const [formData, setFormData] = React.useState<TicketFormData>({
    status: "in-progress",
    category: categoryTypes[0].value,
    type: ticketTypes[0].value,
    policyType: policyTypes[0].value,
    priority: priorities[0].value,
    description: "",
    policyNumber: "",
    duration: "0",
    created: new Date().toISOString(),
  })

  const [currentPage, setCurrentPage] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleUpdateForm = (updates: Partial<TicketFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log("Ticket created:", formData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      onOpenChange(false)
      setCurrentPage(1)
      setFormData({
        status: "in-progress",
        category: categoryTypes[0].value,
        type: ticketTypes[0].value,
        policyType: policyTypes[0].value,
        priority: priorities[0].value,
        description: "",
        policyNumber: "",
        duration: "0",
        created: new Date().toISOString(),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <FirstPage formData={formData} onUpdateForm={handleUpdateForm} />
      case 2:
        return (
          <SecondPage formData={formData} onUpdateForm={handleUpdateForm} />
        )
      case 3:
        return <SummaryPage formData={formData} />
      default:
        return null
    }
  }

  const renderFooter = () => {
    if (currentPage === 1) {
      return (
        <>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button 
            variant="primary"
            onClick={() => setCurrentPage(2)}
          >
            Continue
          </Button>
        </>
      )
    }
    if (currentPage === 2) {
      return (
        <>
          <Button 
            variant="secondary" 
            onClick={() => setCurrentPage(1)}
          >
            Back
          </Button>
          <Button 
            variant="primary"
            onClick={() => setCurrentPage(3)}
          >
            Review
          </Button>
        </>
      )
    }
    return (
      <>
        <Button 
          variant="secondary" 
          onClick={() => setCurrentPage(2)}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Creating Ticket..."
        >
          Create Ticket
        </Button>
      </>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="ticket-drawer-content">
        {renderPage()}
        <DrawerFooter className="ticket-drawer-footer">
          {renderFooter()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}