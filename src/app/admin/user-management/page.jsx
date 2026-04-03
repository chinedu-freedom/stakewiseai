"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import UsersTable from "@/components/tables/UsersTable";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

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

      <div className="mt-4">
        <UsersTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}