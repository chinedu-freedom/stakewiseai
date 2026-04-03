"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Tabs from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import CryptoInvestmentTable from "@/components/tables/CryptoInvestmentTable";
import LoanInvestmentTable from "@/components/tables/LoanInvestmentTable";
import RealEstateInvestmentTable from "@/components/tables/RealEstateInvestmentTable";
import StocksBondsInvestmentTable from "@/components/tables/StocksBondsInvestmentTable";

export default function PlansManagementPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const tab = searchParams.get("tab") || "crypto";
  const tabs = ["Crypto", "Loans", "Real Estate", "Stocks & Bonds"];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between rounded-md p-4 bg-white">
        <h1 className="text-xl font-semibold">Financial Services</h1>
        <div className="w-90">
          <SearchBar
            placeholder="Search by Investment ID or User ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="crypto" />

      <div className="mt-4">
        {tab === "crypto" && (
          <CryptoInvestmentTable
            searchTerm={searchTerm}

          />
        )}
        {tab === "loans" && (
          <LoanInvestmentTable  
          searchTerm={searchTerm}

          />
        )}
        {tab === "real-estate" && (
          <RealEstateInvestmentTable
          searchTerm={searchTerm}

          />
        )}
        {tab === "stocks-&-bonds" && (
          <StocksBondsInvestmentTable
          searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
}
