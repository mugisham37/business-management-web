import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { cx, focusRing } from "@/lib/utils"
import { RiNotification2Line } from "@remixicon/react"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"

interface Notification {
  id: string
  message: string
  date: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: "msg_j2k4l9m3",
    message:
      "We've updated the navigation to make it easier to find the things you use most.",
    date: "2024-10-17",
    read: false,
  },
  {
    id: "msg_h8n2p5r6",
    message:
      "We're updating our Privacy Policy, effective 16 January 2024. We're also updating our legal terms, effective 29 February 2024, and by keeping your account open after that date, you are agreeing to the updated terms.",
    date: "2023-12-28",
    read: false,
  },
  {
    id: "msg_t7v9w4x2",
    message: "New feature: Dark mode is now available across all platforms.",
    date: "2023-11-30",
    read: false,
  },
  {
    id: "msg_a3b5c7d9",
    message:
      "We're updating our legal terms effective 24 January 2023. By keeping your account open after that date, you are agreeing to the updated terms.",
    date: "2022-11-21",
    read: true,
  },
  {
    id: "msg_e2f4g6h8",
    message:
      "Introducing our new mobile app features for enhanced productivity.",
    date: "2022-09-15",
    read: true,
  },
  {
    id: "msg_k1l3m5n7",
    message: "Security update: We've added two-factor authentication support.",
    date: "2022-07-22",
    read: true,
  },
  {
    id: "msg_p8q2r4s6",
    message: "We're updating our Privacy Policy as of 3rd February 2022",
    date: "2022-01-06",
    read: true,
  },
  {
    id: "msg_u9v1w3x5",
    message: "New collaboration tools are now available in your workspace.",
    date: "2021-11-18",
    read: true,
  },
  {
    id: "msg_y7z9a2b4",
    message: "Platform maintenance scheduled for next weekend.",
    date: "2021-09-30",
    read: true,
  },
  {
    id: "msg_c6d8e1f3",
    message: "Check out our new tutorial series for advanced features.",
    date: "2021-08-15",
    read: true,
  },
  {
    id: "msg_g5h7i9j1",
    message: "Your annual subscription has been renewed successfully.",
    date: "2021-07-01",
    read: true,
  },
  {
    id: "msg_k2l4m6n8",
    message: "Important: Please update your payment information.",
    date: "2021-06-15",
    read: true,
  },
]

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const distance = formatDistanceToNow(date, { addSuffix: true })

  return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000
    ? distance
    : format(date, "d MMM yyyy")
}

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { message, date, read } = notification
  return (
    <li className="notification-item">
      <a
        href="#"
        className="notification-item-link focus-ring"
      >
        {/* Extend touch target to entire field */}
        <span aria-hidden="true" className="absolute inset-0" />
        <p 
          style={{ 
            fontSize: 'var(--text-notification-title)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--foreground)'
          }}
        >
          {!read && (
            <span
              aria-hidden="true"
              className="unread-indicator mb-px mr-1.5 sm:text-sm"
            />
          )}
          {message}
        </p>
        <p 
          style={{ 
            marginTop: 'var(--spacing-notification-item)',
            fontSize: 'var(--text-notification-meta)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--muted-foreground)'
          }}
        >
          {formatDate(date)}
        </p>
      </a>
    </li>
  )
}

const NotificationList = ({ showAll = false }: { showAll?: boolean }) => {
  const filteredNotifications = showAll
    ? notifications
    : notifications.filter(({ read }) => !read)

  return (
    <ol
      aria-label="Unread notifications"
      className="scrollable-container flex flex-col"
      style={{ 
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
        borderColor: 'var(--border)',
        gap: 'var(--spacing-notification-gap)'
      }}
    >
      {filteredNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ol>
  )
}

export function Notifications() {
  const unreadCount = notifications.filter(({ read }) => !read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          aria-label="open notifications"
          className={cx(
            focusRing,
            "interactive-button-base group",
          )}
          data-state="closed"
        >
          <span 
            className="avatar-circle relative"
            style={{
              width: 'var(--avatar-size-sm)',
              height: 'var(--avatar-size-sm)',
              padding: 'var(--spacing-xs)'
            }}
          >
            {unreadCount > 0 && (
              <span
                className="unread-indicator absolute"
                style={{ 
                  right: 'var(--spacing-xs)',
                  top: 'var(--spacing-xs)'
                }}
                aria-hidden="true"
              />
            )}
            <RiNotification2Line
              className="-ml-px shrink-0 group-hover:text-[var(--foreground)]"
              style={{ 
                width: 'var(--icon-size-settings-sm)',
                height: 'var(--icon-size-settings-sm)',
                color: 'var(--muted-foreground)',
                transition: 'var(--transition-colors)'
              }}
              aria-hidden="true"
            />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="z-20 max-w-[95vw]"
        style={{ 
          maxWidth: 'var(--container-max-width-sm)',
          marginLeft: 'var(--spacing-xs)',
          padding: 'var(--spacing-md)'
        }}
      >
        <div 
          className="flex items-center justify-between"
          style={{ gap: 'var(--spacing-lg)' }}
        >
          <h2 
            style={{ 
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--foreground)'
            }}
          >
            Notifications
          </h2>
          <Button variant="ghost">Mark {unreadCount} as read</Button>
        </div>
        <Tabs 
          defaultValue="unread" 
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          <TabsList className="grid w-full grid-cols-2" variant="solid">
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <TabsContent value="unread">
              <NotificationList />
            </TabsContent>
            <TabsContent value="all">
              <div className="relative">
                <NotificationList showAll />
                <div
                  className="gradient-overlay-bottom"
                  aria-hidden="true"
                />
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                View all
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
