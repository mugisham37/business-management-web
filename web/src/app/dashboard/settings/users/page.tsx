"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { invitedUsers, roles, users } from "@/data/data"
import { RiAddLine, RiMore2Fill } from "@remixicon/react"

// Combine active users and pending invitations into a single dataset
const allUsers = [
  ...users.map((user) => ({
    ...user,
    status: "active" as const,
    dateAdded: "Jan 13, 2022", // Mock data - should come from backend
    lastActive: "Mar 2, 2024", // Mock data - should come from backend
  })),
  ...invitedUsers.map((user) => ({
    name: user.email.split("@")[0],
    initials: user.initials,
    email: user.email,
    role: user.role,
    status: "pending" as const,
    dateAdded: "Jul 14, 2024", // Mock data - should come from backend
    lastActive: "--",
    expires: user.expires,
  })),
]

export default function Users() {
  return (
    <section aria-labelledby="users-heading">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div>
          <h2
            id="users-heading"
            className="scroll-mt-10 font-semibold text-foreground"
          >
            Users
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Workspace administrators can add, manage, and remove users. Invite
            new members and assign roles to control access.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3
              id="users-list-heading"
              className="text-sm font-medium text-foreground"
            >
              All workspace members
            </h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 sm:w-fit">
                  <RiAddLine className="-ml-1 size-4 shrink-0" aria-hidden="true" />
                  Add user
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <form>
                  <DialogHeader>
                    <DialogTitle>Invite people to your workspace</DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-6">
                      With free plan, you can add up to 10 users to each workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="email-new-user" className="font-medium">
                        Email
                      </Label>
                      <Input
                        id="email-new-user"
                        name="email-new-user"
                        type="email"
                        placeholder="Insert email..."
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role-new-user" className="font-medium">
                        Select role
                      </Label>
                      <Select name="role-new-user">
                        <SelectTrigger
                          id="role-new-user"
                          className="mt-2"
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
                  </div>
                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button
                        className="mt-2 w-full sm:mt-0 sm:w-fit"
                        variant="secondary"
                      >
                        Go back
                      </Button>
                    </DialogClose>
                    <Button type="submit" className="w-full sm:w-fit">
                      Add user
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full">Name / Email</TableHead>
                  <TableHead>Date added</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell className="w-full">
                      <div className="flex items-center gap-x-4">
                        <span
                          className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                            user.status === "pending"
                              ? "border border-dashed border-border bg-background text-foreground"
                              : "border border-border bg-background text-foreground"
                          }`}
                          aria-hidden="true"
                        >
                          {user.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {user.name}
                            </p>
                            {user.status === "pending" && (
                              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                                pending
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                            {user.status === "pending" && user.expires && (
                              <span className="ml-1">
                                • Expires in {user.expires} days
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {user.dateAdded}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {user.lastActive}
                    </TableCell>
                    <TableCell>
                      {user.status === "pending" ? (
                        <Select defaultValue={user.role}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Select" />
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
                      ) : user.role === "admin" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Select
                                defaultValue={user.role}
                                disabled={user.role === "admin"}
                              >
                                <SelectTrigger className="h-8 w-32">
                                  <SelectValue placeholder="Select" />
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
                          </TooltipTrigger>
                          <TooltipContent className="max-w-44 text-xs" sideOffset={5}>
                            A workspace must have at least one admin
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Select defaultValue={user.role}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Select" />
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
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="group size-8 hover:border hover:border-border hover:bg-muted data-[state=open]:border-border data-[state=open]:bg-muted"
                            aria-label={`Actions for ${user.name}`}
                          >
                            <RiMore2Fill
                              className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                              aria-hidden="true"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {user.status === "pending" ? (
                            <>
                              <DropdownMenuItem>Resend invitation</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Revoke invitation
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem disabled={user.role === "admin"}>
                                View details
                              </DropdownMenuItem>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    disabled={user.role === "admin"}
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Please confirm</DialogTitle>
                                    <DialogDescription className="mt-1 text-sm leading-6">
                                      Are you sure you want to delete {user.name}?
                                      This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="mt-6">
                                    <DialogClose asChild>
                                      <Button
                                        className="mt-2 w-full sm:mt-0 sm:w-fit"
                                        variant="secondary"
                                      >
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button
                                        className="w-full sm:w-fit"
                                        variant="destructive"
                                      >
                                        Delete
                                      </Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
