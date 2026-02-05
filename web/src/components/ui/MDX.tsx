import clsx from "clsx"
import Image, { ImageProps } from "next/image"
import Link from "next/link"
import React from "react"

interface HeadingProps extends React.HTMLProps<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

interface ChangelogEntryProps {
  version: string
  date: string
  children: React.ReactNode
}

export function slugify(str: string): string {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function CustomHeading({ level, children, className, ...props }: HeadingProps) {
  const childrenText = React.Children.toArray(children).join('')
  const slug = slugify(childrenText)

  return React.createElement(
    `h${level}`,
    {
      id: slug,
      className: clsx("scroll-mt-36 md:scroll-mt-24 group relative", className),
      ...props,
    },
    React.createElement(
      "a",
      {
        href: `#${slug}`,
        className: "anchor-link absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity",
        "aria-label": `Link to ${childrenText}`,
      },
      "#"
    ),
    children
  )
}

export const H1 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={1}
    className={clsx("text-3xl font-bold normal-case tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H2 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={2}
    className={clsx("mb-4 text-2xl font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H3 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={3}
    className={clsx("mb-2 text-xl font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H4 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={4}
    className={clsx("mb-2 text-lg font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H5 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={5}
    className={clsx("mb-2 text-base font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H6 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={6}
    className={clsx("mb-2 text-sm font-semibold normal-case tracking-tight text-gray-900 dark:text-gray-50", className)}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const P = ({ className, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
  <p 
    className={clsx("mb-8 leading-7 text-gray-600 dark:text-gray-400", className)} 
    {...props} 
  />
)

export const Ul = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={clsx("mb-10 ml-[30px] list-['–__'] space-y-1 leading-8 text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
)

export const Ol = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={clsx("mb-10 ml-[30px] list-decimal space-y-1 leading-8 text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
)

export const Li = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    className={clsx("leading-7", className)}
    {...props}
  />
)

export const Strong = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <strong 
    className={clsx("font-semibold text-gray-900 dark:text-gray-50", className)} 
    {...props} 
  />
)

export const Bold = Strong

export const Em = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <em 
    className={clsx("italic text-gray-700 dark:text-gray-300", className)} 
    {...props} 
  />
)

export const Code = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <code
    className={clsx("rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800 dark:bg-gray-800 dark:text-gray-200", className)}
    {...props}
  />
)

export const Pre = ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
  <pre
    className={clsx("mb-8 overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900", className)}
    {...props}
  />
)

export const Blockquote = ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote
    className={clsx("mb-8 border-l-4 border-indigo-500 pl-4 italic text-gray-700 dark:text-gray-300", className)}
    {...props}
  />
)

export const Hr = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr
    className={clsx("my-12 border-gray-200 dark:border-gray-800", className)}
    {...props}
  />
)

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="mb-8 overflow-x-auto">
    <table
      className={clsx("min-w-full divide-y divide-gray-200 dark:divide-gray-800", className)}
      {...props}
    />
  </div>
)

export const Thead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={clsx("bg-gray-50 dark:bg-gray-900", className)}
    {...props}
  />
)

export const Tbody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody
    className={clsx("divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950", className)}
    {...props}
  />
)

export const Tr = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={clsx(className)}
    {...props}
  />
)

export const Th = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={clsx("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
)

export const Td = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={clsx("whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100", className)}
    {...props}
  />
)

export function CustomLink({ href, className, children, ...props }: LinkProps) {
  if (!href) return <span {...props}>{children}</span>

  const linkStyles = "text-indigo-600 font-medium hover:text-indigo-500 dark:text-indigo-500 hover:dark:text-indigo-400 transition-colors"
  const combinedClassName = clsx(linkStyles, className)

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={combinedClassName} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a 
      href={href} 
      className={combinedClassName} 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    >
      {children}
    </a>
  )
}

export const A = CustomLink

export const ChangelogEntry = ({ version, date, children }: ChangelogEntryProps) => (
  <article className="relative my-20 flex flex-col justify-center gap-x-14 border-b border-gray-200 md:flex-row dark:border-gray-800">
    <header className="mb-4 md:mb-10 md:w-1/3">
      <div className="sticky top-24 flex items-center space-x-2 md:block md:space-x-0 md:space-y-1.5">
        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/20 dark:text-indigo-400 dark:ring-indigo-400/10">
          {version}
        </span>
        <time className="block whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
          {date}
        </time>
      </div>
    </header>
    <div className="mb-12">{children}</div>
  </article>
)

export const ChangelogImage = ({ alt, width = 1200, height = 675, src, className, ...props }: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={clsx("mb-10 overflow-hidden rounded-xl shadow-md shadow-black/15 ring-1 ring-gray-200/50 dark:ring-gray-800", className)}
    {...props}
  />
)

export const Img = ChangelogImage

export default {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
  strong: Strong,
  b: Bold,
  em: Em,
  i: Em,
  code: Code,
  pre: Pre,
  blockquote: Blockquote,
  hr: Hr,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  a: A,
  img: Img,
  ChangelogEntry,
  ChangelogImage,
  slugify,
}
