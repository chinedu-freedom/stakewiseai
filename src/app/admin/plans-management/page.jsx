"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import PlansTable from "@/components/tables/PlansTable";
// import { PlanDialog } from "@/components/modals/PlanDialog";
import { Button } from "@/components/ui/button";
import PlanDialog from "@/components/modals/PlanDialog";

export default function PlansManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:bg-transparent sm:rounded-none sm:border-0 sm:shadow-none">
        <h1 className="text-xl font-bold text-gray-800">Plans Management</h1>

        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="-mt-3 flex items-center justify-end">
        <Button
          onClick={() => {
            setSelectedPlan(null); // ensure it's create mode
            setOpen(true);
          }}
        >
          Create Plan
        </Button>
      </div>

      <div className="mt-4">
        <PlansTable
          searchTerm={searchTerm}
          onEdit={(plan) => {
            setSelectedPlan(plan);
            setOpen(true);
          }}
        />
      </div>

      <PlanDialog
        open={open}
        setOpen={setOpen}
        initialData={selectedPlan}
      />
    </div>
  );
}