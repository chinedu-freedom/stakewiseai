"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import DepositTable from "@/components/tables/DepositTable";
import WithdrawalTable from "@/components/tables/WithdrawalTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "deposits";
  const tabs = ["Deposits", "Withdrawals"];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:bg-transparent sm:rounded-none sm:border-0 sm:shadow-none">

        <h1 className="text-xl font-bold text-gray-800">Transactions</h1>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-80">
            <SearchBar
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="deposits" />

      <div className="mt-4">
        {tab === "deposits" && <DepositTable searchTerm={searchTerm} statusFilter={statusFilter} />}
        {tab === "withdrawals" && <WithdrawalTable searchTerm={searchTerm} statusFilter={statusFilter} />}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}