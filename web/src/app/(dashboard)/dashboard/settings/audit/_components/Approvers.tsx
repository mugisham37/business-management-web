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
import { Badge } from "@/components/ui/Badge"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Tooltip, TooltipProvider } from "@/components/ui/Tooltip"
import { Alert } from "@/components/ui/Alert"
import { departments } from "@/data/data"
import { Plus, Trash2, Mail, Shield, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useState, useCallback } from "react"

const users = [
  {
    initials: "JM",
    name: "Jeff Mueller",
    email: "j.mueller@acme.com",
    permission: "All areas",
    status: "active" as const,
  },
  {
    initials: "RS",
    name: "Rebecca Show",
    email: "r.show@acme.com",
    permission: "Sales",
    status: "active" as const,
  },
  {
    initials: "MR",
    name: "Mike Ryder",
    email: "m.ryder@acme.com",
    permission: "Marketing",
    status: "pending" as const,
  },
  {
    initials: "LS",
    name: "Lena Shine",
    email: "l.shin@acme.com",
    permission: "Sales",
    status: "active" as const,
  },
  {
    initials: "MS",
    name: "Manuela Stone",
    email: "m.stone@acme.com",
    permission: "IT",
    status: "inactive" as const,
  },
]

export default function Approvers() {
  const [userList, setUserList] = useState(users)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    permission: "",
  })

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }, [error])

  const handleAddUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.permission) {
      setError("Please fill in all fields")
      return
    }

    if (userList.some(user => user.email === formData.email)) {
      setError("User with this email already exists")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser = {
        initials: formData.email.substring(0, 2).toUpperCase(),
        name: formData.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: formData.email,
        permission: formData.permission,
        status: "pending" as const,
      }

      setUserList(prev => [...prev, newUser])
      setFormData({ email: "", permission: "" })
      setSuccess("User added successfully and invitation sent")
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to add user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [formData, userList])

  const handleRemoveUser = useCallback(async (email: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUserList(prev => prev.filter(user => user.email !== email))
      setSuccess("User removed successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to remove user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handlePermissionChange = useCallback(async (email: string, newPermission: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setUserList(prev => prev.map(user => 
        user.email === email ? { ...user, permission: newPermission } : user
      ))
    } catch (err) {
      setError("Failed to update permission. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "inactive":
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "pending":
        return "warning"
      case "inactive":
        return "neutral"
      default:
        return "neutral"
    }
  }

  return (
    <TooltipProvider>
      <section aria-labelledby="approver-list-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="approver-list-heading"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              Approvers
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-500">
              Define people who can approve bills and expenses.
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Secure approval workflow</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {success && (
              <Alert className="mb-4" variant="default">
                <CheckCircle className="h-4 w-4" />
                <div>
                  <p className="text-sm">{success}</p>
                </div>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <h4 className="font-medium">Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </Alert>
            )}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3
                id="approvers-count"
                className="text-sm font-medium text-gray-900 dark:text-gray-50"
              >
                Users with approval rights
              </h3>
              <div className="flex items-center gap-4">
                <span
                  className="hidden text-sm text-gray-600 sm:block dark:text-gray-400"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {userList.length} approval users
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="primary" className="w-full gap-2 sm:w-fit">
                      <Plus
                        className="-ml-1 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      Add user
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg" variant="tremor">
                    <DialogHeader variant="tremor">
                      <DialogTitle variant="tremor">Add New User</DialogTitle>
                      <DialogDescription variant="tremor" className="mt-1 text-sm leading-6">
                        Fill in the details below to add a new user with approval rights.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="new-user-email" className="font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="new-user-email"
                          type="email"
                          name="email"
                          className="mt-2"
                          placeholder="user@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          variant="tremor"
                          hasError={!!error}
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          An invitation will be sent to this email address
                        </p>
                      </div>
                      
                      <div>
                        <Label
                          htmlFor="new-user-permission"
                          className="font-medium"
                        >
                          Permission Level
                        </Label>
                        <Select 
                          name="permission" 
                          value={formData.permission}
                          onValueChange={(value) => handleInputChange("permission", value)}
                        >
                          <SelectTrigger
                            id="new-user-permission"
                            className="mt-2 w-full"
                            variant="tremor"
                          >
                            <SelectValue placeholder="Select Permission Level" />
                          </SelectTrigger>
                          <SelectContent variant="tremor">
                            {departments.map((item) => (
                              <SelectItem key={item.value} value={item.label} variant="tremor">
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <DialogFooter variant="tremor" className="mt-6 gap-2">
                        <DialogClose asChild>
                          <Button
                            className="mt-2 w-full sm:mt-0 sm:w-fit"
                            variant="secondary"
                            type="button"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          className="w-full sm:w-fit"
                          variant="primary"
                          type="submit"
                          isLoading={isLoading}
                          loadingText="Adding..."
                        >
                          Add User
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <ul
              role="list"
              aria-labelledby="approvers-count"
              className="mt-6 divide-y divide-gray-200 dark:divide-gray-800"
            >
              {userList.map((item) => (
                <li
                  key={item.email}
                  className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row sm:py-3"
                >
                  <div className="flex w-full items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {item.name}
                        </p>
                        <Badge variant={getStatusVariant(item.status)} size="sm">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="h-3 w-3" />
                        {item.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex w-full items-center gap-3 sm:w-fit">
                    <Select 
                      defaultValue={item.permission}
                      onValueChange={(value) => handlePermissionChange(item.email, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className="w-full sm:w-40"
                        variant="tremor"
                        aria-label={`Change permission for ${item.name}`}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent variant="tremor">
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.label} variant="tremor">
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Tooltip content="Remove user">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="aspect-square p-3 text-gray-600 hover:border hover:border-gray-300 hover:bg-gray-50 hover:text-rose-500 sm:p-2.5 dark:text-gray-400 hover:dark:border-gray-800 hover:dark:bg-gray-900 hover:dark:text-rose-500"
                        onClick={() => handleRemoveUser(item.email)}
                        disabled={isLoading}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4 shrink-0" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}
