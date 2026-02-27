"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip } from "@/components/ui/tooltip"
import { ModalAddUser } from "@/components/dashboard/settings/ModalAddUser"
import { invitedUsers, roles, users } from "@/data/data"
import { RiAddLine, RiMore2Fill } from "@remixicon/react"

export default function Users() {
  return (
    <>
      <section aria-labelledby="existing-users">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3
              id="existing-users"
              className="scroll-mt-10 font-semibold text-foreground"
            >
              Users
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Workspace administrators can add, manage, and remove users.
            </p>
          </div>
          <ModalAddUser>
            <Button className="mt-4 w-full gap-2 sm:mt-0 sm:w-fit">
              <RiAddLine className="-ml-1 size-4 shrink-0" aria-hidden="true" />
              Add user
            </Button>
          </ModalAddUser>
        </div>
        <ul
          role="list"
          className="mt-6 divide-y divide-border"
        >
          {users.map((user) => (
            <li
              key={user.name}
              className="flex items-center justify-between gap-x-6 py-2.5"
            >
              <div className="flex items-center gap-x-4 truncate">
                <span
                  className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs text-card-foreground sm:flex"
                  aria-hidden="true"
                >
                  {user.initials}
                </span>
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "admin" ? (
                  <Tooltip
                    content="A workspace must have at least one admin"
                    className="max-w-44 text-xs"
                    sideOffset={5}
                    triggerAsChild={true}
                  >
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
                  </Tooltip>
                ) : (
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
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group size-8 hover:border hover:border-border hover:bg-muted data-[state=open]:border-border data-[state=open]:bg-muted"
                    >
                      <RiMore2Fill
                        className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem disabled={user.role === "admin"}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={user.role === "admin"}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-12" aria-labelledby="pending-invitations">
        <h2
          id="pending-invitations"
          className="scroll-mt-10 font-semibold text-foreground"
        >
          Pending invitations
        </h2>
        <ul
          role="list"
          className="mt-6 divide-y divide-border"
        >
          {invitedUsers.map((user) => (
            <li
              key={user.initials}
              className="flex items-center justify-between gap-x-6 py-2.5"
            >
              <div className="flex items-center gap-x-4">
                <span
                  className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-card text-xs text-card-foreground sm:flex"
                  aria-hidden="true"
                >
                  {user.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires in {user.expires} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group size-8 hover:border hover:border-border hover:bg-muted data-[state=open]:border-border data-[state=open]:bg-muted"
                    >
                      <RiMore2Fill
                        className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      className="text-destructive"
                      disabled={user.role === "admin"}
                    >
                      Revoke invitation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
