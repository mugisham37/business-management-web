import Image, { ImageProps } from "next/image"
import Link from "next/link"
import * as React from "react"

import { cn } from "@/lib/utils"

export function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
}

interface CustomHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  children: React.ReactNode
}

function CustomHeading({ level, className, children }: CustomHeadingProps) {
  const slug = slugify(
    typeof children === "string" ? children : String(children)
  )

  return React.createElement(
    `h${level}`,
    {
      id: slug,
      className: cn("scroll-mt-36 md:scroll-mt-24 inline-flex", className),
    },
    [
      React.createElement("a", {
        href: `#${slug}`,
        key: `link-${slug}`,
        className: "anchor-link",
      }),
    ],
    children
  )
}

export function H1({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <CustomHeading
      className={cn(
        "text-3xl font-bold normal-case tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50",
        className
      )}
      level={1}
    >
      {children}
    </CustomHeading>
  )
}

export function H2({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <CustomHeading
      className={cn(
        "mb-4 text-lg font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50",
        className
      )}
      level={2}
    >
      {children}
    </CustomHeading>
  )
}

export function H3({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <CustomHeading
      className={cn(
        "mb-2 font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50",
        className
      )}
      level={3}
    >
      {children}
    </CustomHeading>
  )
}

export function P({
  className,
  ...props
}: React.HTMLProps<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mb-8 leading-7 text-gray-600 dark:text-gray-400", className)}
      {...props}
    />
  )
}

export function Ul({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "mb-10 ml-[30px] list-['–__'] space-y-1 leading-8 text-gray-600 dark:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

export function Bold({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-semibold text-gray-900 dark:text-gray-50", className)}
      {...props}
    />
  )
}

interface CustomLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

export function CustomLink({ href, className, ...props }: CustomLinkProps) {
  const linkClassName = cn(
    "text-indigo-600 font-medium hover:text-indigo-500 dark:text-indigo-500 hover:dark:text-indigo-400",
    className
  )

  if (href.startsWith("/")) {
    return <Link className={linkClassName} href={href} {...props} />
  }

  if (href.startsWith("#")) {
    return <a href={href} className={linkClassName} {...props} />
  }

  return (
    <a
      href={href}
      className={linkClassName}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  )
}

interface ChangelogEntryProps {
  version: string
  date: string
  children: React.ReactNode
}

export function ChangelogEntry({
  version,
  date,
  children,
}: ChangelogEntryProps) {
  return (
    <div className="relative my-20 flex flex-col justify-center gap-x-14 border-b border-gray-200 md:flex-row dark:border-gray-800">
      <div className="mb-4 md:mb-10 md:w-1/3">
        <div className="sticky top-24 flex items-center space-x-2 md:block md:space-x-0 md:space-y-1.5">
          <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/20 dark:text-indigo-400 dark:ring-indigo-400/10">
            {version}
          </span>
          <span className="block whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
            {date}
          </span>
        </div>
      </div>
      <div className="mb-12">{children}</div>
    </div>
  )
}

export function ChangelogImage({
  alt,
  width = 1200,
  height = 675,
  src,
  className,
  ...props
}: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        "mb-10 overflow-hidden rounded-xl shadow-md shadow-black/15 ring-1 ring-gray-200/50 dark:ring-gray-800",
        className
      )}
      {...props}
    />
  )
}
