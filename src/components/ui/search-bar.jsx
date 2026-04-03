"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

const SearchBar = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
      <input
        ref={ref}
        type="text"
        placeholder="Search..."
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
})
SearchBar.displayName = "SearchBar"

export { SearchBar }
