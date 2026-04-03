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

// Fix: Use string schema with proper validation
const cryptoPlanSchema = z.object({
  title: z.string().min(1, "Plan name is required"),
  minDeposit: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(100, "Minimum deposit must be at least $100")
  ),
  maxDeposit: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(100, "Maximum deposit must be at least $100")
  ),
  dailyProfit: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(8, "Daily Profit must be at least 8%")
  ),
  contractDuration: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().min(1, "Contract Duration must be at least 1 day")
  ),
  status: z.preprocess(
    (val) => String(val).toLowerCase().trim(),
    z.enum(["active", "inactive", "completed"], {
      errorMap: () => ({ message: "Status must be Active or Inactive" })
    })
  ),
});

export default function EditCryptoPlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Fetch existing plan data
  const { data, isLoading, error } = useFetchData(
    `/api/admin/investments/crypto/plans/${id}`,
    `crypto-plan-${id}`
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
    resolver: zodResolver(cryptoPlanSchema),
    defaultValues: {
      title: "",
      minDeposit: 100,
      maxDeposit: 1000,
      dailyProfit: 8,
      contractDuration: 30,
      status: "active",
    },
  });

  // Store initial data when plan loads
  useEffect(() => {
    if (plan && !initialData) {
      const formData = {
        title: plan.title || "",
        minDeposit: plan.minDeposit || 100,
        maxDeposit: plan.maxDeposit || 1000,
        dailyProfit: plan.dailyProfit || 8,
        contractDuration: plan.contractDuration || 30,
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
    (id) => `/api/admin/investments/crypto/plans/${id}`,
    ["crypto/plans"]
  );

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      console.log("Submitting form data:", formData);
      console.log("Initial data:", initialData);
      
      // Additional validation
      if (formData.maxDeposit < formData.minDeposit) {
        toast.error("Maximum deposit must be greater than or equal to minimum deposit");
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
        queryKey: [`crypto-plan-${id}`]
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ["crypto/plans"]
      });
      
      // Success toast is handled by usePatch hook
      router.push(`/admin/plans-management/crypto/${id}`);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleCancel = () => {
  //   if (isDirty) {
  //     if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
  //       return;
  //     }
  //   }
  //   router.back();
  // };

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
            Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load the plan for editing.
          </p>
          <Button onClick={() => router.push("/admin/plans-management?tab=crypto")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
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
        {/* <div className="mb-8"> */}
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
                  Edit Crypto Plan
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
        {/* </div> */}

        {/* Edit Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Update the plan information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Name */}
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Name *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Bitcoin Trading Plan"
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
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Current: {plan.status}</p>
                </div>

                {/* Min Deposit */}
                <div className="space-y-2">
                  <Label htmlFor="minDeposit">Minimum Deposit ($) *</Label>
                  <Input
                    id="minDeposit"
                    type="number"
                    min="100"
                    step="1"
                    {...register("minDeposit")}
                  />
                  {errors.minDeposit && (
                    <p className="text-red-500 text-sm">{errors.minDeposit.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $100</p>
                </div>

                {/* Max Deposit */}
                <div className="space-y-2">
                  <Label htmlFor="maxDeposit">Maximum Deposit ($) *</Label>
                  <Input
                    id="maxDeposit"
                    type="number"
                    min="100"
                    step="1"
                    {...register("maxDeposit")}
                  />
                  {errors.maxDeposit && (
                    <p className="text-red-500 text-sm">{errors.maxDeposit.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $100</p>
                </div>

                {/* Daily Profit */}
                <div className="space-y-2">
                  <Label htmlFor="dailyProfit">Daily Profit (%) *</Label>
                  <Input
                    id="dailyProfit"
                    type="number"
                    min="8"
                    step="0.1"
                    {...register("dailyProfit")}
                  />
                  {errors.dailyProfit && (
                    <p className="text-red-500 text-sm">{errors.dailyProfit.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 8%</p>
                </div>

                {/* Contract Duration */}
                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Contract Duration (days) *</Label>
                  <Input
                    id="contractDuration"
                    type="number"
                    min="1"
                    step="1"
                    {...register("contractDuration")}
                  />
                  {errors.contractDuration && (
                    <p className="text-red-500 text-sm">{errors.contractDuration.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 1 day</p>
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