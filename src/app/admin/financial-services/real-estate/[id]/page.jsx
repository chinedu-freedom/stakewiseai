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
  MapPin,
  Home,
  Building,
  Loader2,
  Image as ImageIcon,
  Percent,
  BarChart3,
} from "lucide-react";
import { getStatusColor, formatCurrency } from "@/lib/tableHelpers";
import { useState } from "react";
import Image from "next/image";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function RealEstateInvestmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showFullDetails, setShowFullDetails] = useState(false);

  const { data, isLoading, error } = useFetchData(
    `/api/admin/user-investments/real-estate/${id}`,
    [`real-estate-investments`, id]
  );

  const investment = data?.data;
  const imageSrc = useImageSrc(investment?.plan?.image, "/placeholder-investment.jpg");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">
            Loading real estate investment details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? "Failed to load investment" : "Investment Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message ||
              "The requested real estate investment could not be found."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back to Investments
          </Button>
        </div>
      </div>
    );
  }

  // Calculate ROI percentage
  const calculateROIPercentage = () => {
    if (!investment?.amount || !investment?.expectedROI) return 0;
    return (investment.expectedROI / investment.amount) * 100;
  };

  // Calculate annual ROI
  const calculateAnnualROI = () => {
    if (!investment?.plan?.contractDuration) return calculateROIPercentage();
    const roiPercentage = calculateROIPercentage();
    return roiPercentage / (investment.plan.contractDuration / 365);
  };

  // Calculate days remaining if endDate exists
  const calculateDaysRemaining = () => {
    if (!investment?.endDate) return null;
    const endDate = new Date(investment.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatPlanType = (planType) => {
    if (!planType) return "N/A";
    return planType === "realEstate" ? "Real Estate Investment" : planType;
  };

  const roiPercentage = calculateROIPercentage();
  const annualROI = calculateAnnualROI();
  const daysRemaining = calculateDaysRemaining();

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
                Real Estate Investment Details
              </h1>
              <p className="text-gray-600">
                {investment.plan?.title || "Property Investment Overview"}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Badge
              className={
                getStatusColor(investment.status) +
                " text-sm px-3 py-1 self-start md:self-auto"
              }
              variant={investment.status === "active" ? "default" : "secondary"}
            >
              {investment.status?.toUpperCase() || "PENDING"}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {formatPlanType(investment.planType)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Investment Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image Card */}
            {investment.plan?.image && (
              <Card className="shadow-sm border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={imageSrc}
                      alt={investment.plan?.title || "Property Image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-xl font-bold">
                          {investment.plan?.title}
                        </h3>
                        {investment.plan?.location && (
                          <p className="flex items-center gap-2 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            {investment.plan.location}
                          </p>
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
                  Key details of this real estate investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Investment ID": investment._id,
                    "Property Type": formatPlanType(investment.planType),
                    "Investment Amount": formatCurrency(investment.amount),
                    "Expected ROI": investment.expectedROI
                      ? formatCurrency(investment.expectedROI)
                      : "N/A",
                    "ROI Percentage":
                      investment.expectedROI && investment.amount
                        ? `${roiPercentage.toFixed(1)}%`
                        : "N/A",
                    "Contract Duration": investment.plan?.contractDuration
                      ? `${investment.plan.contractDuration} days`
                      : "N/A",
                    "Property Status": (
                      <Badge
                        className={getStatusColor(investment.plan?.status)}
                      >
                        {investment.plan?.status || "N/A"}
                      </Badge>
                    ),
                    "Investment Status": (
                      <Badge className={getStatusColor(investment.status)}>
                        {investment.status}
                      </Badge>
                    ),
                    "Start Date": investment.startDate
                      ? new Date(investment.startDate).toLocaleDateString(
                          "en-GB"
                        )
                      : "N/A",
                    "End Date": investment.endDate
                      ? new Date(investment.endDate).toLocaleDateString("en-GB")
                      : "N/A",
                    Created: new Date(investment.createdAt).toLocaleString(
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

            {/* Property Details Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Property Details
                </CardTitle>
                <CardDescription>
                  Information about the real estate property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Property Location
                        </span>
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {investment.plan?.location || "Location not specified"}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Contract Duration
                        </span>
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {investment.plan?.contractDuration
                          ? `${investment.plan.contractDuration} days`
                          : "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Minimum Investment
                        </span>
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {investment.plan?.minInvestment
                          ? formatCurrency(investment.plan.minInvestment)
                          : "Not specified"}
                      </div>
                    </div>

                    {daysRemaining !== null && daysRemaining > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Days Remaining
                          </span>
                          <Calendar className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex items-center space-x-2">

                        <div className="text-lg font-semibold text-gray-900">
                          {daysRemaining} days
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Until{" "}
                          {new Date(investment.endDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </p>
                      </div>
                      </div>
                    )}
                  </div>
                </div>
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
                  Details of the investor in this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "User ID": investment.user?._id,
                    "Full Name": investment.user?.fullName,
                    Email: investment.user?.email,
                    "Phone Number": investment.user?.phoneNumber || "N/A",
                    "Account Status": (
                      <Badge
                        className={getStatusColor(
                          investment.user?.accountStatus
                        )}
                      >
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

          {/* Right Column - ROI Analysis & Quick Stats */}
          <div className="space-y-6">
            {/* ROI Analysis Card - Now on the right side */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  ROI Analysis
                </CardTitle>
                <CardDescription>
                  Return on Investment calculations and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Total Expected ROI
                      </span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {investment.expectedROI
                        ? formatCurrency(investment.expectedROI)
                        : "N/A"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {investment.expectedROI && investment.amount
                        ? `${roiPercentage.toFixed(1)}% of principal`
                        : "ROI not specified"}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Projected Total
                      </span>
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {investment.amount && investment.expectedROI
                        ? formatCurrency(
                            investment.amount + investment.expectedROI
                          )
                        : formatCurrency(investment.amount)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Principal + Expected ROI
                    </p>
                  </div>

                  {investment.plan?.contractDuration && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Annualized ROI
                        </span>
                        <Percent className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {annualROI.toFixed(1)}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Projected annual return
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Investment Efficiency
                      </span>
                      <FileText className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {investment.amount &&
                      investment.expectedROI &&
                      investment.plan?.contractDuration
                        ? `${(annualROI / 100).toFixed(2)}x`
                        : "N/A"}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual return multiple
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Property Quick Stats</CardTitle>
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
                        <p className="text-sm font-medium text-gray-700">
                          Investment Amount
                        </p>
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
                        <p className="text-sm font-medium text-gray-700">
                          Expected ROI
                        </p>
                        <p className="text-xs text-gray-500">Total return</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.expectedROI
                        ? formatCurrency(investment.expectedROI)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Percent className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          ROI Percentage
                        </p>
                        <p className="text-xs text-gray-500">Return rate</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.expectedROI && investment.amount
                        ? `${roiPercentage.toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Contract Duration
                        </p>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {investment.plan?.contractDuration
                        ? `${investment.plan.contractDuration} days`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Timeline */}
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
                      <p className="text-sm font-medium text-gray-900">
                        Investment Started
                      </p>
                      <p className="text-xs text-gray-600">
                        {investment.startDate
                          ? new Date(investment.startDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "Not started"}
                      </p>
                    </div>
                  </div>

                  {investment.endDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Expected Completion
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(investment.endDate).toLocaleDateString(
                            "en-GB"
                          )}
                          {daysRemaining !== null && daysRemaining > 0 && (
                            <span className="ml-2 text-green-600">
                              ({daysRemaining} days remaining)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Home className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Property Status
                      </p>
                      <p className="text-xs text-gray-600">
                        {investment.plan?.status || "Status unknown"}
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