"use client"

import { siteConfig } from "@/app/siteConfig"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpRight, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useAuth } from "@/foundation/providers/AuthProvider"
import { AuthUser } from "@/foundation/lib/auth/auth-manager"
import { toast } from "sonner"

export type DropdownUserProfileProps = {
  children: React.ReactNode
  align?: "center" | "start" | "end"
  user: AuthUser | null
}

export function DropdownUserProfile({
  children,
  align = "start",
  user,
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.push("/auth/login")
    } catch (error) {
      toast.error("Failed to logout. Please try again.")
    }
  }

  if (!mounted) {
    return null
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]"
        >
          <DropdownMenuLabel>{user?.email || "user@example.com"}</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value: string) => {
                    setTheme(value)
                  }}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to Light Mode"
                    value="light"
                  >
                    <Sun className="size-4 shrink-0" aria-hidden="true" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Dark Mode"
                    value="dark"
                  >
                    <Moon className="size-4 shrink-0" aria-hidden="true" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to System Mode"
                    value="system"
                  >
                    <Monitor className="size-4 shrink-0" aria-hidden="true" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Changelog
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Documentation
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Join Slack community
              <ArrowUpRight
                className="mb-1 ml-1 size-3 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
