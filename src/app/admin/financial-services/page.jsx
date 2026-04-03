"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import InvestmentTable from "@/components/tables/InvestmentTable"; // Renamed to reflect single type

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between rounded-md p-4 bg-white">
        <h1 className="text-xl font-semibold">Investment Management</h1>
        <div className="w-90">
          <SearchBar
            placeholder="Search by Investment ID or User ID"
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