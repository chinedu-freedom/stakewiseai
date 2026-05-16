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
import AccessLogsTable from "@/components/tables/AccessLogsTable";
import {
  ArrowLeft,
  Eye,
  User,
  CreditCard,
  FileText,
  Loader2,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  LogIn,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useImageSrc } from "@/hooks/useImageSrc";
import { toast } from "react-hot-toast";
import axiosInstance from "@/config/axiosInstance";

const accountStatusOptions = [
  { value: "pending", label: "Pending", color: "text-yellow-600" },
  { value: "active", label: "Active", color: "text-green-600" },
  { value: "inactive", label: "Inactive", color: "text-gray-600" },
];

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isImpersonating, setIsImpersonating] = useState(false);

  const { data, isLoading } = useFetchData(`/api/users/${id}`, [`users`, id]);
  const user = data?.data;
  const imageSrc = useImageSrc(user?.image, "/placeholder-user.jpg");

  // usePatch hook instead of manual fetch
  const updateUser = usePatch((id) => `/api/users/${id}`, [`users`, id]);

  // Pre-fill current values when user data loads
  useEffect(() => {
    if (user) {
      setSelectedStatus(user.accountStatus || "");
      setAccountBalance(user.accountBalance?.toString() || "");
    }
  }, [user]);

  const handleUpdateUser = async () => {
    if (!selectedStatus && !accountBalance) {
      return;
    }

    // Check if anything actually changed
    const statusChanged = selectedStatus !== user.accountStatus;
    const balanceChanged =
      accountBalance !== (user.accountBalance?.toString() || "");

    if (!statusChanged && !balanceChanged) {
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
      console.error("Update error:", error);
    }
  };

  const handleClear = () => {
    // Reset to current user values instead of empty
    setSelectedStatus(user?.accountStatus || "");
    setAccountBalance(user?.accountBalance?.toString() || "");
  };

  const handleImpersonate = async () => {
    setIsImpersonating(true);
    try {
      const response = await axiosInstance.post(`/api/users/${id}/impersonate`);
      if (response.data.success) {
        const token = response.data.data.token;
        // Open the user dashboard in a new tab and pass the token via URL parameter
        window.open(`https://satrixai.com/index.html?impersonate_token=${token}`, '_blank');
        toast.success("Logging in as user...");
      } else {
        toast.error("Failed to generate login token");
      }
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast.error("An error occurred during impersonation");
    } finally {
      setIsImpersonating(false);
    }
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
            <ArrowLeft className="w-4 h-4 mr-2" />
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

  // Check if user has an image
  const hasImage = user?.image && Object.keys(user.image).length > 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-sm text-gray-600">
                View and manage user account details
              </p>
            </div>
          </div>
          <Badge
            className={
              getStatusColor(user.accountStatus) + " text-sm px-3 py-1 self-start sm:self-auto"
            }
          >
            {user.accountStatus?.toUpperCase() || "UNKNOWN"}
          </Badge>
          
          <Button 
            onClick={handleImpersonate} 
            disabled={isImpersonating}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 mt-2 sm:mt-0"
          >
            {isImpersonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Login as User
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Image Card or Fallback */}
            {hasImage ? (
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 md:h-90">
                    <Image
                      src={imageSrc}
                      alt={user.username || "User Avatar"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold">{user.username}</h3>
                        <p className="text-sm opacity-90">
                          User ID: {user._id}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 md:h-90 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700">
                        {user.username || "User"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        User ID: {user._id}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-200/50 rounded-full">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          No profile image uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  Personal Information
                </CardTitle>
                <CardDescription>
                  User's personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": user._id,
                    Username: user.username || "N/A",
                    "Email": (
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.emailVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    ),
                    "Phone Number": user.phoneNumber || "—",
                    "IP Address": user.lastKnownIp || "Unknown",
                    "Referral Code": user.referralCode || "N/A",
                    "Account Status": (
                      <Badge className={getStatusColor(user.accountStatus)}>
                        {user.accountStatus}
                      </Badge>
                    ),
                    "Account Balance": user.accountBalance
                      ? formatCurrency(user.accountBalance)
                      : "$0",
                    "Member Since": user.createdAt
                      ? new Date(user.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "N/A",
                    "Last Updated": user.updatedAt
                      ? new Date(user.updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "N/A",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
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
                    Account Balance
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Current:{" "}
                    {user.accountBalance
                      ? formatCurrency(user.accountBalance)
                      : "$0"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
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
                        Updating
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
              <CardHeader>
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
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB")
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Email Status
                      </span>
                    </div>
                    <Badge
                      className={
                        user.emailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Phone Number
                      </span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {user.phoneNumber || "Not provided"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Access Logs Table */}
        <div className="mt-8">
          <AccessLogsTable userId={id} />
        </div>
      </div>
    </div>
  );
}