import { cx } from "@/lib/utils"
import type { BundledLanguage, BundledTheme } from "shiki"
import { codeToHtml } from "shiki"
import CopyToClipboard from "./copy-to-clipboard"

interface CodeProps {
  code: string
  lang?: BundledLanguage
  theme?: BundledTheme
  filename?: string
  copy?: boolean
  className?: string
  showLineNumbers?: boolean
  maxHeight?: string
}

const DEFAULT_THEME: BundledTheme = "poimandres"
const DEFAULT_LANGUAGE: BundledLanguage = "typescript"

const AVAILABLE_THEMES = [
  "tokyo-night",
  "catppuccin-macchiato", 
  "min-dark",
  "poimandres",
  "github-dark",
  "github-light",
  "dracula",
  "nord",
] as const

export default async function Code({
  code,
  lang = DEFAULT_LANGUAGE,
  theme = DEFAULT_THEME,
  filename,
  copy = false,
  className,
  showLineNumbers = false,
  maxHeight,
}: CodeProps) {
  if (!code || typeof code !== "string") {
    return (
      <div className={cx(
        "relative w-full rounded-xl bg-gray-950 p-4 text-gray-400",
        className
      )}>
        <span className="text-sm">No code provided</span>
      </div>
    )
  }

  let html: string
  try {
    html = await codeToHtml(code.trim(), {
      lang,
      theme,
      transformers: showLineNumbers ? [
        {
          name: "line-numbers",
          pre(node) {
            this.addClassToHast(node, "line-numbers")
          }
        }
      ] : undefined,
    })
  } catch (error) {
    console.warn(`Failed to highlight code with language "${lang}":`, error)
    html = `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
  }

  const containerStyles = cx(
    "relative w-full overflow-auto rounded-xl bg-gray-950 shadow-xl shadow-black/40 ring-1 ring-black dark:shadow-indigo-900/30 dark:ring-white/5",
    className
  )

  const contentStyles = cx(
    "text-sm",
    "[&>pre]:overflow-x-auto [&>pre]:!bg-gray-950 [&>pre]:py-6 [&>pre]:leading-snug [&>pre]:dark:!bg-gray-950",
    "[&_code]:block [&_code]:w-fit [&_code]:min-w-full",
    copy ? "[&>pre]:pl-4 [&>pre]:pr-20" : "[&>pre]:px-4",
    showLineNumbers && "[&>pre]:pl-12",
    maxHeight && "max-h-96 overflow-y-auto"
  )

  return (
    <div 
      className={containerStyles}
      style={maxHeight ? { maxHeight } : undefined}
      role="region"
      aria-label={filename ? `Code block: ${filename}` : "Code block"}
    >
      {filename && (
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2">
          <span className="text-xs font-medium text-gray-300">{filename}</span>
          {copy && (
            <div className="flex items-center gap-2">
              <CopyToClipboard code={code} />
            </div>
          )}
        </div>
      )}

      {copy && !filename && (
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-gray-900/0 via-gray-900/70 to-gray-900 pointer-events-none">
          <div className="absolute right-3 top-3 pointer-events-auto">
            <CopyToClipboard code={code} />
          </div>
        </div>
      )}

      <div
        className={contentStyles}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export type { CodeProps }
export { AVAILABLE_THEMES, DEFAULT_THEME, DEFAULT_LANGUAGE }
