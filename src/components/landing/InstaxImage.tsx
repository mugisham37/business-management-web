"use client"
import { cx } from "@/lib/utils"
import Image from "next/image"

export function InstaxImage({
  className,
  src,
  width,
  height,
  alt,
  caption,
}: {
  className?: string
  src: string
  width: number
  height: number
  alt: string
  caption: string
}) {
  return (
    <figure
      className={cx(
        "h-fit overflow-hidden rounded-lg bg-card shadow-xl shadow-primary/10 ring-1 ring-border/5 transition hover:-translate-y-0.5 hover:shadow-primary/20 dark:bg-card dark:shadow-primary/5 dark:ring-border dark:hover:shadow-primary/20",
        className,
      )}
    >
      <div className="bg-muted p-2 dark:bg-card">
        <div className="relative overflow-hidden rounded">
          <div className="absolute inset-0 shadow-[inset_0px_0px_3px_0px_hsl(var(--foreground))]"></div>
          <Image src={src} alt={alt} width={width} height={height} />
        </div>
      </div>
      <div
        className={cx(
          "px-2 pb-2 pt-2 font-handwriting text-xl text-foreground",
        )}
      >
        <figcaption className="text-center">{caption}</figcaption>
      </div>
    </figure>
  )
}
