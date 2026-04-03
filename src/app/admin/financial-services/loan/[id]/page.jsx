"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchData } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KeyValueList from "@/components/KeyValueList";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  FileText,
  Percent,
  Wallet,
  Loader2,
  Coins,
  BarChart3,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState } from "react";

export default function CryptoInvestmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showFullDetails, setShowFullDetails] = useState(false);

  const { data, isLoading, error } = useFetchData(
    `/api/admin/user-investments/crypto/${id}`,
    [`crypto-investments`, id]
  );
  
  const investment = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading crypto investment details...</p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Failed to load investment" : "Investment Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "The requested crypto investment could not be found."}
          </p>
          <Button onClick={() => router.push("/admin/financial-services")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investments
          </Button>
        </div>
      </div>
    );
  }

  // Calculate profit projections
  const calculateDailyProfit = () => {
    if (!investment?.amount || !investment?.plan?.dailyProfit) return 0;
    return (investment.amount * investment.plan.dailyProfit) / 100;
  };

  const calculateTotalProjectedProfit = () => {
    const dailyProfit = calculateDailyProfit();
    if (!dailyProfit || !investment?.plan?.contractDuration) return 0;
    return dailyProfit * investment.plan.contractDuration;
  };

  const calculateProjectedTotal = () => {
    if (!investment?.amount) return 0;
    return investment.amount + calculateTotalProjectedProfit();
  };

  const formatPlanType = (planType) => {
    if (!planType) return "N/A";
    return planType === "crypto" ? "Crypto Investment" : planType;
  };

  const dailyProfit = calculateDailyProfit();
  const totalProjectedProfit = calculateTotalProjectedProfit();
  const projectedTotal = calculateProjectedTotal();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/financial-services")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Investments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crypto Investment Details
              </h1>
              <p className="text-gray-600">
                {investment.plan?.title || "Investment Overview"}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Badge
              className={getStatusColor(investment.status) + " text-sm px-3 py-1 self-start md:self-auto"}
              variant={investment.status === "active" ? "default" : "secondary"}
            >
              {investment.status?.toUpperCase() || "PENDING"}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Coins className="w-3 h-3 mr-1" />
              {formatPlanType(investment.planType)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Investment Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Summary Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Investment Summary
                </CardTitle>
                <CardDescription>
                  Key details of this crypto investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Investment ID": investment._id,
                    "Plan Type": formatPlanType(investment.planType),
                    "Investment Amount": formatCurrency(investment.amount),
                    "Daily Profit Rate": investment.plan?.dailyProfit 
                      ? `${investment.plan.dailyProfit}%`
                      : "N/A",
                    "Contract Duration": investment.plan?.contractDuration 
                      ? `${investment.plan.contractDuration} days`
                      : "N/A",
                    "Plan Status": (
                      <Badge className={getStatusColor(investment.plan?.status)}>
                        {investment.plan?.status || "N/A"}
                      </Badge>
                    ),
                    "Investment Status": (
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status}
                      </Badge>
                    ),
                    "Created": new Date(investment.createdAt).toLocaleString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    ),
                    "Last Updated": investment.updatedAt
                      ? new Date(investment.updatedAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Profit Projection Card */}
            <Card className="shadow-sm border-0 border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Profit Projection
                </CardTitle>
                <CardDescription>
                  Estimated returns based on current plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Daily Profit</span>
                        <Percent className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dailyProfit)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {investment.plan?.dailyProfit 
                          ? `(${investment.plan.dailyProfit}% of ${formatCurrency(investment.amount)})`
                          : "No profit rate set"}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Total Projected Profit</span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalProjectedProfit)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Over {investment.plan?.contractDuration || 0} days
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Projected Total</span>
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(projectedTotal)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Principal + Total Profit
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Contract Duration</span>
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {investment.plan?.contractDuration || 0} days
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Contract duration
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Details Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Plan Details
                </CardTitle>
                <CardDescription>
                  Information about the selected investment plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Plan ID": investment.plan?._id,
                    "Plan Title": investment.plan?.title,
                    "Minimum Deposit": investment.plan?.minDeposit 
                      ? formatCurrency(investment.plan.minDeposit)
                      : "N/A",
                    "Maximum Deposit": investment.plan?.maxDeposit 
                      ? formatCurrency(investment.plan.maxDeposit)
                      : "N/A",
                    "Contract Duration": investment.plan?.contractDuration 
                      ? `${investment.plan.contractDuration} days`
                      : "N/A",
                    "Daily Profit Rate": investment.plan?.dailyProfit 
                      ? `${investment.plan.dailyProfit}%`
                      : "N/A",
                    "Plan Status": (
                      <Badge className={getStatusColor(investment.plan?.status)}>
                        {investment.plan?.status || "N/A"}
                      </Badge>
                    ),
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* User Information Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Investor Information
                </CardTitle>
                <CardDescription>
                  Details of the user who made this investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": investment.user?._id,
                    "Full Name": investment.user?.fullName,
                    "Email": investment.user?.email,
                    "Phone Number": investment.user?.phoneNumber || "N/A",
                    "Account Status": (
                      <Badge className={getStatusColor(investment.user?.accountStatus)}>
                        {investment.user?.accountStatus || "N/A"}
                      </Badge>
                    ),
                    "Account Balance": investment.user?.accountBalance
                      ? formatCurrency(investment.user.accountBalance)
                      : "₦0",
                    "Email Verified": investment.user?.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-600">
                        Not Verified
                      </Badge>
                    ),
                    "Member Since": investment.user?._createdAt
                      ? new Date(investment.user._createdAt).toLocaleString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A",
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Quick Stats */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Investment Amount</p>
                        <p className="text-xs text-gray-500">Principal</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(investment.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Daily Profit</p>
                        <p className="text-xs text-gray-500">Projected</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(dailyProfit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duration</p>
                        <p className="text-xs text-gray-500">Contract days</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.plan?.contractDuration || 0} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Investor Balance</p>
                        <p className="text-xs text-gray-500">Current</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.user?.accountBalance
                        ? formatCurrency(investment.user.accountBalance)
                        : "₦0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Timeline */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Investment Timeline</CardTitle>
                <CardDescription>Key dates and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Investment Created</p>
                      <p className="text-xs text-gray-600">
                        {new Date(investment.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <FileText className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Plan Activated</p>
                      <p className="text-xs text-gray-600">
                        {investment.plan?.status === "active" 
                          ? "Plan is currently active" 
                          : "Plan is not active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Wallet className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Investment Status</p>
                      <p className="text-xs text-gray-600">
                        Currently {investment.status || "unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Actions</CardTitle>
                <CardDescription>Available options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowFullDetails(!showFullDetails)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {showFullDetails ? "Hide Full Details" : "Show Full Details"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/admin/users/${investment.user?._id}`)}
                    disabled={!investment.user?._id}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Investor Profile
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.print()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Print Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Legend */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Status Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 rounded-full border border-green-300"></div>
                    <span className="text-xs text-gray-600">Active - Investment is running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded-full border border-yellow-300"></div>
                    <span className="text-xs text-gray-600">Pending - Awaiting activation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 rounded-full border border-red-300"></div>
                    <span className="text-xs text-gray-600">Cancelled - Investment terminated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded-full border border-blue-300"></div>
                    <span className="text-xs text-gray-600">Completed - Successfully ended</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Details Section (Collapsible) */}
        {showFullDetails && (
          <Card className="shadow-sm border-0 mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                Full Investment Data
              </CardTitle>
              <CardDescription>
                Complete JSON representation of this investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(investment, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}