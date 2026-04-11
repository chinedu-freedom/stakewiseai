"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import UsersTable from "@/components/tables/UsersTable";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:bg-white rounded-xl border border-gray-100 shadow-sm"> */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:bg-transparent sm:rounded-none sm:border-0 sm:shadow-none">
        <h1 className="text-xl font-bold text-gray-800">User Management</h1>
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search users..."
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