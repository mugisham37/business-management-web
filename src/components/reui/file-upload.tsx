"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesChange?: (files: File[]) => void
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ className, onFilesChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      onFilesChange?.(files)
      props.onChange?.(e)
    }

    return (
      <input
        type="file"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }
