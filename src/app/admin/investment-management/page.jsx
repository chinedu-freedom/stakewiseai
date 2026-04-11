"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import InvestmentTable from "@/components/tables/InvestmentTable"; // Renamed to reflect single type

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"> */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:bg-transparent sm:rounded-none sm:border-0 sm:shadow-none">

        <h1 className="text-xl font-bold text-gray-800">Investment Management</h1>
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search investments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <InvestmentTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}