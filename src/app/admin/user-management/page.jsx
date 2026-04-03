"use client";

import { useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/tabs";
import { SearchBar } from "@/components/ui/search-bar";
import { Pagination } from "@/components/ui/pagination";
import AllUsersTable from "@/components/tables/UsersTable";
import KycVerificationTable from "@/components/tables/KycVerificationTable";
import { useState } from "react";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "all-users";
  const tabs = ["All Users", "KYC/Verification"];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between rounded-md p-4 bg-white">
        <h1 className="text-xl font-semibold">User Management</h1>
        <div className="w-90">
          <SearchBar
            placeholder="Search by Name, Email or User ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="all-users" />

      {tab === "kyc-verification" ? (
        <KycVerificationTable searchTerm={searchTerm} />
      ) : (
        <AllUsersTable searchTerm={searchTerm} />
      )}

      <Pagination current={1} total={78} />
    </div>
  );
}
