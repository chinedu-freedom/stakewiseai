"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Tabs from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import CryptoPlansTable from "@/components/tables/CryptoPlansTable";
import RealEstatePlansTable from "@/components/tables/RealEstatePlansTable";
import LoanPlansTable from "@/components/tables/LoanPlansTable";
import StocksBondsPlansTable from "@/components/tables/StocksBondsPlansTable";
import { CryptoPlanDialog } from "@/components/modals/CryptoPlanDialog";
import { RealEstatePlanDialog } from "@/components/modals/RealEstatePlanDialog";
import { LoanPlanDialog } from "@/components/modals/LoanPlanDialog";
import { StocksBondsPlanDialog } from "@/components/modals/StocksBondsPlanDialog";

export default function PlansManagementPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const tab = searchParams.get("tab") || "crypto";
  const tabs = ["Crypto", "Real Estate", "Loans", "Stocks & Bonds"];

  const renderAddPlanDialog = () => {
    switch (tab) {
      case "crypto":
        return <CryptoPlanDialog />;
      case "real-estate":
        return <RealEstatePlanDialog />;
      case "loans":
        return <LoanPlanDialog />;
      case "stocks-&-bonds":
        return <StocksBondsPlanDialog />;
      default:
        return null;
    }
  };

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
        <Tabs tabs={tabs} defaultTab="crypto" />
        {renderAddPlanDialog()}
      </div>

      <div className="mt-4">
        {tab === "crypto" && <CryptoPlansTable searchTerm={searchTerm} />}
        {tab === "real-estate" && <RealEstatePlansTable searchTerm={searchTerm} />}
        {tab === "loans" && <LoanPlansTable searchTerm={searchTerm} />}
        {tab === "stocks-&-bonds" && (
          <StocksBondsPlansTable searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
}
