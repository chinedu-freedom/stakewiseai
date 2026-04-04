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

const cryptoPlanSchema = z.object({
  title: z.string().min(3, "Plan name is required"),
  minDeposit: z.preprocess(
    preprocessNumber,
    z.number()
      .min(100, "Minimum deposit must be at least $100")
      .positive("Minimum deposit must be a positive number")
  ),
  maxDeposit: z.preprocess(
    preprocessNumber,
    z.number()
      .min(100, "Maximum deposit must be at least $100")
      .positive("Maximum deposit must be a positive number")
  ),
  dailyProfit: z.preprocess(
    preprocessNumber,
    z.number()
      .min(8, "Daily profit must be at least 8%")
      .positive("Daily profit must be a positive number")
  ),
  contractDuration: z.preprocess(
    preprocessNumber,
    z.number()
      .min(1, "Contract duration must be at least 1 day")
      .int("Contract duration must be a whole number")
      .positive("Contract duration must be a positive number")
  ),
  statusLabel: z.enum(["active", "inactive", "completed"]),
  isFixedDeposit: z.enum(["yes", "no"]),
});

export function PlanDialog() {
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
    resolver: zodResolver(cryptoPlanSchema),
    defaultValues: {
      title: "",
      minDeposit: 100,
      maxDeposit: 1000,
      dailyProfit: 8,
      contractDuration: 30,
      statusLabel: "active",
      isFixedDeposit: "no",
    },
  });

  const status = watch("statusLabel");
  const fixedDeposit = watch("isFixedDeposit");

  const createPlanMutation = usePost(
    "/api/admin/investments/crypto/plans", 
    ["crypto/plans"],
    false
  );

  const onSubmit = (data) => {
    // Additional validation: maxDeposit should be >= minDeposit
    if (data.maxDeposit < data.minDeposit) {
      setError("maxDeposit", {
        type: "manual",
        message: "Maximum deposit must be greater than or equal to minimum deposit"
      });
      return;
    }

    createPlanMutation.mutate(
      {
        title: data.title,
        minDeposit: data.minDeposit,
        maxDeposit: data.maxDeposit,
        dailyProfit: data.dailyProfit,
        contractDuration: data.contractDuration,
        status: data.statusLabel,
        isFixedDeposit: data.isFixedDeposit === "yes" ? true : false,
      },
      {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
          
          queryClient.invalidateQueries({ 
            queryKey: ["crypto/plans"] 
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
          <DialogTitle>Add Crypto Plan</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="space-y-1">
            <Label htmlFor="title">Plan Name *</Label>
            <Input 
              id="title" 
              {...register("title")} 
              placeholder="e.g., Bitcoin Trading Plan"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="minDeposit">Minimum Deposit ($) *</Label>
            <Input
              id="minDeposit"
              type="number"
              min="100"
              step="1"
              {...register("minDeposit", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "minDeposit")
              })}
              placeholder="100"
            />
            {errors.minDeposit && <p className="text-red-500 text-sm">{errors.minDeposit.message}</p>}
            <p className="text-xs text-gray-500">Minimum: $100</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="maxDeposit">Maximum Deposit ($) *</Label>
            <Input
              id="maxDeposit"
              type="number"
              min="100"
              step="1"
              {...register("maxDeposit", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "maxDeposit")
              })}
              placeholder="1000"
            />
            {errors.maxDeposit && <p className="text-red-500 text-sm">{errors.maxDeposit.message}</p>}
            <p className="text-xs text-gray-500">Minimum: $100</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dailyProfit">Daily Profit (%) *</Label>
            <Input
              id="dailyProfit"
              type="number"
              min="8"
              step="0.1"
              {...register("dailyProfit", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "dailyProfit")
              })}
              placeholder="8"
            />
            {errors.dailyProfit && <p className="text-red-500 text-sm">{errors.dailyProfit.message}</p>}
            <p className="text-xs text-gray-500">Minimum: 8%</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="contractDuration">Contract Duration (days) *</Label>
            <Input
              id="contractDuration"
              type="number"
              min="1"
              step="1"
              {...register("contractDuration", { 
                valueAsNumber: true,
                onChange: (e) => handleNumberChange(e, "contractDuration")
              })}
              placeholder="30"
            />
            {errors.contractDuration && <p className="text-red-500 text-sm">{errors.contractDuration.message}</p>}
            <p className="text-xs text-gray-500">Minimum: 1 day</p>
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
          
          {/* Fixed Deposit Select */}
          <div className="space-y-1">
            <Label className="mt-1">Fixed Deposit *</Label>
            <Select onValueChange={(val) => setValue("isFixedDeposit", val)} value={fixedDeposit}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.isFixedDeposit && <p className="text-red-500 text-sm">{errors.isFixedDeposit.message}</p>}
            <p className="text-xs text-gray-500 mt-2 ml-1">Select Yes if this is a fixed deposit plan</p>
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding
              </> : "Add plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}