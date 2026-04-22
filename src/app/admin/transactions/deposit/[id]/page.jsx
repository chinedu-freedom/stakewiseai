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
  Eye,
  CreditCard,
  User,
  Calendar,
  Loader2,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState, useEffect } from "react";

const depositStatusOptions = [
  { value: "pending", label: "Pend Deposit", color: "text-yellow-600" },
  { value: "successful", label: "Approve Deposit", color: "text-green-600" },
  { value: "failed", label: "Reject Deposit", color: "text-red-600" },
];

export default function DepositDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading } = useFetchData(
    `/api/admin/deposits/${id}`,
    `deposits/${id}`
  );
  const deposit = data?.data;

  // Use your usePatch hook
  const updateDeposit = usePatch(
    (id) => `/api/admin/deposits/${id}`,
    `deposits/${id}`

  );

  // Pre-fill current values when deposit data loads
  useEffect(() => {
    if (deposit) {
      setSelectedStatus(deposit.status || "");
    }
  }, [deposit]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return; // Error handled by usePatch hook
    }

    try {
      await updateDeposit.mutateAsync({
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
    // Reset to current deposit values
    setSelectedStatus(deposit?.status || "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading deposit details...</p>
        </div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Deposit Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested deposit could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = updateDeposit.isPending;
  const hasChanges = selectedStatus !== deposit.status;
  const isActionDisabled =
    deposit.status === "successful" || deposit.status === "failed";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/transactions")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Deposit Details
              </h1>
              <p className="text-sm text-gray-600">
                Review and manage deposit transaction
              </p>
            </div>
          </div>
          <Badge
            className={getStatusColor(deposit.status) + " text-sm px-3 py-1 self-start sm:self-auto"}
          >
            {deposit.status?.toUpperCase() || "PENDING"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Deposit Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Transaction Information
                </CardTitle>
                <CardDescription>
                  Deposit details and payment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Deposit ID": deposit._id,
                    Amount: formatCurrency(deposit.amount),
                    Cryptocurrency: deposit.crypto,
                    Status: (
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    ),
                    Submitted: new Date(deposit.fundedAt).toLocaleString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    "Last Updated": deposit._updatedAt
                      ? new Date(deposit._updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—",
                  }}
                  
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
                <CardDescription>Depositing user details</CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": deposit.user?._id,
                    "Full Name": deposit.user?.username,
                    Email: deposit.user?.email,
                    "Phone Number": deposit.user?.phoneNumber || "—",
                    "Account Status": (
                      <Badge
                        className={getStatusColor(deposit.user?.accountStatus)}
                      >
                        {deposit.user?.accountStatus}
                      </Badge>
                    ),
                    "Current Balance": deposit.user?.accountBalance
                      ? formatCurrency(deposit.user.accountBalance)
                      : "$0",
                    "Total Profit": deposit.user?.totalProfit
                      ? formatCurrency(deposit.user.totalProfit)
                      : "$0",
                    "Member Since": deposit.user?._createdAt
                      ? new Date(deposit?.user?._createdAt).toLocaleDateString(
                          "en-GB"
                        )
                      : "—",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Proof of Payment */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Proof of Payment
                </CardTitle>
                <CardDescription>Uploaded payment confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deposit.proofOfPayment ? (
                    <>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                        <div className="aspect-video bg-white rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={deposit.proofOfPayment}
                            alt="Proof of Payment"
                            className="w-full h-full object-contain cursor-zoom-in"
                            onClick={() =>
                              window.open(deposit.proofOfPayment, "_blank")
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-600">
                            Payment confirmation
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(deposit.proofOfPayment, "_blank")
                            }
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Full Image
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Click the image or "View Full Image" to see the proof of
                        payment in full size
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No proof of payment available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6 sticky top-6">
            {/* Status Update Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Deposit Actions</CardTitle>
                <CardDescription>
                  Update deposit verification status
                </CardDescription>
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
                      {depositStatusOptions.map((status) => (
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
                    <Badge className={getStatusColor(deposit.status) + " ml-1"}>
                      {deposit.status}
                    </Badge>
                  </p>
                  {isActionDisabled && (
                    <p className="text-xs text-yellow-600">
                      This deposit has been finalized and cannot be modified
                    </p>
                  )}
                </div>

                {/* Important Note */}
                {selectedStatus === "successful" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> Approving this deposit will
                      automatically add{" "}
                      <strong>{formatCurrency(deposit.amount)}</strong> to the
                      user's account balance.
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
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                        Deposit Amount
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(deposit.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Submitted
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(deposit.fundedAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        User Balance
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {deposit.user?.accountBalance
                        ? formatCurrency(deposit.user.accountBalance)
                        : "$0"}
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
