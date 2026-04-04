"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchData, usePatch } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KeyValueList from "@/components/KeyValueList";
import {
  ArrowLeft,
  Eye,
  User,
  CreditCard,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState, useEffect } from "react";

const accountStatusOptions = [
  { value: "pending", label: "Pending", color: "text-yellow-600" },
  { value: "active", label: "Active", color: "text-green-600" },
  { value: "inactive", label: "Inactive", color: "text-gray-600" },
  { value: "suspended", label: "Suspended", color: "text-red-600" },
  { value: "deactivated", label: "Deactivated", color: "text-red-800" },
];

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [accountBalance, setAccountBalance] = useState("");

  const { data, isLoading } = useFetchData(
    `/api/admin/users/${id}`,
    `users/${id}`
  );
  const user = data?.data;

  // usePatch hook instead of manual fetch
  const updateUser = usePatch((id) => `/api/admin/users/${id}`, `users/${id}`);

  // Pre-fill current values when user data loads
  useEffect(() => {
    if (user) {
      setSelectedStatus(user.accountStatus || "");
      setAccountBalance(user.accountBalance?.toString() || "");
    }
  }, [user]);

  const handleUpdateUser = async () => {
    if (!selectedStatus && !accountBalance) {
      // Error handled by usePatch hook automatically
      return;
    }

    // Check if anything actually changed
    const statusChanged = selectedStatus !== user.accountStatus;
    const balanceChanged =
      accountBalance !== (user.accountBalance?.toString() || "");

    if (!statusChanged && !depositChanged) {
      // Error handled by usePatch hook automatically
      return;
    }

    try {
      const updateData = {};
      if (statusChanged) updateData.accountStatus = selectedStatus;
      if (balanceChanged)
        updateData.accountBalance = parseFloat(accountBalance);

      await updateUser.mutateAsync({
        id: id,
        data: updateData,
      });
    } catch (error) {
      // Error toast is handled by usePatch hook automatically
      console.error("Update error:", error);
    }
  };

  const handleClear = () => {
    // Reset to current user values instead of empty
    setSelectedStatus(user?.accountStatus || "");
    setAccountBalance(user?.accountBalance?.toString() || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested user could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = updateUser.isPending;
  const hasChanges =
    selectedStatus !== user.accountStatus ||
    accountBalance !== (user.accountBalance?.toString() || "");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
              {/* Back to Users */}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600">
                View and manage user account details
              </p>
            </div>
          </div>
          <Badge
            className={
              getStatusColor(user.accountStatus) + " text-sm px-3 py-1"
            }
          >
            {user.accountStatus?.toUpperCase() || "UNKNOWN"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Personal Information
                </CardTitle>
                <CardDescription>
                  User's personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Full Name": user.username,
                    Email: user.email,
                    "Phone Number": user.phoneNumber || "—",
                    "Email Verified": user.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        Not Verified
                      </Badge>
                    ),
                    "Member Since": new Date(user._createdAt).toLocaleString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      }
                    ),
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Account Information
                </CardTitle>
                <CardDescription>
                  Current account status and financial details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Account Status": (
                      <Badge className={getStatusColor(user.accountStatus)}>
                        {user.accountStatus}
                      </Badge>
                    ),
                    "Account Balance": user.accountBalance
                      ? formatCurrency(user.accountBalance)
                      : "₦0",
                    "Last Updated": user._updatedAt
                      ? new Date(user._updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "—",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* KYC Information - Simplified */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  KYC Verification
                </CardTitle>
                <CardDescription>Identity verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">KYC Status</p>
                      <p className="text-sm text-gray-600">
                        {user.kyc?._createdAt
                          ? `Submitted on ${new Date(
                              user.kyc._createdAt
                            ).toLocaleDateString("en-GB")}`
                          : "Not submitted"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(user.kyc?.status)}>
                      {user.kyc?.status || "Not Submitted"}
                    </Badge>
                    {user.kyc?._id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/admin/user-management/kyc/${user.kyc._id}`
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6 sticky top-6">
            {/* Update Account Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Account Actions</CardTitle>
                <CardDescription>
                  Update user account status and balance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 mb-1.5">
                    Account Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accountStatusOptions.map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="flex items-center gap-2"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Current:
                    <Badge
                      className={getStatusColor(user.accountStatus) + " ml-1"}
                    >
                      {user.accountStatus || "N/A"}
                    </Badge>
                  </p>
                </div>

                {/* Account Deposit Update */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Account Deposit
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={accountBalance || 0}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Current:{" "}
                    {user.accountBalance
                      ? formatCurrency(user.accountBalance)
                      : "₦0"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1"
                    disabled={isSubmitting || !hasChanges}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleUpdateUser}
                    disabled={isSubmitting || !hasChanges}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update User"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Member Since
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(user._createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Current Balance
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {user.accountBalance
                        ? formatCurrency(user.accountBalance)
                        : "₦0"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        KYC Status
                      </span>
                    </div>
                    <Badge
                      className={
                        getStatusColor(user.kyc?.status)
                      }
                    >
                      {user.kyc?.status || "Not Submitted"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
