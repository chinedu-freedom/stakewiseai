"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Tabs({ tabs = [], defaultTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultTab || tabs[0];

  const toKebab = (str) => str.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
  const fromKebab = (str) => str.replace(/-/g, " ");

  const handleTabChange = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", toKebab(tab));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex border-b border-gray-200 w-full sm:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = toKebab(tab) === currentTab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors cursor-pointer capitalize whitespace-nowrap",
                isActive
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
              )}
            >
              {tab}
            </button>
          )
        })}
      </div>
    </div>
  );
}
