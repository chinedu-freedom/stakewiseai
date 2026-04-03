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
import { useImageSrc } from "@/hooks/useImageSrc"; // Import the hook

// Custom preprocess function to handle empty strings
const preprocessNumber = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
};

// Real estate plan schema
const realEstatePlanSchema = z.object({
  title: z.string().min(1, "Property title is required"),
  location: z.string().min(1, "Location is required"),
  roiEstimate: z.preprocess(
    preprocessNumber,
    z.number().min(10, "ROI estimate must be at least 10%")
  ),
  contractDuration: z.preprocess(
    preprocessNumber,
    z.number().min(30, "Contract duration must be at least 30 days")
  ),
  minInvestment: z.preprocess(
    preprocessNumber,
    z.number().min(2500, "Minimum investment must be at least $2,500")
  ),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'active' or 'inactive'"
  }),
});

export default function EditRealEstatePlanPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);
  
  // Image states
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch existing real estate plan data
  const { data, isLoading, error } = useFetchData(
    `/api/admin/investments/real-estate/plans/${id}`,
    `real-estate-plan-${id}`
  );

  const plan = data?.data;

  // Use the same useImageSrc hook as details page
  const existingImageSrc = useImageSrc(plan?.image, "/placeholder-property.jpg");

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
    resolver: zodResolver(realEstatePlanSchema),
    defaultValues: {
      title: "",
      location: "",
      roiEstimate: 10,
      contractDuration: 30,
      minInvestment: 2500,
      status: "active",
    },
  });

  // Store initial data when plan loads
  useEffect(() => {
    if (plan && !initialData) {
      const formData = {
        title: plan.title || "",
        location: plan.location || "",
        roiEstimate: plan.roiEstimate || 10,
        contractDuration: plan.contractDuration || 30,
        minInvestment: plan.minInvestment || 2500,
        status: (plan.status || "active").toLowerCase(),
      };
      
      reset(formData);
      setInitialData(formData);
    }
  }, [plan, reset, initialData]);

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

  // FIX: Add isFormData: true as the third parameter
  const updatePlan = usePatch(
    (id) => `/api/admin/investments/real-estate/plans/${id}`,
    ["real-estate/plans"],
    true // IMPORTANT: Add this third parameter
  );

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Add all form fields
      submitFormData.append("title", formData.title);
      submitFormData.append("location", formData.location);
      submitFormData.append("roiEstimate", formData.roiEstimate.toString());
      submitFormData.append("contractDuration", formData.contractDuration.toString());
      submitFormData.append("minInvestment", formData.minInvestment.toString());
      submitFormData.append("status", formData.status);
      
      // Add image if selected
      if (selectedFile) {
        submitFormData.append("image", selectedFile);
      }

      console.log("Submitting real estate form data with image:", selectedFile ? "Yes" : "No");

      // FIX: Remove the headers option since isFormData: true will handle it
      const result = await updatePlan.mutateAsync({
        id: id,
        data: submitFormData
        // REMOVED: options: { headers: {...} }
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
        queryKey: [`real-estate-plan-${id}`],
      });

      queryClient.invalidateQueries({
        queryKey: ["real-estate/plans"],
      });

      // Success toast is handled by usePatch hook
      // Navigate back to details page
      router.push(`/admin/plans-management/real-estate/${id}`);
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
            Real Estate Plan Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load the real estate plan for editing.
          </p>
          <Button onClick={() => router.push("/admin/plans-management?tab=real-estate")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Real Estate Plans
          </Button>
        </div>
      </div>
    );
  }

  const showUnsavedChanges = hasRealChanges();
  
  // Determine which image to display
  const displayImage = previewImage || existingImageSrc;
  const hasExistingImage = existingImageSrc && existingImageSrc !== "/placeholder-property.jpg";

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
                Edit Real Estate Plan
              </h1>
              <p className="text-gray-600">
                Update the details of {plan.title}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Property ID: {id}
          </div>
        </div>

        {/* Edit Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Update the property information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Property Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-1">
                  <input
                    type="file"
                    id="propertyImage"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />

                  {displayImage && displayImage !== "/placeholder-property.jpg" ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full max-w-xs h-48">
                        <Image
                          src={displayImage}
                          alt="Property preview"
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
                            ? "Current property image. Upload a new one to replace."
                            : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                        <div className="text-gray-600">
                          <p className="mb-2">Upload a property image (JPEG, PNG, WebP)</p>
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
                {/* Property Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Luxury Villa Investment"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g., Miami, Florida"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm">{errors.location.message}</p>
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

                {/* ROI Estimate */}
                <div className="space-y-2">
                  <Label htmlFor="roiEstimate">ROI Estimate (%) *</Label>
                  <Input
                    id="roiEstimate"
                    type="number"
                    min="10"
                    step="0.1"
                    {...register("roiEstimate")}
                  />
                  {errors.roiEstimate && (
                    <p className="text-red-500 text-sm">{errors.roiEstimate.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: 10%</p>
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

                {/* Minimum Investment */}
                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Minimum Investment ($) *</Label>
                  <Input
                    id="minInvestment"
                    type="number"
                    min="2500"
                    step="1"
                    {...register("minInvestment")}
                  />
                  {errors.minInvestment && (
                    <p className="text-red-500 text-sm">{errors.minInvestment.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum: $2,500</p>
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