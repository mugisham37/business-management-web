"use client"

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
} from "@/components/ui/Dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/ui/Table"
import { Tooltip } from "@/components/ui/Tooltip"
import { departments, invitedUsers, roles, users } from "@/data/data"
import { RiAddLine, RiDeleteBin6Line, RiMore2Fill, RiUserAddLine } from "@remixicon/react"

interface User {
  name: string
  initials: string
  email: string
  role: string
  dateAdded?: string
  lastActive?: string
  permission?: string
  status?: "active" | "pending"
}

export default function Users() {
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    role: "",
    permission: ""
  })
  const [errors, setErrors] = React.useState({
    email: false,
    role: false,
    permission: false
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = {
      email: !formData.email || !validateEmail(formData.email),
      role: !formData.role,
      permission: !formData.permission
    }
    
    setErrors(newErrors)
    
    if (newErrors.email || newErrors.role || newErrors.permission) {
      return
    }

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setFormData({ email: "", role: "", permission: "" })
      setErrors({ email: false, role: false, permission: false })
      setIsAddUserOpen(false)
    } catch (error) {
      console.error("Failed to add user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendInvitation = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Failed to resend invitation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeInvitation = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Failed to revoke invitation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors] && value) {
      if (field === "email" && !validateEmail(value)) return
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleOpenAddUser = () => {
    setIsAddUserOpen(true)
    setFormData({ email: "", role: "", permission: "" })
    setErrors({ email: false, role: false, permission: false })
  }

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const combinedUsers: User[] = [
    ...users.map(user => ({
      ...user,
      dateAdded: new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      }),
      lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      }),
      permission: user.role === "admin" ? "All areas" : departments[Math.floor(Math.random() * departments.length)].label,
      status: "active" as const
    })),
    ...invitedUsers.map(user => ({
      name: user.email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase()),
      initials: user.initials,
      email: user.email,
      role: user.role,
      dateAdded: new Date(Date.now() - user.expires * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      }),
      lastActive: "--",
      permission: "",
      status: "pending" as const
    }))
  ]

  return (
    <div className="space-y-8">
      <section aria-labelledby="users-heading">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="users-heading"
              className="scroll-mt-10 text-lg text-[length:var(--text-settings-section-heading)] font-[var(--font-settings-section-heading)] text-[var(--foreground)]"
            >
              User Management
            </h2>
            <p className="mt-2 text-[length:var(--text-settings-section-description)] leading-[var(--leading-settings-section-description)] text-[var(--muted-foreground)]">
              Invite team members to your workspace and manage their roles and permissions. 
              Control access levels to ensure proper security and collaboration.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3
                  id="active-users-heading"
                  className="text-sm font-medium text-gray-900 dark:text-gray-50"
                >
                  Team Members ({users.length} active, {invitedUsers.length} pending)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Manage user roles and permissions
                </p>
              </div>
              
              <Button 
                onClick={handleOpenAddUser}
                className="w-full gap-2 sm:w-fit"
                variant="primary"
              >
                <RiAddLine className="-ml-1 size-4 shrink-0" aria-hidden="true" />
                Add user
              </Button>
            </div>

            <TableRoot className="mt-6" aria-labelledby="active-users-heading">
              <Table variant="tremor" className="border-transparent dark:border-transparent">
                <TableHead variant="tremor">
                  <TableRow variant="tremor">
                    <TableHeaderCell 
                      variant="tremor" 
                      className="w-full text-xs font-medium uppercase tracking-wide"
                    >
                      User
                    </TableHeaderCell>
                    <TableHeaderCell 
                      variant="tremor" 
                      className="text-xs font-medium uppercase tracking-wide"
                      whitespaceNowrap
                    >
                      Date Added
                    </TableHeaderCell>
                    <TableHeaderCell 
                      variant="tremor" 
                      className="text-xs font-medium uppercase tracking-wide"
                      whitespaceNowrap
                    >
                      Last Active
                    </TableHeaderCell>
                    <TableHeaderCell 
                      variant="tremor" 
                      className="text-xs font-medium uppercase tracking-wide"
                    >
                      Role / Permission
                    </TableHeaderCell>
                    <TableHeaderCell variant="tremor" className="text-xs font-medium uppercase tracking-wide">
                      <span className="sr-only">Actions</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody variant="tremor">
                  {combinedUsers.map((user) => (
                    <TableRow key={`${user.email}-${user.status}`} variant="tremor">
                      <TableCell variant="tremor" className="w-full">
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex size-9 items-center justify-center rounded-full p-1.5 text-xs font-medium ${
                              user.status === "pending"
                                ? "border border-dashed border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-50"
                                : "bg-gray-50 text-gray-700 ring-1 ring-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:ring-gray-700"
                            }`}
                            aria-hidden="true"
                          >
                            {user.initials}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                                {user.name}
                              </p>
                              {user.status === "pending" && (
                                <span className="inline-flex items-center rounded-[var(--radius-settings-badge)] bg-[var(--user-status-pending)] px-[length:var(--badge-padding-x-sm)] py-[length:var(--badge-padding-y-sm)] text-[length:var(--text-settings-badge)] font-[var(--font-settings-subsection-heading)] text-[var(--status-warning-foreground)] ring-1 ring-inset ring-[var(--user-status-pending)]">
                                  Pending
                                </span>
                              )}
                              {user.role === "admin" && (
                                <span className="inline-flex items-center rounded-[var(--radius-settings-badge)] bg-[var(--nav-item-active-bg)] px-[length:var(--badge-padding-x-sm)] py-[length:var(--badge-padding-y-sm)] text-[length:var(--text-settings-badge)] font-[var(--font-settings-subsection-heading)] text-[var(--nav-item-active-text)] ring-1 ring-inset ring-[var(--nav-item-active-text)]">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell variant="tremor" whitespaceNowrap>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.dateAdded}
                        </span>
                      </TableCell>
                      
                      <TableCell variant="tremor" whitespaceNowrap>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.lastActive}
                        </span>
                      </TableCell>
                      
                      <TableCell variant="tremor">
                        {user.status === "pending" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleResendInvitation}
                            isLoading={isLoading}
                            className="w-full sm:w-32"
                          >
                            <RiUserAddLine className="size-4 shrink-0" aria-hidden="true" />
                            Resend
                          </Button>
                        ) : user.role === "admin" ? (
                          <Tooltip
                            content="Admin role cannot be changed. A workspace must have at least one admin."
                            variant="tremor"
                            side="top"
                            triggerAsChild
                          >
                            <div>
                              <Select 
                                defaultValue={user.role} 
                                disabled
                              >
                                <SelectTrigger 
                                  variant="tremor"
                                  className="w-full sm:w-32"
                                  aria-label={`Role for ${user.name} (disabled)`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent variant="tremor">
                                  {roles.map((role) => (
                                    <SelectItem 
                                      key={role.value} 
                                      value={role.value}
                                      variant="tremor"
                                    >
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </Tooltip>
                        ) : (
                          <Select 
                            defaultValue={user.role}
                          >
                            <SelectTrigger
                              variant="tremor"
                              className="w-full sm:w-32"
                              aria-label={`Change role for ${user.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent variant="tremor" align="end">
                              {roles.map((role) => (
                                <SelectItem 
                                  key={role.value} 
                                  value={role.value}
                                  variant="tremor"
                                  disabled={role.value === "admin"}
                                >
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      
                      <TableCell variant="tremor">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              aria-label={`More actions for ${user.name}`}
                            >
                              <RiMore2Fill className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              disabled={user.role === "admin"}
                            >
                              View profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={user.role === "admin"}
                            >
                              Edit permissions
                            </DropdownMenuItem>
                            {user.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={handleResendInvitation}
                                >
                                  Resend invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-500"
                                  onClick={handleRevokeInvitation}
                                >
                                  Revoke invitation
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.status === "active" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-500"
                                  disabled={user.role === "admin"}
                                  onClick={() => handleOpenDeleteDialog(user)}
                                >
                                  <RiDeleteBin6Line className="size-4 mr-2" aria-hidden="true" />
                                  Remove user
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableRoot>
          </div>
        </div>
      </section>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-lg" variant="tremor" showCloseButton={!isLoading}>
          <form onSubmit={handleAddUser}>
            <DialogHeader variant="tremor">
              <DialogTitle variant="tremor">Invite team member</DialogTitle>
              <DialogDescription variant="tremor" className="mt-1 text-sm leading-6">
                Add a new team member to your workspace. They will receive an email invitation 
                to join and can start collaborating immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="new-user-email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="Enter email address..."
                  className="mt-2"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  hasError={errors.email}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                    Please enter a valid email address
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="new-user-role" className="text-sm font-medium">
                  Role
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleFormChange("role", value)}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger
                    id="new-user-role"
                    className="mt-2"
                    hasError={errors.role}
                    variant="tremor"
                  >
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent variant="tremor">
                    {roles.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        variant="tremor"
                        disabled={role.value === "admin"}
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                    Please select a role
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="new-user-permission" className="text-sm font-medium">
                  Department access
                </Label>
                <Select 
                  value={formData.permission} 
                  onValueChange={(value) => handleFormChange("permission", value)}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger
                    id="new-user-permission"
                    className="mt-2"
                    hasError={errors.permission}
                    variant="tremor"
                  >
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent variant="tremor">
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept.value}
                        value={dept.value}
                        variant="tremor"
                      >
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.permission && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                    Please select department access
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter variant="tremor" className="mt-6">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full sm:mt-0 sm:w-fit"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-fit"
                isLoading={isLoading}
                loadingText="Sending invitation..."
                disabled={isLoading}
              >
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-lg" variant="tremor" showCloseButton={!isLoading}>
          <DialogHeader variant="tremor">
            <DialogTitle variant="tremor">Remove team member</DialogTitle>
            <DialogDescription variant="tremor" className="mt-1 text-sm leading-6">
              Are you sure you want to remove <strong>{selectedUser?.name}</strong> from your workspace? 
              They will lose access to all projects and data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter variant="tremor" className="mt-6">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 w-full sm:mt-0 sm:w-fit"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteUser}
              variant="destructive"
              className="w-full sm:w-fit"
              isLoading={isLoading}
              loadingText="Removing user..."
              disabled={isLoading}
            >
              Remove user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}