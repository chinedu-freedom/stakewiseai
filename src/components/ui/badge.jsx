"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground ",
        secondary: "border-transparent bg-secondary text-secondary-foreground ",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground ",
        outline: "text-foreground border-foreground/20",
        success:
          "border-transparent bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, showDot = true, children, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant }), "gap-1.5", className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            variant === "success"
              ? "bg-green-500"
              : variant === "warning"
              ? "bg-yellow-500"
              : variant === "info"
              ? "bg-blue-500"
              : variant === "destructive"
              ? "bg-red-500"
              : "bg-current"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
