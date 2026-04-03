"use client";

import { useParams, useRouter } from "next/navigation";
import { useFetchData, usePatch } from "@/hooks/useApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query"; 

// Loan plan schema
const loanPlanSchema = z.object({
  title: z.string().min(1, "Loan title is required"),
  minAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(2000, "Minimum amount must be at least $2000")
  ),
  maxAmount: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(1, "Maximum amount is required")
  ),
  interest: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(10, "Interest must be at least 10%")
  ),
  duration: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(30, "Duration must be at least 30 days")
  ),
  status: z.preprocess(
    (val) => String(val).toLowerCase().trim(),
    z.enum(["active", "inactive"], {
      errorMap: () => ({ message: "Status must be Active or Inactive" })
    })
  ),
});

export default function EditLoanPlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Fetch existing loan plan data
  const { data, isLoading, error } = useFetchData(
    `/api/admin/investments/loan/plans/${id}`,
    `loan-plan-${id}`
  );

  const plan = data?.data;

  // Initialize form with fetched data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, dirtyFields },
    getValues,
  } = useForm({
    resolver: zodResolver(loanPlanSchema),
    defaultValues: {
      title: "",
      minAmount: 2000,
      maxAmount: 5000,
      interest: 10,
      duration: 30,
      status: "active",
    },
  });

  // Store initial data when plan loads
  useEffect(() => {
    if (plan && !initialData) {
      const formData = {
        title: plan.title || "",
        minAmount: plan.minAmount || 2000,
        maxAmount: plan.maxAmount || 5000,
        interest: plan.interest || 10,
        duration: plan.duration || 30,
        status: (plan.status || "active").toLowerCase(),
      };
      
      reset(formData);
      setInitialData(formData);
    }
  }, [plan, reset, initialData]);

  const status = watch("status");

  // Debug: Log current form state
  useEffect(() => {
    console.log("Form dirty fields:", dirtyFields);
    console.log("Form isDirty:", isDirty);
    console.log("Form values:", getValues());
    console.log("Initial data:", initialData);
  }, [dirtyFields, isDirty, getValues, initialData]);

  // Use PATCH for partial updates
  const updatePlan = usePatch(
    (id) => `/api/admin/investments/loan/plans/${id}`,
    ["loan/plans"]
  );

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      console.log("Submitting form data:", formData);
      console.log("Initial data:", initialData);
      
      // Additional validation
      if (formData.maxAmount < formData.minAmount) {
        toast.error("Maximum amount must be greater than or equal to minimum amount");
        return;
      }

      // Use PATCH mutation
      const result = await updatePlan.mutateAsync({
        id: id,
        data: formData
      });
      
      console.log("Update result:", result);
      
      // Update initial data after successful save
      setInitialData(formData);
      
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ 
        queryKey: [`loan-plan-${id}`]
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["loan/plans"]
      });
      
      // Success toast is handled by usePatch hook
      router.push(`/admin/plans-management/loan/${id}`);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      reset(initialData);
    }
  };

  // Check if form has actual changes
  const hasRealChanges = () => {
    if (!initialData || !isDirty) return false;
    
    const currentValues = getValues();
    
    // Compare each field
    for (const key of Object.keys(initialData)) {
      const initialVal = initialData[key];
      const currentVal = currentValues[key];
      
      // Convert both to string for comparison to avoid type issues
      if (String(initialVal).trim() !== String(currentVal).trim()) {
        console.log(`Field ${key} changed:`, initialVal, "->", currentVal);
        return true;
      }
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loan Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load the loan plan for editing.
          </p>
          <Button onClick={() => router.push("/admin/plans-management?tab=loan")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loan Plans
          </Button>
        </div>
      </div>
    );
  }

  const showUnsavedChanges = hasRealChanges();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mr-5">
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
                Edit Loan Plan
              </h1>
              <p className="text-gray-600">
                Update the details of {plan.title}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Plan ID: {id}
          </div>
        </div>

        {/* Edit Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Loan Plan Details</CardTitle>
            <CardDescription>
              Update the loan plan information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Loan Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Business Loan"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={status}
                    onValueChange={(val) => setValue("status", val, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Current: {plan.status}</p>
                </div>

                {/* Min Amount */}
                <div className="space-y-2">
                  <Label htmlFor="minAmount">Minimum Amount ($) *</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    min="2000"
                    step="1"
                    {...register("minAmount")}
                  />
                  {errors.minAmount && (
                    <p className="text-red-500 text-sm">{errors.minAmount.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $2,000</p>
                </div>

                {/* Max Amount */}
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Maximum Amount ($) *</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    min="1"
                    step="1"
                    {...register("maxAmount")}
                  />
                  {errors.maxAmount && (
                    <p className="text-red-500 text-sm">{errors.maxAmount.message}</p>
                  )}
                </div>

                {/* Interest */}
                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (%) *</Label>
                  <Input
                    id="interest"
                    type="number"
                    min="10"
                    step="0.1"
                    {...register("interest")}
                  />
                  {errors.interest && (
                    <p className="text-red-500 text-sm">{errors.interest.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 10%</p>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="30"
                    step="1"
                    {...register("duration")}
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm">{errors.duration.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 30 days</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={!showUnsavedChanges || isSubmitting}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={!showUnsavedChanges || isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        Saving
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Last Updated Info */}
        <div className="mt-6 text-md flex items-center justify-between px-2 text-gray-500">
          <p>
            Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleString() : "Unknown"}
          </p>
          <p>
            Last updated:{" "}
            {plan.updatedAt ? new Date(plan.updatedAt).toLocaleString() : "Never"}
          </p>
        </div>
      </div>
    </div>
  );
}