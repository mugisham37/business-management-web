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
    className={clsx("text-3xl font-bold normal-case sm:text-4xl", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H2 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={2}
    className={clsx("mb-4 text-2xl font-semibold normal-case", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H3 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={3}
    className={clsx("mb-2 text-xl font-semibold normal-case", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H4 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={4}
    className={clsx("mb-2 text-lg font-semibold normal-case", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H5 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={5}
    className={clsx("mb-2 text-base font-semibold normal-case", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const H6 = ({ children, className, ...props }: React.HTMLProps<HTMLHeadingElement>) => (
  <CustomHeading
    level={6}
    className={clsx("mb-2 text-sm font-semibold normal-case", className)}
    style={{
      letterSpacing: "var(--tracking-tight)",
      color: "var(--foreground)",
    }}
    {...props}
  >
    {children}
  </CustomHeading>
)

export const P = ({ className, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
  <p 
    className={clsx("mb-8 leading-7", className)}
    style={{
      color: "var(--text-landing-body)",
    }}
    {...props} 
  />
)

export const Ul = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={clsx("mb-10 ml-[30px] list-['–__'] space-y-1 leading-8", className)}
    style={{
      color: "var(--text-landing-body)",
    }}
    {...props}
  />
)

export const Ol = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={clsx("mb-10 ml-[30px] list-decimal space-y-1 leading-8", className)}
    style={{
      color: "var(--text-landing-body)",
    }}
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
    className={clsx("font-semibold", className)}
    style={{
      color: "var(--foreground)",
    }}
    {...props} 
  />
)

export const Bold = Strong

export const Em = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <em 
    className={clsx("italic", className)}
    style={{
      color: "var(--muted-foreground)",
    }}
    {...props} 
  />
)

export const Code = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <code
    className={clsx("rounded px-1.5 py-0.5 text-sm font-mono", className)}
    style={{
      backgroundColor: "var(--muted)",
      color: "var(--foreground)",
    }}
    {...props}
  />
)

export const Pre = ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
  <pre
    className={clsx("mb-8 overflow-x-auto rounded-lg p-4 text-sm", className)}
    style={{
      backgroundColor: "var(--muted)",
    }}
    {...props}
  />
)

export const Blockquote = ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
  <blockquote
    className={clsx("mb-8 border-l-4 pl-4 italic", className)}
    style={{
      borderColor: "var(--primary)",
      color: "var(--muted-foreground)",
    }}
    {...props}
  />
)

export const Hr = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr
    className={clsx("my-12", className)}
    style={{
      borderColor: "var(--border)",
    }}
    {...props}
  />
)

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="mb-8 overflow-x-auto">
    <table
      className={clsx("min-w-full divide-y", className)}
      style={{
        borderColor: "var(--border)",
      }}
      {...props}
    />
  </div>
)

export const Thead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={clsx(className)}
    style={{
      backgroundColor: "var(--muted)",
    }}
    {...props}
  />
)

export const Tbody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody
    className={clsx("divide-y", className)}
    style={{
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    }}
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
    className={clsx("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", className)}
    style={{
      color: "var(--muted-foreground)",
    }}
    {...props}
  />
)

export const Td = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={clsx("whitespace-nowrap px-6 py-4 text-sm", className)}
    style={{
      color: "var(--foreground)",
    }}
    {...props}
  />
)

export function CustomLink({ href, className, children, ...props }: LinkProps) {
  if (!href) return <span {...props}>{children}</span>

  const linkStyles = "font-medium transition-colors"
  const combinedClassName = clsx(linkStyles, className)
  
  const linkStyle = {
    color: "var(--primary)",
    transition: "var(--transition-colors)",
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={combinedClassName} style={linkStyle} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={combinedClassName} style={linkStyle} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a 
      href={href} 
      className={combinedClassName}
      style={linkStyle}
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
  <article 
    className="relative flex flex-col justify-center md:flex-row"
    style={{
      marginTop: "var(--spacing-section-top)",
      marginBottom: "var(--spacing-section-top)",
      gap: "var(--spacing-gallery-row)",
      borderBottom: "1px solid var(--border)",
    }}
  >
    <header 
      className="md:w-1/3"
      style={{
        marginBottom: "var(--spacing-content-gap)",
      }}
    >
      <div 
        className="sticky flex items-center space-x-2 md:block md:space-x-0"
        style={{
          top: "var(--spacing-lg)",
          gap: "var(--spacing-xs)",
        }}
      >
        <span
          className="inline-flex items-center rounded-lg font-medium ring-1 ring-inset"
          style={{
            backgroundColor: "color-mix(in oklch, var(--primary) 10%, transparent)",
            color: "var(--primary)",
            padding: "var(--badge-padding-y-default) var(--badge-padding-x-default)",
            fontSize: "var(--text-badge)",
            borderRadius: "var(--radius-badge)",
            // @ts-ignore - CSS variable for ring color
            "--tw-ring-color": "color-mix(in oklch, var(--primary) 10%, transparent)",
          } as React.CSSProperties}
        >
          {version}
        </span>
        <time
          className="block whitespace-nowrap"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
            marginTop: "var(--spacing-xs)",
          }}
        >
          {date}
        </time>
      </div>
    </header>
    <div style={{ marginBottom: "var(--spacing-section-gap)" }}>
      {children}
    </div>
  </article>
)

export const ChangelogImage = ({ alt, width = 1200, height = 675, src, className, ...props }: ImageProps) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={clsx("mb-10 overflow-hidden ring-1", className)}
    style={{
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg)",
      // @ts-ignore - CSS variable for ring color
      "--tw-ring-color": "color-mix(in oklch, var(--border) 50%, transparent)",
    } as React.CSSProperties}
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
