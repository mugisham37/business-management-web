import * as React from "react"
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
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { roles } from "@/data/data"

export type ModalAddUserProps = {
  children: React.ReactNode
}

export function ModalAddUser({ children }: ModalAddUserProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    role: ""
  })
  const [errors, setErrors] = React.useState({
    email: false,
    role: false
  })
  const [open, setOpen] = React.useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = {
      email: !formData.email || !validateEmail(formData.email),
      role: !formData.role
    }
    
    setErrors(newErrors)
    
    if (newErrors.email || newErrors.role) {
      return
    }

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setFormData({ email: "", role: "" })
      setErrors({ email: false, role: false })
      setOpen(false)
    } catch (error) {
      console.error("Failed to add user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, email: value }))
    if (errors.email && value && validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: false }))
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
    if (errors.role && value) {
      setErrors(prev => ({ ...prev, role: false }))
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setFormData({ email: "", role: "" })
      setErrors({ email: false, role: false })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isLoading}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite people to your workspace</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              With free plan, you can add up to 10 users to each workspace.
            </DialogDescription>
            <div className="mt-4">
              <Label 
                htmlFor="email-new-user" 
                className="font-medium"
                disabled={isLoading}
              >
                Email
              </Label>
              <Input
                id="email-new-user"
                name="email-new-user"
                type="email"
                placeholder="Insert email..."
                className="mt-2"
                value={formData.email}
                onChange={handleEmailChange}
                hasError={errors.email}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
            <div className="mt-4">
              <Label 
                htmlFor="role-new-user" 
                className="font-medium"
                disabled={isLoading}
              >
                Select role
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
                disabled={isLoading}
                required
              >
                <SelectTrigger
                  id="role-new-user"
                  name="role-new-user"
                  className="mt-2"
                  hasError={errors.role}
                >
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent align="end">
                  {roles.map((role) => (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                      disabled={role.value === "admin"}
                    >
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button
                className="mt-2 w-full sm:mt-0 sm:w-fit"
                variant="secondary"
                disabled={isLoading}
                type="button"
              >
                Go back
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="w-full sm:w-fit"
              isLoading={isLoading}
              loadingText="Adding user..."
              disabled={isLoading}
            >
              Add user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
