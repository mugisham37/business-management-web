import { cx } from "@/lib/utils"
import CopyToClipboard from "./copy_to_clipboard"

type Props = {
  code: string
  lang?: string
  filename?: string
  copy?: boolean
  className?: string
}

export default function Code({
  code,
  lang = "typescript",
  copy = false,
  filename,
  className,
}: Props) {
  return (
    <div
      className={cx(
        "relative w-full overflow-auto rounded-xl bg-card shadow-xl ring-1 ring-border",
        className,
      )}
    >
      {filename && (
        <div className="border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
          {filename}
        </div>
      )}

      {copy && (
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-card/0 via-card/70 to-card">
          <div className="absolute right-3 top-3">
            <CopyToClipboard code={code} />
          </div>
        </div>
      )}

      <pre className="overflow-x-auto py-6 pl-4 pr-5 text-sm leading-snug">
        <code className="block w-fit min-w-full font-mono text-foreground">
          {code}
        </code>
      </pre>
    </div>
  )
}
