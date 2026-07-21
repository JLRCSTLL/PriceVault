import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "expiring" | "expired" | "no-offer" | "eol" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground":
            variant === "default",
          "border-transparent bg-[#00A651]/10 text-[#00A651]":
            variant === "active",
          "border-transparent bg-orange-100 text-orange-800":
            variant === "expiring",
          "border-transparent bg-[#ED1C24]/10 text-[#ED1C24]": variant === "expired",
          "border-transparent bg-slate-100 text-slate-800":
            variant === "no-offer",
          "border-transparent bg-purple-100 text-purple-800": variant === "eol",
          "text-foreground": variant === "outline",
        },
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
