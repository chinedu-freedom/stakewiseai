"use client";

import { Suspense } from "react";
import Tabs from "@/components/ui/tabs";
import ManageAccount from "./tabs/manage-account";
import ChangePassword from "./tabs/change-password";
import { useSearchParams } from "next/navigation";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "manage-account";

  const tabs = ["Manage Account", "Change Password"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Tabs tabs={tabs} defaultTab="manage-account" />

      <div className="mt-4">
        {tab === "manage-account" && <ManageAccount />}
        {tab === "change-password" && <ChangePassword />}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}