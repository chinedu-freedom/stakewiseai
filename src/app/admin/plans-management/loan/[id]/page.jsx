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

export default function LoanPlanDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const { data, isLoading, error, refetch } = useFetchData(
    `/api/admin/investments/loan/plans/${id}`,
    `loan-plan-${id}`,
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );
  
  const plan = data?.data;
  const isActive = plan?.status === "active";
  const isInactive = plan?.status === "inactive";

  // Initialize hooks
  const deletePlan = useDelete(
    (id) => `/api/admin/investments/loan/plans/${id}`,
    ["loan/plans"]
  );

  const updatePlan = usePatch(
    (id) => `/api/admin/investments/loan/plans/${id}`,
    ["loan/plans", `loan-plan-${id}`]
  );

  const handleEdit = () => {
    router.push(`/admin/plans-management/loan/${id}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!plan) return;
    
    try {
      setIsTogglingStatus(true);
      
      const newStatus = isActive ? "inactive" : "active";
      const actionText = isActive ? "deactivate" : "activate";
      
      await updatePlan.mutateAsync({
        id: id,
        data: { status: newStatus }
      });
      
      toast.success(`Loan plan ${actionText}d successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${isActive ? "deactivate" : "activate"} loan plan`);
      console.error("Toggle status error:", error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePlan.mutateAsync(id);
      router.push("/admin/plans-management?tab=loan");
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
          <p className="text-gray-600">Loading loan plan details...</p>
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
            Loan Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested loan plan could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate loan values
  const interestAmount = (plan.minAmount * plan.interest) / 100;
  const totalRepayment = plan.minAmount + interestAmount;
  const monthlyPayment = totalRepayment / (plan.duration / 30); // Assuming 30 days per month

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
              Back to Plans
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {plan.title}
              </h1>
              <p className="text-gray-600">
                Loan Plan Details
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
          {/* Left Column - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Information Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Loan Information
                </CardTitle>
                <CardDescription>
                  Complete details of the loan plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  data={{
                    "Plan ID": plan._id,
                    "Loan Title": plan.title,
                    "Status": (
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    ),
                    "Created": formatDate(plan.createdAt),
                    "Last Updated": formatDate(plan.updatedAt),
                    "Minimum Amount": formatCurrency(plan.minAmount),
                    "Maximum Amount": formatCurrency(plan.maxAmount),
                    "Interest Rate": `${plan.interest}%`,
                    "Duration": `${plan.duration} days`,
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>

            {/* Financial Calculations Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Loan Calculations
                </CardTitle>
                <CardDescription>
                  Estimated loan details based on minimum amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Percent className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                          Total Interest
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(interestAmount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {plan.interest}% of {formatCurrency(plan.minAmount)}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                          Total Repayment
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalRepayment)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Principal + Interest
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                          Monthly Payment
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(monthlyPayment)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Approx. monthly amount
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span className="font-medium text-gray-700">
                          Loan Term
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.ceil(plan.duration / 30)} months
                      </p>
                      <p className="text-sm text-gray-600">
                        {plan.duration} days total
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Created
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(plan.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Last Updated
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(plan.updatedAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Loan Term
                  </span>
                  <span className="text-sm text-gray-900">
                    {plan.duration} days
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage this loan plan
                </CardDescription>
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
                          Deactivate Loan
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Activate Loan
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
                  Edit Loan Plan
                </Button>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={deletePlan.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Loan Plan
                </Button>
              </CardContent>
            </Card>

            {/* Loan Summary */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    This loan plan offers an interest rate of{" "}
                    <strong>{plan.interest}%</strong> over{" "}
                    <strong>{plan.duration} days</strong>.
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    Borrowers can apply for amounts between{" "}
                    <strong>{formatCurrency(plan.minAmount)}</strong> and{" "}
                    <strong>{formatCurrency(plan.maxAmount)}</strong>.
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <strong>Example:</strong> A {formatCurrency(plan.minAmount)}{" "}
                    loan at {plan.interest}% interest results in a total repayment of{" "}
                    <strong>{formatCurrency(totalRepayment)}</strong>.
                  </p>
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
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {plan?.title || "this loan plan"}
            </span>{" "}
            record? This action cannot be undone.
          </p>
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
                "Delete Loan Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}