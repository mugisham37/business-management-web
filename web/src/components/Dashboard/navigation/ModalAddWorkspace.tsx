"use client"

import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
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
import { DropdownMenuItem } from "@/components/ui/DropdownMenu"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  RadioCardGroup,
  RadioCardIndicator,
  RadioCardItem,
} from "@/components/ui/RadioGroup"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

export interface DatabaseConfig {
  label: string
  value: string
  description: string
  isRecommended: boolean
}

export interface StarterKit {
  label: string
  value: string
  description?: string
}

export interface DatabaseRegion {
  label: string
  value: string
  description?: string
}

export interface WorkspaceFormData {
  workspaceName: string
  starterKit: string
  databaseRegion: string
  databaseConfig: string
}

export const databases: DatabaseConfig[] = [
  {
    label: "Base performance",
    value: "base-performance",
    description: "1/8 vCPU, 1 GB RAM",
    isRecommended: true,
  },
  {
    label: "Advanced performance",
    value: "advanced-performance",
    description: "1/4 vCPU, 2 GB RAM",
    isRecommended: false,
  },
  {
    label: "Turbo performance",
    value: "turbo-performance",
    description: "1/2 vCPU, 4 GB RAM",
    isRecommended: false,
  },
]

export const starterKits: StarterKit[] = [
  {
    label: "None - Empty workspace",
    value: "empty-workspace",
    description: "Start with a clean slate",
  },
  {
    label: "Commerce analytics",
    value: "commerce-analytics",
    description: "Pre-configured for e-commerce tracking",
  },
  {
    label: "Product analytics",
    value: "product-analytics",
    description: "Ready for product usage analytics",
  },
]

export const databaseRegions: DatabaseRegion[] = [
  {
    label: "europe-west-01",
    value: "europe-west-01",
    description: "Europe (Belgium)",
  },
  {
    label: "us-east-02",
    value: "us-east-02",
    description: "US East (Ohio)",
  },
  {
    label: "us-west-01",
    value: "us-west-01",
    description: "US West (Oregon)",
  },
]

export interface ModalAddWorkspaceProps {
  itemName: string
  onSelect?: () => void
  onOpenChange?: (open: boolean) => void
  onSubmit?: (data: WorkspaceFormData) => Promise<void> | void
  isLoading?: boolean
  maxWorkspaces?: number
  currentWorkspaceCount?: number
  disabled?: boolean
}

export function ModalAddWorkspace({
  itemName,
  onSelect,
  onOpenChange,
  onSubmit,
  isLoading = false,
  maxWorkspaces = 10,
  currentWorkspaceCount = 0,
  disabled = false,
}: ModalAddWorkspaceProps) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<WorkspaceFormData>({
    workspaceName: "",
    starterKit: starterKits[0].value,
    databaseRegion: databaseRegions[0].value,
    databaseConfig: databases[0].value,
  })
  const [errors, setErrors] = React.useState<Partial<WorkspaceFormData>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isAtMaxWorkspaces = currentWorkspaceCount >= maxWorkspaces

  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) {
      setErrors({})
    }
  }, [onOpenChange])

  const handleSelect = React.useCallback((event: Event) => {
    event.preventDefault()
    if (disabled || isAtMaxWorkspaces) return
    onSelect?.()
    setOpen(true)
  }, [onSelect, disabled, isAtMaxWorkspaces])

  const validateForm = React.useCallback((): boolean => {
    const newErrors: Partial<WorkspaceFormData> = {}

    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = "Workspace name is required"
    } else if (formData.workspaceName.length < 3) {
      newErrors.workspaceName = "Workspace name must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.workspaceName)) {
      newErrors.workspaceName = "Workspace name can only contain letters, numbers, underscores, and hyphens"
    }

    if (!formData.starterKit) {
      newErrors.starterKit = "Please select a starter kit"
    }

    if (!formData.databaseRegion) {
      newErrors.databaseRegion = "Please select a database region"
    }

    if (!formData.databaseConfig) {
      newErrors.databaseConfig = "Please select a database configuration"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = React.useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(formData)
      setFormData({
        workspaceName: "",
        starterKit: starterKits[0].value,
        databaseRegion: databaseRegions[0].value,
        databaseConfig: databases[0].value,
      })
      setOpen(false)
    } catch (error) {
      console.error("Failed to create workspace:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit, isSubmitting])

  const handleInputChange = React.useCallback((field: keyof WorkspaceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  const isFormLoading = isLoading || isSubmitting

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={handleSelect}
          disabled={disabled || isAtMaxWorkspaces}
          className="w-full"
        >
          {itemName}
          {isAtMaxWorkspaces && (
            <span className="ml-auto text-xs text-muted-foreground">
              ({currentWorkspaceCount}/{maxWorkspaces})
            </span>
          )}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl" aria-describedby="workspace-description">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add new workspace</DialogTitle>
            <DialogDescription id="workspace-description" className="mt-1 text-sm leading-6">
              With free plan, you can add up to {maxWorkspaces} workspaces. 
              {isAtMaxWorkspaces && " You have reached the maximum number of workspaces."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="form-field-container">
                <Label htmlFor="workspace-name" className="form-label-standard">
                  Workspace name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="workspace-name"
                  name="workspace-name"
                  type="text"
                  placeholder="my_workspace"
                  value={formData.workspaceName}
                  onChange={(e) => handleInputChange("workspaceName", e.target.value)}
                  hasError={!!errors.workspaceName}
                  disabled={isFormLoading}
                  aria-describedby={errors.workspaceName ? "workspace-name-error" : undefined}
                  required
                />
                {errors.workspaceName && (
                  <p id="workspace-name-error" className="text-xs text-destructive" role="alert">
                    {errors.workspaceName}
                  </p>
                )}
              </div>

              <div className="form-field-container">
                <Label htmlFor="starter-kit" className="form-label-standard">
                  Starter kit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.starterKit}
                  onValueChange={(value) => handleInputChange("starterKit", value)}
                  disabled={isFormLoading}
                  required
                >
                  <SelectTrigger
                    id="starter-kit"
                    name="starter-kit"
                    aria-describedby={errors.starterKit ? "starter-kit-error" : undefined}
                  >
                    <SelectValue placeholder="Select a starter kit" />
                  </SelectTrigger>
                  <SelectContent>
                    {starterKits.map((kit) => (
                      <SelectItem key={kit.value} value={kit.value}>
                        {kit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.starterKit && (
                  <p id="starter-kit-error" className="text-xs text-destructive" role="alert">
                    {errors.starterKit}
                  </p>
                )}
              </div>
            </div>

            <div className="form-field-container">
              <Label htmlFor="database-region" className="form-label-standard">
                Database region <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.databaseRegion}
                onValueChange={(value) => handleInputChange("databaseRegion", value)}
                disabled={isFormLoading}
                required
              >
                <SelectTrigger
                  id="database-region"
                  name="database-region"
                  aria-describedby="database-region-help"
                >
                  <SelectValue placeholder="Select a database region" />
                </SelectTrigger>
                <SelectContent>
                  {databaseRegions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      <div className="flex flex-col">
                        <span>{region.label}</span>
                        {region.description && (
                          <span className="text-xs text-muted-foreground">
                            {region.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="database-region-help" className="form-helper-text">
                For best performance, choose a region closest to your application.
              </p>
              {errors.databaseRegion && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.databaseRegion}
                </p>
              )}
            </div>

            <div className="form-field-container">
              <Label className="form-label-standard">
                Database configuration <span className="text-destructive">*</span>
              </Label>
              <RadioCardGroup
                value={formData.databaseConfig}
                onValueChange={(value) => handleInputChange("databaseConfig", value)}
                className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2"
                disabled={isFormLoading}
                aria-describedby="database-config-help"
                required
              >
                {databases.map((database) => (
                  <RadioCardItem 
                    key={database.value} 
                    value={database.value}
                    className="cursor-pointer transition-all hover:bg-accent/50"
                  >
                    <div className="flex items-start gap-3">
                      <RadioCardIndicator className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium leading-5">
                            {database.label}
                          </span>
                          {database.isRecommended && (
                            <Badge variant="success" size="sm">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {database.description}
                        </p>
                      </div>
                    </div>
                  </RadioCardItem>
                ))}
              </RadioCardGroup>
              <p id="database-config-help" className="form-helper-text">
                You can upgrade your database configuration later in workspace settings.
              </p>
              {errors.databaseConfig && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.databaseConfig}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8 gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={isFormLoading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isFormLoading || isAtMaxWorkspaces}
              isLoading={isFormLoading}
              loadingText="Creating workspace..."
            >
              {isFormLoading ? "Creating..." : "Add workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
