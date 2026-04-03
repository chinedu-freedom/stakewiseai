"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import PlansTable from "@/components/tables/PlansTable";
import { PlanDialog } from "@/components/modals/PlanDialog";

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between rounded-md p-4 bg-white">
        <h1 className="text-xl font-semibold">Plans Management</h1>
        <div className="w-80">
          <SearchBar
            placeholder="Search by Plan Title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="mt-4">
          <PlanDialog />
        </div>
      </div>

      <div className="mt-4">
        <PlansTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}