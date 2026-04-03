"use client";

import React from "react";

export default function KeyValueList({ data = {}, className = "", gridLayout = false }) {
  if (gridLayout) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className={`space-y-1 ${value?.props?.className?.includes('md:col-span-2') ? 'md:col-span-2' : ''}`}
          >
            <div className="text-sm font-medium text-gray-700">{key}</div>
            <div className="text-sm text-gray-900">{value ?? "N/A"}</div>
          </div>
        ))}
      </div>
    );
  }

  // Original flex layout (backward compatible)
  return (
    <div className={`space-y-2 text-sm ${className}`}>
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between border-b border-gray-100 pb-1 last:border-none"
        >
          <span className="font-medium text-gray-600">{key}</span>
          <span className="text-gray-900 text-right">{value ?? "N/A"}</span>
        </div>
      ))}
    </div>
  );
}