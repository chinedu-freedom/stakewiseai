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
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useImageSrc } from "@/hooks/useImageSrc";

// Custom preprocess function to handle empty strings
const preprocessNumber = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
};

// Stock/Bond plan schema
const stockBondPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["stock", "bond"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be 'stock' or 'bond'"
  }),
  unitHeld: z.preprocess(
    preprocessNumber,
    z.number().min(1, "Unit held must be at least 1")
  ),
  changePercent: z.preprocess(
    preprocessNumber,
    z.number().min(-100, "Change percentage must be at least -100%")
  ),
  currentPrice: z.preprocess(
    preprocessNumber,
    z.number().min(200, "Current price must be at least $200")
  ),
  contractDuration: z.preprocess(
    preprocessNumber,
    z.number().min(30, "Contract duration must be at least 30 days")
  ),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'active' or 'inactive'"
  }),
});

export default function EditStockBondPlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);
  
  // Image states
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch existing stock/bond plan data
  const { data, isLoading, error } = useFetchData(
    `/api/admin/investments/stock-bond/plans/${id}`,
    `stock-bond-plan-${id}`
  );

  const plan = data?.data;

  // Use the same useImageSrc hook as details page
  const existingImageSrc = useImageSrc(plan?.image, "/placeholder-investment.jpg");

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
    resolver: zodResolver(stockBondPlanSchema),
    defaultValues: {
      title: "",
      type: "stock",
      unitHeld: 1,
      changePercent: 0,
      currentPrice: 200,
      contractDuration: 30,
      status: "active",
    },
  });

  // Store initial data when plan loads
  useEffect(() => {
    if (plan && !initialData) {
      const formData = {
        title: plan.title || "",
        type: (plan.type || "stock").toLowerCase(),
        unitHeld: plan.unitHeld || 1,
        changePercent: plan.changePercent || 0,
        currentPrice: plan.currentPrice || 200,
        contractDuration: plan.contractDuration || 30,
        status: (plan.status || "active").toLowerCase(),
      };
      
      reset(formData);
      setInitialData(formData);
    }
  }, [plan, reset, initialData]);

  const type = watch("type");
  const status = watch("status");

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Revoke previous preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    
    // Mark form as dirty
    setValue("image", file, { shouldDirty: true });
  };

  const removeImage = () => {
    // Revoke preview URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    
    setSelectedFile(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Mark form as dirty
    setValue("image", null, { shouldDirty: true });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // FIX: Set isFormData to true since we're sending FormData
  const updatePlan = usePatch(
    (id) => `/api/admin/investments/stock-bond/plans/${id}`,
    ["stock-bond/plans"],
    true // IMPORTANT: Set isFormData to true
  );

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Add all form fields
      submitFormData.append("title", formData.title);
      submitFormData.append("type", formData.type);
      submitFormData.append("unitHeld", formData.unitHeld.toString());
      submitFormData.append("changePercent", formData.changePercent.toString());
      submitFormData.append("currentPrice", formData.currentPrice.toString());
      submitFormData.append("contractDuration", formData.contractDuration.toString());
      submitFormData.append("status", formData.status);
      
      // Add image if selected
      if (selectedFile) {
        submitFormData.append("image", selectedFile);
      }

      console.log("Submitting form data with image:", selectedFile ? "Yes" : "No");

      // FIX: Don't set headers in options, let axios handle it
      const result = await updatePlan.mutateAsync({
        id: id,
        data: submitFormData
      });

      console.log("Update result:", result);

      // Update initial data after successful save
      setInitialData(formData);
      
      // Clear selected file after successful upload
      if (selectedFile && previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
        setSelectedFile(null);
      }

      // Invalidate queries to force refetch
      queryClient.invalidateQueries({
        queryKey: [`stock-bond-plan-${id}`],
      });

      queryClient.invalidateQueries({
        queryKey: ["stock-bond/plans"],
      });

      // Show success toast (already handled by usePatch hook)
      // Navigate back to details page
      router.push(`/admin/plans-management/stock-bond/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      // Error toast already handled by usePatch hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      reset(initialData);
      // Reset image states
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Check if form has actual changes
  const hasRealChanges = () => {
    if (!initialData) return false;

    const currentValues = getValues();
    
    // Check text fields
    for (const key of Object.keys(initialData)) {
      const initialVal = initialData[key];
      const currentVal = currentValues[key];
      
      if (String(initialVal).trim() !== String(currentVal).trim()) {
        return true;
      }
    }
    
    // Check if image has changed
    if (selectedFile) {
      return true;
    }
    
    return false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

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
            {plan?.type === 'stock' ? 'Stock' : plan?.type === 'bond' ? 'Bond' : 'Stock/Bond'} Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load the {plan?.type === 'stock' ? 'stock' : plan?.type === 'bond' ? 'bond' : 'stock/bond'} plan for editing.
          </p>
          <Button onClick={() => router.push("/admin/plans-management?tab=stock-bond")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stock/Bond Plans
          </Button>
        </div>
      </div>
    );
  }

  const showUnsavedChanges = hasRealChanges();
  
  // Determine which image to display
  const displayImage = previewImage || existingImageSrc;
  const hasExistingImage = existingImageSrc && existingImageSrc !== "/placeholder-investment.jpg";

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
                Edit {plan.type === 'stock' ? 'Stock' : 'Bond'} Plan
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
            <CardTitle>{plan.type === 'stock' ? 'Stock' : 'Bond'} Plan Details</CardTitle>
            <CardDescription>
              Update the {plan.type === 'stock' ? 'stock' : 'bond'} plan information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Featured Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-1">
                  <input
                    type="file"
                    id="featuredImage"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />

                  {displayImage && displayImage !== "/placeholder-investment.jpg" ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full max-w-xs h-48">
                        <Image
                          src={displayImage}
                          alt="Plan preview"
                          fill
                          className="object-cover rounded-md"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={triggerFileInput}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {selectedFile 
                          ? "New image selected for upload" 
                          : hasExistingImage
                            ? "Current plan image. Upload a new one to replace."
                            : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                        <div className="text-gray-600">
                          <p className="mb-2">Upload a new image (JPEG, PNG, WebP)</p>
                          <p className="text-sm text-gray-500">
                            Recommended size: 1200x630 pixels
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                          onClick={triggerFileInput}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder={plan.type === 'stock' ? "e.g., Apple Inc. (AAPL)" : "e.g., US Treasury Bond"}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={type}
                    onValueChange={(val) => setValue("type", val, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Current: {plan.type}</p>
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

                {/* Unit Held */}
                <div className="space-y-2">
                  <Label htmlFor="unitHeld">Unit Held *</Label>
                  <Input
                    id="unitHeld"
                    type="number"
                    min="1"
                    step="1"
                    {...register("unitHeld")}
                  />
                  {errors.unitHeld && (
                    <p className="text-red-500 text-sm">{errors.unitHeld.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 1 unit</p>
                </div>

                {/* Change Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="changePercent">Change Percentage (%) *</Label>
                  <Input
                    id="changePercent"
                    type="number"
                    min="-100"
                    step="0.1"
                    {...register("changePercent")}
                  />
                  {errors.changePercent && (
                    <p className="text-red-500 text-sm">{errors.changePercent.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: -100%</p>
                </div>

                {/* Current Price */}
                <div className="space-y-2">
                  <Label htmlFor="currentPrice">Current Price ($) *</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    min="200"
                    step="0.01"
                    {...register("currentPrice")}
                  />
                  {errors.currentPrice && (
                    <p className="text-red-500 text-sm">{errors.currentPrice.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $200</p>
                </div>

                {/* Contract Duration */}
                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Contract Duration (days) *</Label>
                  <Input
                    id="contractDuration"
                    type="number"
                    min="30"
                    step="1"
                    {...register("contractDuration")}
                  />
                  {errors.contractDuration && (
                    <p className="text-red-500 text-sm">{errors.contractDuration.message}</p>
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