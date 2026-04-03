import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pb-0", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-gray-500 mt-1", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-3", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
