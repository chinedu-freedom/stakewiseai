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
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { getStatusColor } from "@/lib/tableHelpers";
import { useState, useEffect } from "react";

const rejectionReasons = [
  "Document blurred or unreadable",
  "Document expired",
  "Information mismatch",
  "Missing document",
  "Poor quality image",
  "Suspected fraud",
  "Incomplete information",
  "Other",
];

export default function KycDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState("");

  const { data, isLoading } = useFetchData(
    `/api/admin/kycs/${id}`,
    `kycs/${id}`
  );
  const kyc = data?.data;

  // usePatch hook
  const updateKyc = usePatch((id) => `/api/admin/kycs/${id}`, `kycs/${id}`);

  // Pre-fill current values when KYC data loads
  useEffect(() => {
    if (kyc) {
      // Map stored status to action value
      const statusToAction = {
        approved: "approve",
        rejected: "reject",
        pending: "",
      };
      setSelectedStatus(statusToAction[kyc.status] || "");

      if (kyc.status === "rejected" && kyc.rejectionReasons) {
        setSelectedReasons(kyc.rejectionReasons);
      }
    }
  }, [kyc]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return; // Error handled by usePatch hook
    }

    if (selectedStatus === "reject" && selectedReasons.length === 0) {
      return; // Error handled by usePatch hook
    }

    try {
      const reasons =
        selectedStatus === "reject"
          ? selectedReasons.includes("Other") && otherReason
            ? [...selectedReasons.filter((r) => r !== "Other"), otherReason]
            : selectedReasons
          : [];

      await updateKyc.mutateAsync({
        id: id,
        data: {
          action: selectedStatus,
          reasons: reasons,
        },
      });
    } catch (error) {
      // Error toast handled by usePatch hook
      console.error("Update error:", error);
    }
  };

  const handleReasonToggle = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleClear = () => {
    // Reset to current KYC values using the same mapping as useEffect
    const statusToAction = {
      approved: "approve",
      rejected: "reject",
      pending: "",
    };
    setSelectedStatus(statusToAction[kyc?.status] || "");
    setSelectedReasons(kyc?.rejectionReasons || []);
    setOtherReason("");
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading KYC details...</p>
        </div>
      </div>
    );
  }

  if (!kyc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            KYC Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested KYC entry could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = updateKyc.isPending;
  const hasChanges =
    selectedStatus !==
    (kyc.status === "approved"
      ? "approve"
      : kyc.status === "rejected"
      ? "reject"
      : "");

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
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
                KYC Verification
              </h1>
              <p className="text-gray-600">
                Review and verify customer identification documents
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(kyc.status) + " text-sm px-3 py-1"}>
            {kyc.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - KYC Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Customer's personal details and identification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    Name: kyc.fullName,
                    Email: kyc.email,
                    Address: kyc.address,
                    "Date of Birth": new Date(kyc.dob).toLocaleDateString(
                      "en-GB"
                    ),
                    "Marital Status": kyc.maritalStatus,
                    "Document Type": kyc.idType
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()),
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Document Images */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Document Images
                </CardTitle>
                <CardDescription>
                  Uploaded identification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">
                      Front Side
                    </h4>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div className="aspect-video bg-white rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={kyc.idFront}
                          alt="ID Front"
                          className="w-full h-full object-contain cursor-zoom-in"
                          onClick={() => window.open(kyc.idFront, "_blank")}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-600">
                          Front view
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(kyc.idFront, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">
                      Back Side
                    </h4>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                      <div className="aspect-video bg-white rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={kyc.idBack}
                          alt="ID Back"
                          className="w-full h-full object-contain cursor-zoom-in"
                          onClick={() => window.open(kyc.idBack, "_blank")}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm text-gray-600">Back view</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(kyc.idBack, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Show rejection reasons if KYC was rejected */}
            {kyc.status === "rejected" &&
              kyc.rejectionReasons &&
              kyc.rejectionReasons.length > 0 && (
                <Card className="shadow-sm border-0 border-l-4 border-l-red-500">
                  <CardHeader className="pb-4">
                    <CardTitle>Rejection Reasons</CardTitle>
                    <CardDescription>
                      Reasons why this KYC was rejected
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="-mt-5 ml-2">
                    <div className="space-y-1">
                      {kyc.rejectionReasons.map((reason, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 py-1"
                        >
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">
                            {reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6 sticky top-6">
            {/* Status Update Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg">Verification Actions</CardTitle>
                <CardDescription>
                  Update KYC verification status
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
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="approve"
                        className="flex items-center gap-2"
                      >
                        Approve KYC
                      </SelectItem>
                      <SelectItem
                        value="reject"
                        className="flex items-center gap-2"
                      >
                        Reject KYC
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Current:{" "}
                    <Badge className={getStatusColor(kyc.status) + " ml-1"}>
                      {kyc.status}
                    </Badge>
                  </p>
                </div>

                {/* Rejection Reasons - Conditionally shown */}
                {selectedStatus === "reject" && (
                  <div className="space-y-4 p-4 bg-red-50/50 border border-red-100 rounded-lg animate-in fade-in-50">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Rejection Reasons
                    </label>
                    <div className="space-y-2 max-h-60">
                      {rejectionReasons.map((reason) => (
                        <div
                          key={reason}
                          className="flex items-center space-x-3"
                        >
                          <Checkbox
                            id={`reason-${reason}`}
                            checked={selectedReasons.includes(reason)}
                            onCheckedChange={() => handleReasonToggle(reason)}
                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                          />
                          <label
                            htmlFor={`reason-${reason}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                            {reason}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Other Reason Input */}
                    {selectedReasons.includes("Other") && (
                      <div className="space-y-2 animate-in fade-in-50">
                        <label className="text-sm font-medium text-gray-700">
                          Specify other reason
                        </label>
                        <Input
                          placeholder="Please specify the reason..."
                          value={otherReason}
                          onChange={(e) => setOtherReason(e.target.value)}
                          className="border-red-200 focus:border-red-300"
                        />
                      </div>
                    )}
                  </div>
                )}

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
                    onClick={handleStatusUpdate}
                    disabled={
                      isSubmitting ||
                      !hasChanges ||
                      !selectedStatus ||
                      (selectedStatus === "reject" &&
                        selectedReasons.length === 0)
                    }
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                      Updating
                        <Loader2 className="w-4 h-4  animate-spin" />
                      </>
                    ) : (
                      <>
                        {selectedStatus === "approve" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Confirm{" "}
                        {selectedStatus === "approve" ? "Approve" : "Reject"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Submitted</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(kyc._createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {kyc._updatedAt && kyc._updatedAt !== kyc._createdAt && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(kyc._updatedAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
