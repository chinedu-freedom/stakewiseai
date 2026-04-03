"use client";

import { useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { usePost } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// Custom preprocess function to handle empty strings
const preprocessNumber = (val) => {
  if (val === "" || val === null || val === undefined) return 0;
  return Number(val);
};

const loanPlanSchema = z.object({
  title: z.string().min(1, "Loan title is required"),
  minAmount: z.preprocess(
    preprocessNumber,
    z.number()
      .min(2000, "Minimum amount must be at least $2000")
      .positive("Minimum amount must be a positive number")
  ),
  maxAmount: z.preprocess(
    preprocessNumber,
    z.number()
      .min(1, "Maximum amount is required")
      .positive("Maximum amount must be a positive number")
  ),
  interest: z.preprocess(
    preprocessNumber,
    z.number()
      .min(10, "Interest must be at least 10%")
      .positive("Interest must be a positive number")
  ),
  duration: z.preprocess(
    preprocessNumber,
    z.number()
      .min(30, "Duration must be at least 30 days")
      .int("Duration must be a whole number")
      .positive("Duration must be a positive number")
  ),
  statusLabel: z.enum(["active", "inactive"]),
});

export function LoanPlanDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loanPlanSchema),
    defaultValues: {
      title: "",
      minAmount: 2000,
      maxAmount: 5000,
      interest: 10,
      duration: 30,
      statusLabel: "active",
    },
  });

  const status = watch("statusLabel");

  const createPlanMutation = usePost(
    "/api/admin/investments/loan/plans", 
    ["loan/plans"],
    false
  );

  const onSubmit = (data) => {
    // Additional validation: maxAmount should be >= minAmount
    if (data.maxAmount < data.minAmount) {
      setError("maxAmount", {
        type: "manual",
        message: "Maximum amount must be greater than or equal to minimum amount"
      });
      return;
    }

    createPlanMutation.mutate(
      {
        title: data.title,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        interest: data.interest,
        duration: data.duration,
        status: data.statusLabel,
      },
      {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
          
          queryClient.invalidateQueries({ 
            queryKey: ["loan/plans"] 
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

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
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
    
    // Only allow numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if multiple decimals
    }
    
    setValue(fieldName, numericValue === "" ? "" : parseFloat(numericValue));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Loan Plan</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="space-y-1">
            <Label htmlFor="title">Loan Title *</Label>
            <Input 
              id="title" 
              {...register("title")} 
              placeholder="e.g., Business Loan"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="minAmount">Minimum Amount ($) *</Label>
            <Input
              id="minAmount"
              type="number"
              min="2000"
              step="1"
              {...register("minAmount", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "minAmount")
              })}
              placeholder="2000"
            />
            {errors.minAmount && <p className="text-red-500 text-sm">{errors.minAmount.message}</p>}
            <p className="text-xs text-gray-500">Minimum: $2000</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="maxAmount">Maximum Amount ($) *</Label>
            <Input
              id="maxAmount"
              type="number"
              min="1"
              step="1"
              {...register("maxAmount", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "maxAmount")
              })}
              placeholder="5000"
            />
            {errors.maxAmount && <p className="text-red-500 text-sm">{errors.maxAmount.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="interest">Interest (%) *</Label>
            <Input
              id="interest"
              type="number"
              min="10"
              step="0.1"
              {...register("interest", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "interest")
              })}
              placeholder="10"
            />
            {errors.interest && <p className="text-red-500 text-sm">{errors.interest.message}</p>}
            <p className="text-xs text-gray-500">Minimum: 10%</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="duration">Duration (days) *</Label>
            <Input
              id="duration"
              type="number"
              min="30"
              step="1"
              {...register("duration", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "duration")
              })}
              placeholder="30"
            />
            {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
            <p className="text-xs text-gray-500">Minimum: 30 days</p>
          </div>

          <div className="space-y-1">
            <Label>Status *</Label>
            <Select onValueChange={(val) => setValue("statusLabel", val)} value={status}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.statusLabel && <p className="text-red-500 text-sm">{errors.statusLabel.message}</p>}
          </div>
        </form>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="submit" 
            onClick={handleSubmit(onSubmit)} 
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? 
              <>
                Adding
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </> : "Add plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}