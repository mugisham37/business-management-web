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
    <figure className={cx("instax-image", className)}>
      <div className="instax-image-wrapper">
        <div className="instax-image-container">
          <div className="instax-image-overlay"></div>
          <Image src={src} alt={alt} width={width} height={height} />
        </div>
      </div>
      <div className="instax-image-caption-wrapper">
        <figcaption className="instax-image-caption">{caption}</figcaption>
      </div>
    </figure>
  )
}
