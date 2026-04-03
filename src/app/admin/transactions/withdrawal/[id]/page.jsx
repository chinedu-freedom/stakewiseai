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
  Copy,
  CreditCard,
  Calendar,
  Loader2,
  Wallet,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const withdrawalStatusOptions = [
  { value: "pending", label: "Pend Withdrawal", color: "text-yellow-600" },
  { value: "successful", label: "Approve Withdrawal", color: "text-green-600" },
  { value: "failed", label: "Reject Withdrawal", color: "text-red-600" },
];

export default function WithdrawalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading } = useFetchData(
    `/api/admin/withdrawals/${id}`,
    `withdrawals/${id}`
  );
  const withdrawal = data?.data;

  // Use your usePatch hook
  const updateWithdrawal = usePatch(
    (id) => `/api/admin/withdrawals/${id}`,
    `withdrawals/${id}`
  );

  // Pre-fill current values when withdrawal data loads
  useEffect(() => {
    if (withdrawal) {
      setSelectedStatus(withdrawal.status || "");
    }
  }, [withdrawal]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return; // Error handled by usePatch hook
    }

    try {
      await updateWithdrawal.mutateAsync({
        id: id,
        data: { status: selectedStatus },
      });

      // Success toast and data refresh handled by usePatch hook
    } catch (error) {
      // Error toast handled by usePatch hook
      console.error("Update error:", error);
    }
  };

  const handleClear = () => {
    // Reset to current withdrawal values
    setSelectedStatus(withdrawal?.status || "");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Wallet address copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading withdrawal details...</p>
        </div>
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Withdrawal Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested withdrawal could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = updateWithdrawal.isPending;
  const hasChanges = selectedStatus !== withdrawal.status;
  const isActionDisabled =
    withdrawal.status === "successful" || withdrawal.status === "failed";

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
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Withdrawal Details
              </h1>
              <p className="text-gray-600">
                Review and process withdrawal request
              </p>
            </div>
          </div>
          <Badge
            className={getStatusColor(withdrawal.status) + " text-sm px-3 py-1"}
          >
            {withdrawal.status?.toUpperCase() || "PENDING"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Withdrawal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Withdrawal Information
                </CardTitle>
                <CardDescription>
                  Withdrawal details and payment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Withdrawal ID": withdrawal._id,
                    Amount: formatCurrency(withdrawal.amount),
                    Cryptocurrency: withdrawal.crypto,

                    Status: (
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    ),
                    Requested: new Date(withdrawal.requestedAt).toLocaleString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    "Last Updated": withdrawal._updatedAt
                      ? new Date(withdrawal._updatedAt).toLocaleString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "—",
                    "Wallet Address": (
                      <div className="flex items-center justify-between w-full gap-2 md:col-span-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded-xl">
                          {withdrawal.walletAddress}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(withdrawal.walletAddress)
                          }
                          className="flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </Button>
                      </div>
                    ),
                  }}
                  // gridLayout={true}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"

                />
              </CardContent>
            </Card>

            {/* User Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  User Information
                </CardTitle>
                <CardDescription>
                  User making the withdrawal request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": withdrawal.user?._id,
                    "Full Name": withdrawal.user?.fullName,
                    Email: withdrawal.user?.email,
                    "Phone Number": withdrawal.user?.phoneNumber || "—",
                    "Account Status": (
                      <Badge
                        className={getStatusColor(
                          withdrawal.user?.accountStatus
                        )}
                      >
                        {withdrawal.user?.accountStatus}
                      </Badge>
                    ),
                    "Current Balance": withdrawal.user?.accountBalance
                      ? formatCurrency(withdrawal.user.accountBalance)
                      : "₦0",
                    "Total Profit": withdrawal.user?.totalProfit
                      ? formatCurrency(withdrawal.user.totalProfit)
                      : "₦0",
                    "Member Since": withdrawal.user?._createdAt
                      ? new Date(withdrawal.user._createdAt).toLocaleDateString(
                          "en-GB"
                        )
                      : "—",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card className="shadow-sm border-0 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Payment Instructions
                </CardTitle>
                <CardDescription>
                  Steps to process this withdrawal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Copy Wallet Address
                      </p>
                      <p className="text-gray-600">
                        Click the "Copy" button next to the wallet address above
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Process Payment
                      </p>
                      <p className="text-gray-600">
                        Send{" "}
                        <strong>{formatCurrency(withdrawal.amount)}</strong> in{" "}
                        <strong>{withdrawal.crypto}</strong> to the copied
                        wallet address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Confirm Payment
                      </p>
                      <p className="text-gray-600">
                        Click "Approve Withdrawal" below to mark as successful
                        and update user balance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6 sticky top-6">
            {/* Status Update Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Withdrawal Actions</CardTitle>
                <CardDescription>Process withdrawal request</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Status Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Update Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                    disabled={isActionDisabled || isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {withdrawalStatusOptions.map((status) => (
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
                    Current:{" "}
                    <Badge
                      className={getStatusColor(withdrawal.status) + " ml-1"}
                    >
                      {withdrawal.status}
                    </Badge>
                  </p>
                  {isActionDisabled && (
                    <p className="text-xs text-yellow-600">
                      This withdrawal has been finalized and cannot be modified
                    </p>
                  )}
                </div>

                {/* Important Note */}
                {selectedStatus === "successful" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> Approving this withdrawal will
                      automatically deduct{" "}
                      <strong>{formatCurrency(withdrawal.amount)}</strong> from
                      the user's account deposit.
                    </p>
                  </div>
                )}

                {selectedStatus === "failed" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Rejecting this withdrawal will keep
                      the user's balance unchanged.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1"
                    disabled={isSubmitting || !hasChanges || isActionDisabled}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isSubmitting || !hasChanges || isActionDisabled}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        Updating
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      </>
                    ) : (
                      `Confirm ${
                        selectedStatus === "successful" ? "Approve" : "Reject"
                      }`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Withdrawal Amount
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Requested
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(withdrawal.requestedAt).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        User Balance
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {withdrawal.user?.accountBalance
                        ? formatCurrency(withdrawal.user.accountBalance)
                        : "₦0"}
                    </span>
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
