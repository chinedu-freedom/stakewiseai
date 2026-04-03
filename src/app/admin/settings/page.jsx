"use client";

import Tabs from "@/components/ui/tabs";
import ManageAccount from "./tabs/manage-account";
import ChangePassword from "./tabs/change-password";
import { useSearchParams } from "next/navigation";
import InviteAdmin from "./tabs/invite-admin";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "manage-account";
  const tabs = ["Manage Account", "Change Password", "Invite Admin"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Tabs tabs={tabs} defaultTab="manage-account" />

      <div className="mt-4">
        {tab === "manage-account" && <ManageAccount />}
        {tab === "change-password" && <ChangePassword />}
        {tab === "invite-admin" && <InviteAdmin />}
      </div>
    </div>
  );
}
