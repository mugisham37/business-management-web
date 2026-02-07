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
  style,
}: {
  className?: string
  src: string
  width: number
  height: number
  alt: string
  caption: string
  style?: React.CSSProperties
}) {
  return (
    <figure
      className={cx(
        "h-fit overflow-hidden bg-card ring-1 ring-border transition-standard hover:-translate-y-0.5",
        className,
      )}
      style={{ 
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-xl)',
        ...style,
      }}
    >
      <div className="bg-muted p-2">
        <div className="relative overflow-hidden rounded">
          <div className="absolute inset-0 shadow-[inset_0px_0px_3px_0px_rgb(0,0,0,1)]"></div>
          <Image src={src} alt={alt} width={width} height={height} />
        </div>
      </div>
      <div
        className={cx(
          "px-2 pb-2 pt-2 font-handwriting text-xl text-muted-foreground",
        )}
      >
        <figcaption className="text-center">{caption}</figcaption>
      </div>
    </figure>
  )
}
