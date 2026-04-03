"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Tabs from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import DepositTable from "@/components/tables/DepositTable";
import WithdrawalTable from "@/components/tables/WithdrawalTable";

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "deposits";
  const tabs = ["Deposits", "Withdrawals"];
  
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between rounded-md p-4 bg-white">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <div className="w-90">
          <SearchBar
            placeholder="Search by Transaction ID, User ID or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="deposits" />

      <div className="mt-4">
        {tab === "deposits" && <DepositTable searchTerm={searchTerm} />}
        {tab === "withdrawals" && <WithdrawalTable searchTerm={searchTerm} />}
      </div>
    </div>
  );
}
