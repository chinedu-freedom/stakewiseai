"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { usePost } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

// Custom preprocess function to handle empty strings
const preprocessNumber = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
};

// Validation schema matching your API
const stocksBondsPlanSchema = z.object({
  title: z.string().min(3, "Title is required"),
  type: z.enum(["stock", "bond"], {
    required_error: "Type is required",
    invalid_type_error: "Type must be 'stock' or 'bond'"
  }),
  unitHeld: z.preprocess(
    preprocessNumber,
    z.number()
      .min(1, "Unit held must be at least 1")
      .positive("Unit held must be a positive number")
  ),
  changePercent: z.preprocess(
    preprocessNumber,
    z.number()
      .min(-100, "Change percentage must be at least -100%")
  ),
  currentPrice: z.preprocess(
    preprocessNumber,
    z.number()
      .min(200, "Current price must be at least $200")
      .positive("Current price must be a positive number")
  ),
  contractDuration: z.preprocess(
    preprocessNumber,
    z.number()
      .min(30, "Contract duration must be at least 30 days")
      .int("Contract duration must be a whole number")
      .positive("Contract duration must be a positive number")
  ),
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'active' or 'inactive'"
  }),
});

export function StocksBondsPlanDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // Reset form and image states when modal closes
  const resetForm = () => {
    // Revoke object URL to prevent memory leaks
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    
    // Reset all states
    setPreviewImage(null);
    setSelectedFile(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Reset form
    reset();
  };

  // Effect to reset when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const removeImage = () => {
    // Revoke object URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Revoke previous object URL
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stocksBondsPlanSchema),
    defaultValues: {
      title: "",
      type: "stock",
      unitHeld: 1,
      changePercent: 0,
      currentPrice: 200,
      contractDuration: 30, // ADDED: Default contract duration
      status: "active",
    },
  });

  const type = watch("type");
  const status = watch("status");

  // Use isFormData = true for FormData submissions
  const createPlanMutation = usePost(
    "/api/admin/investments/stock-bond/plans", 
    ["stock-bond/plans"],
    true // IMPORTANT: Set isFormData to true
  );

  const onSubmit = (data) => {
    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("unitHeld", data.unitHeld.toString());
    formData.append("changePercent", data.changePercent.toString());
    formData.append("currentPrice", data.currentPrice.toString());
    formData.append("contractDuration", data.contractDuration.toString()); // ADDED
    formData.append("status", data.status);
    formData.append("image", selectedFile);

    createPlanMutation.mutate(
      formData,
      {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
          
          queryClient.invalidateQueries({ 
            queryKey: ["stock-bond/plans"] 
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ["plans"] 
          });
          
          reset();
        },
        onError: (error) => {
          console.error("Failed to create plan:", error);
        },
      }
    );
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Custom onChange handler for number inputs
  const handleNumberChange = (e, fieldName) => {
    const value = e.target.value;
    
    // Allow empty string (user deleting)
    if (value === "") {
      setValue(fieldName, "");
      return;
    }
    
    // Only allow numbers and one decimal point (and minus sign for changePercent)
    const numericValue = value.replace(/[^0-9.-]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Prevent multiple minus signs
    if ((numericValue.match(/-/g) || []).length > 1) {
      return;
    }
    
    const finalValue = numericValue === "" ? "" : parseFloat(numericValue);
    setValue(fieldName, finalValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Stock/Bond Plan</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              {...register("title")} 
              placeholder="e.g., Apple Inc. (AAPL)"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Type Selection */}
          <div className="space-y-1">
            <Label>Type *</Label>
            <Select onValueChange={(val) => setValue("type", val)} value={type}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          {/* Featured Image */}
          <div className="space-y-1">
            <Label>Featured Image *</Label>
            <Card>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="featuredImage"
                    ref={fileInputRef}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={createPlanMutation.isPending}
                  />

                  {previewImage ? (
                    <div className="mb-3">
                      <img
                        src={previewImage}
                        alt="Featured preview"
                        className="max-h-40 mx-auto rounded-md object-cover"
                      />
                      <div className="mt-2 flex justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          disabled={createPlanMutation.isPending}
                        >
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={createPlanMutation.isPending}
                          onClick={triggerFileInput}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-muted-foreground mb-2">
                        Upload Image (JPEG, PNG, WebP)
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={createPlanMutation.isPending}
                        onClick={triggerFileInput}
                      >
                        Choose File
                      </Button>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-1">
            <Label htmlFor="unitHeld">Units Held *</Label>
            <Input
              id="unitHeld"
              type="number"
              min="1"
              step="1"
              {...register("unitHeld", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "unitHeld")
              })}
              placeholder="1"
            />
            {errors.unitHeld && <p className="text-red-500 text-sm">{errors.unitHeld.message}</p>}
            <p className="text-xs text-gray-500">Minimum: 1 unit</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="changePercent">Change Percentage (%) *</Label>
            <Input
              id="changePercent"
              type="number"
              min="-100"
              step="0.01"
              {...register("changePercent", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "changePercent")
              })}
              placeholder="0"
            />
            {errors.changePercent && (
              <p className="text-red-500 text-sm">{errors.changePercent.message}</p>
            )}
            <p className="text-xs text-gray-500">Minimum: -100%</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="currentPrice">Current Price ($) *</Label>
            <Input
              id="currentPrice"
              type="number"
              min="200"
              step="0.01"
              {...register("currentPrice", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "currentPrice")
              })}
              placeholder="200"
            />
            {errors.currentPrice && (
              <p className="text-red-500 text-sm">{errors.currentPrice.message}</p>
            )}
            <p className="text-xs text-gray-500">Minimum: $200</p>
          </div>

          {/* ADDED: Contract Duration Field */}
          <div className="space-y-1">
            <Label htmlFor="contractDuration">Contract Duration (days) *</Label>
            <Input
              id="contractDuration"
              type="number"
              min="30"
              step="1"
              {...register("contractDuration", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "contractDuration")
              })}
              placeholder="30"
            />
            {errors.contractDuration && (
              <p className="text-red-500 text-sm">{errors.contractDuration.message}</p>
            )}
            <p className="text-xs text-gray-500">Minimum: 30 days</p>
          </div>

          <div className="space-y-1">
            <Label>Status *</Label>
            <Select onValueChange={(val) => setValue("status", val)} value={status}>
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
            <p className="text-xs text-gray-500">Status only allows "active" or "inactive"</p>
          </div>
        </form>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button 
              variant="outline"
              disabled={createPlanMutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={handleSubmit(onSubmit)} 
            disabled={createPlanMutation.isPending || !selectedFile}
          >
            {createPlanMutation.isPending ? 
              <>
                Adding
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </> : "Add Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}