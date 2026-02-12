import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cx } from "@/lib/utils"
import { CircleCheck } from "lucide-react"
import Image from "next/image"

const activity = [
  {
    id: 1,
    type: "submitted",
    person: { name: "Emily Ross" },
    date: "2d ago",
    dateTime: "2024-07-13T10:32",
  },
  {
    id: 2,
    type: "added",
    person: { name: "Emily Ross" },
    date: "1d ago",
    dateTime: "2024-07-14T11:03",
  },
  {
    id: 3,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=80&w=1887&auto=format&fit=facearea&&facepad=2&w=256&h=256",
    },
    comment:
      'Re-classified expense from category "Consultation services" to "Coffee shop"',
    date: "3d ago",
    dateTime: "2023-01-23T15:56",
  },
  {
    id: 4,
    type: "approved",
    person: { name: "Maxime River" },
    date: "10min ago",
    dateTime: "2024-07-15T09:01",
  },
]

export function DataTableDrawerFeed() {
  return (
    <>
      <ul role="list" className="space-y-6">
        {activity.map((activityItem, activityItemindex) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={cx(
                activityItemindex === activity.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center",
              )}
            >
              <span className="w-px bg-border" aria-hidden="true" />
            </div>
            {activityItem.type === "submitted" ||
              activityItem.type === "added" ? (
              <>
                <div className="relative flex size-6 flex-none items-center justify-center bg-card">
                  <div className="size-1.5 rounded-full bg-muted ring-1 ring-border" />
                </div>
                <p className="flex-auto py-0.5 text-xs leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activityItem.person.name}
                  </span>
                  {activityItem.type === "submitted" ? (
                    <> {activityItem.type} expense</>
                  ) : (
                    <> {activityItem.type} receipt to expense</>
                  )}
                </p>
                <time
                  dateTime={activityItem.dateTime}
                  className="flex-none py-0.5 text-xs leading-5 text-muted-foreground"
                >
                  {activityItem.date}
                </time>
              </>
            ) : activityItem.type === "commented" ? (
              <>
                <Image
                  alt="Profile Picture"
                  width={50}
                  height={50}
                  src={activityItem.person.imageUrl || ""}
                  className="relative mt-3 size-6 flex-none rounded-full bg-muted"
                />
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-border">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {activityItem.person.name}
                      </span>{" "}
                      commented
                    </div>
                    <time
                      dateTime={activityItem.dateTime}
                      className="flex-none py-0.5 text-xs leading-5 text-muted-foreground"
                    >
                      {activityItem.date}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {activityItem.comment}
                  </p>
                </div>
              </>
            ) : activityItem.type === "approved" ? (
              <>
                <div className="relative flex size-6 flex-none items-center justify-center bg-card">
                  <CircleCheck
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p className="flex-auto py-0.5 text-xs leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activityItem.person.name}
                  </span>{" "}
                  {activityItem.type} the audit.
                </p>
                <time
                  dateTime={activityItem.dateTime}
                  className="flex-none py-0.5 text-xs leading-5 text-muted-foreground"
                >
                  {activityItem.date}
                </time>
              </>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="flex gap-x-4">
        <Image
          alt="Profile Picture"
          width={50}
          height={50}
          src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1887&auto=format&fit=facearea&&facepad=2&w=256&h=256"
          className="size-6 flex-none rounded-full bg-muted"
        />
        <form action="#" className="relative flex-auto">
          <Label htmlFor="comment" className="sr-only">
            Add your comment
          </Label>
          <Textarea
            id="comment"
            name="comment"
            rows={4}
            placeholder="Add your comment..."
          />
        </form>
      </div>
    </>
  )
}
