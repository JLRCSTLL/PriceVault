import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "expiring" | "expired" | "no-offer" | "eol" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium transition-colors",
        {
          "border-foreground bg-foreground text-background":
            variant === "default",
          "border-border bg-background text-foreground":
            variant === "outline",
          "border-success bg-success text-success-foreground":
            variant === "active",
          "border-orange-400 bg-orange-50 text-orange-600":
            variant === "expiring",
          "border-destructive/30 bg-destructive/10 text-destructive":
            variant === "expired",
          "border-slate-400 bg-slate-50 text-slate-600":
            variant === "no-offer",
          "border-purple-400 bg-purple-50 text-purple-600": variant === "eol",
        },
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
