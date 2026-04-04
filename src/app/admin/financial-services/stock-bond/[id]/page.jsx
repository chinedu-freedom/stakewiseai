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
  TrendingDown,
  PieChart,
  User,
  FileText,
  BarChart3,
  Loader2,
  LineChart,
  Percent,
  Building2,
  Wallet,
  Share2,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState } from "react";
import Image from "next/image";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function StocksBondsInvestmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showFullDetails, setShowFullDetails] = useState(false);

  
  const { data, isLoading, error } = useFetchData(
    `/api/admin/user-investments/stock-bond/${id}`,
    [`stock-bond-investments`, id]
  );
  
  const investment = data?.data;
  const imageSrc = useImageSrc(investment?.plan?.image, "/placeholder-investment.jpg"); 

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading stocks & bonds investment details...</p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LineChart className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Failed to load investment" : "Investment Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "The requested stocks & bonds investment could not be found."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Investments
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total value
  const calculateTotalValue = () => {
    if (!investment?.amount || !investment?.unitsHeld || !investment?.plan?.currentPrice) {
      return investment?.amount || 0;
    }
    return investment.unitsHeld * investment.plan.currentPrice;
  };

  // Calculate profit/loss
  const calculateProfitLoss = () => {
    const totalValue = calculateTotalValue();
    return totalValue - (investment?.amount || 0);
  };

  // Calculate profit/loss percentage
  const calculateProfitLossPercentage = () => {
    const profitLoss = calculateProfitLoss();
    const initialAmount = investment?.amount || 0;
    if (!initialAmount) return 0;
    return (profitLoss / initialAmount) * 100;
  };

  // Format investment type
  const formatInvestmentType = (type) => {
    if (!type) return "Stocks & Bonds";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const totalValue = calculateTotalValue();
  const profitLoss = calculateProfitLoss();
  const profitLossPercentage = calculateProfitLossPercentage();
  const isPositive = profitLoss >= 0;
  const typeIcon = investment.plan?.type === "bond" ? <Building2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Investments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Stocks & Bonds Investment Details
              </h1>
              <p className="text-gray-600">
                {investment.plan?.title || "Securities Investment Overview"}
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
            <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-1">
              {typeIcon}
              {formatInvestmentType(investment.plan?.type) || "Stocks & Bonds"}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Investment Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Image/Icon Card */}
            {investment.plan?.image && (
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 md:h-56">
                    <Image
                    src={imageSrc}
  alt={investment.plan?.title || "Investment Image"}
  fill
  className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold">{investment.plan?.title}</h3>
                        {investment.plan?.type && (
                          <Badge className="mt-2 bg-white/20 backdrop-blur-sm border-white/30">
                            {formatInvestmentType(investment.plan.type)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Summary Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Investment Summary
                </CardTitle>
                <CardDescription>
                  Key details of this stocks & bonds investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Investment ID": investment._id,
                    "Security Type": formatInvestmentType(investment.plan?.type),
                    "Initial Investment": formatCurrency(investment.amount),
                    "Units Held": investment.unitsHeld 
                      ? investment.unitsHeld.toLocaleString()
                      : "N/A",
                    "Current Price per Unit": investment.plan?.currentPrice 
                      ? formatCurrency(investment.plan.currentPrice)
                      : "N/A",
                    "24h Change": investment.plan?.changePercent ? (
                      <div className="flex items-center gap-1">
                        {investment.plan.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={investment.plan.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                          {investment.plan.changePercent >= 0 ? "+" : ""}
                          {investment.plan.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ) : "N/A",
                    "Security Status": (
                      <Badge className={getStatusColor(investment.plan?.status)}>
                        {investment.plan?.status || "N/A"}
                      </Badge>
                    ),
                    "Investment Status": (
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status}
                      </Badge>
                    ),
                    "Start Date": investment.startDate
                      ? new Date(investment.startDate).toLocaleDateString("en-GB")
                      : "N/A",
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
                  User Information
                </CardTitle>
                <CardDescription>
                  Details of the User in this security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": investment.user?._id,
                    "Full Name": investment.user?.userName,
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

          {/* Right Column - Portfolio Performance & Stats */}
          <div className="space-y-6">
            {/* Portfolio Performance Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Portfolio Performance</CardTitle>
                <CardDescription>
                  Current value and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <PieChart className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Current Value</p>
                        <p className="text-xs text-gray-500">Portfolio total</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total P&L</p>
                        <p className="text-xs text-gray-500">Profit/Loss</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{formatCurrency(profitLoss)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Percent className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Return %</p>
                        <p className="text-xs text-gray-500">ROI</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{profitLossPercentage.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Units Held</p>
                        <p className="text-xs text-gray-500">Quantity</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.unitsHeld?.toLocaleString() || "0"}
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
                      <p className="text-sm font-medium text-gray-900">Investment Date</p>
                      <p className="text-xs text-gray-600">
                        {investment.startDate
                          ? new Date(investment.startDate).toLocaleDateString("en-GB")
                          : "Date not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <LineChart className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Market Performance</p>
                      <p className="text-xs text-gray-600">
                        {investment.plan?.changePercent 
                          ? `${investment.plan.changePercent >= 0 ? "+" : ""}${investment.plan.changePercent.toFixed(2)}% 24h change`
                          : "Market data unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <BarChart3 className="w-3 h-3" />
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
          </div>
        </div>
      </div>
    </div>
  );
}