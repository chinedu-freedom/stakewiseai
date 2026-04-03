"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchData, useDelete, usePatch } from "@/hooks/useApi";
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
  Percent,
  Clock,
  Activity,
  Loader2,
  Edit,
  Trash2,
  PowerOff,
  Power,
  MapPin,
  Home,
  TrendingUp,
  Building,
  Image as ImageIcon,
} from "lucide-react";
import { getStatusColor, formatCurrency, formatDate } from "@/lib/tableHelpers";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function RealEstatePlanDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const { data, isLoading, error, refetch } = useFetchData(
    `/api/admin/investments/real-estate/plans/${id}`,
    `real-estate-plan-${id}`,
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  const plan = data?.data;
  const isActive = plan?.status === "active";
  const isInactive = plan?.status === "inactive";

  // Use the useImageSrc hook for consistent image handling
  const imageSrc = useImageSrc(plan?.image, "/placeholder-property.jpg");

  // Initialize hooks
  const deletePlan = useDelete(
    (id) => `/api/admin/investments/real-estate/plans/${id}`,
    ["real-estate/plans"]
  );

  // UPDATE: Always use FormData for PATCH (backend requirement)
  const updatePlan = usePatch(
    (id) => `/api/admin/investments/real-estate/plans/${id}`,
    ["real-estate/plans", `real-estate-plan-${id}`],
    true // ← Always true because backend only accepts FormData
  );

  const handleEdit = () => {
    router.push(`/admin/plans-management/real-estate/${id}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!plan) return;

    try {
      setIsTogglingStatus(true);

      const newStatus = isActive ? "inactive" : "active";
      const actionText = isActive ? "deactivate" : "activate";

      // UPDATE: Convert JSON to FormData
      const formData = new FormData();
      formData.append("status", newStatus);

      // Send as FormData instead of JSON
      await updatePlan.mutateAsync({
        id: id,
        data: formData,
      });

      toast.success(`Real estate plan ${actionText}d successfully`);
      refetch();
    } catch (error) {
      toast.error(
        `Failed to ${isActive ? "deactivate" : "activate"} real estate plan`
      );
      console.error("Toggle status error:", error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePlan.mutateAsync(id);
      router.push("/admin/plans-management?tab=real-estate");
    } catch (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading real estate plan details...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Real Estate Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested real estate plan could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate real estate values
  const estimatedAnnualProfit = (plan.minInvestment * plan.roiEstimate) / 100;
  const estimatedTotalProfit =
    (estimatedAnnualProfit * plan.contractDuration) / 365;
  const totalReturn = plan.minInvestment + estimatedTotalProfit;
  const monthlyProfit = estimatedAnnualProfit / 12;
  const contractMonths = Math.ceil(plan.contractDuration / 30);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-gray-600">
                Real Estate Investment Plan Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={getStatusColor(plan.status) + " text-sm px-3 py-1"}
            >
              {plan.status?.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image Card - Now separate */}
            <Card className="shadow-sm border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80 w-full">
                  <Image
                    src={imageSrc}
                    alt={plan.title || "Property Image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-2xl font-bold">{plan.title}</h3>
                      {plan.location && (
                        <p className="flex items-center gap-2 text-base mt-2">
                          <MapPin className="w-5 h-5" />
                          {plan.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Information Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Property Information
                </CardTitle>
                <CardDescription>
                  Complete details of the real estate investment plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Plan ID": plan._id,
                    "Property Title": plan.title,
                    Location: (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {plan.location}
                      </div>
                    ),
                    Status: (
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    ),
                    Created: formatDate(plan.createdAt),
                    "Last Updated": formatDate(plan.updatedAt),
                    "Minimum Investment": formatCurrency(plan.minInvestment),
                    "ROI Estimate": (
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">
                          {plan.roiEstimate}%
                        </span>
                      </div>
                    ),
                    "Contract Duration": `${plan.contractDuration} days`,
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Financial Calculations Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Investment Calculations
                </CardTitle>
                <CardDescription>
                  Estimated returns based on minimum investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Annual Profit
                        </span>
                        <DollarSign className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(estimatedAnnualProfit)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.roiEstimate}% of{" "}
                        {formatCurrency(plan.minInvestment)}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Monthly Profit
                        </span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(monthlyProfit)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Average monthly return
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Total Return
                        </span>
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalReturn)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Principal + Estimated Profit
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Contract Term
                        </span>
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {contractMonths} months
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.contractDuration} days total
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions, Stats & Summary */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage this real estate plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Toggle Status Button */}
                <Button
                  variant={isActive ? "destructive" : "default"}
                  className="w-full"
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus || updatePlan.isPending}
                >
                  {isTogglingStatus ? (
                    <>
                      {isActive ? "Deactivating" : "Activating"}
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    </>
                  ) : (
                    <>
                      {isActive ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Deactivate Plan
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Activate Plan
                        </>
                      )}
                    </>
                  )}
                </Button>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Property Details
                </Button>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={deletePlan.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Property Plan
                </Button>
              </CardContent>
            </Card>

            {/* Investment Summary Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Investment Summary</CardTitle>
                <CardDescription>Projected returns overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Annual ROI
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {plan.roiEstimate}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Minimum Investment
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(plan.minInvestment)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Investment Term
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {contractMonths} months
                      </p>
                      <p className="text-sm text-gray-600">
                        ({plan.contractDuration} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Annual Profit
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(estimatedAnnualProfit)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Timeline Card */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Plan Timeline</CardTitle>
                <CardDescription>Key dates and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Plan Created
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(plan.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Last Updated
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(plan.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Contract Duration
                      </p>
                      <p className="text-xs text-gray-600">
                        {contractMonths} months ({plan.contractDuration} days)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      <Home className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Property Status
                      </p>
                      <p className="text-xs text-gray-600">
                        Currently {plan.status}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {plan?.title || "this real estate plan"}
              </span>{" "}
              record? This action cannot be undone.
            </p>

            {plan?.image && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <ImageIcon className="w-4 h-4 text-yellow-600" />
                <p className="text-xs text-yellow-700">
                  Note: The associated property image will also be removed.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
              className="min-w-[140px]"
            >
              {isDeleting ? (
                <>
                  Deleting
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                </>
              ) : (
                "Delete Property Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}