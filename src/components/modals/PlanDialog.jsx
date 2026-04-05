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

// Schema (frontend validation)
const planSchema = z.object({
  title: z.string().min(3, "Plan name is required"),
  minDeposit: z.coerce.number().min(1),
  maxDeposit: z.coerce.number().min(1),
  dailyProfit: z.coerce.number().min(1),
  contractDuration: z.coerce.number().min(1),
  status: z.enum(["active", "inactive"]),
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
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: "",
      minDeposit: 100,
      maxDeposit: 1000,
      dailyProfit: 8,
      contractDuration: 30,
      status: "active",
      isFixedDeposit: "no",
    },
  });

  const status = watch("status");
  const fixedDeposit = watch("isFixedDeposit");

  // ✅ FIXED endpoint (must match backend route)
  const createPlanMutation = usePost("/api/plans", [
    "plans",
  ]);

  const onSubmit = (data) => {
    if (data.maxDeposit < data.minDeposit) {
      setError("maxDeposit", {
        type: "manual",
        message: "Max deposit must be ≥ min deposit",
      });
      return;
    }

    // ✅ Match backend EXACTLY
    const payload = {
      title: data.title,
      minDeposit: data.minDeposit,
      maxDeposit: data.maxDeposit,
      dailyProfit: data.dailyProfit,
      contractDuration: data.contractDuration,
      status: data.status,
      isFixedDeposit: data.isFixedDeposit === "yes",
    };

    createPlanMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        reset();

        // 🔄 refresh data (like your signup flow)
        queryClient.invalidateQueries({ queryKey: ["plans"] });

        router.refresh();
      },
      onError: (err) => {
        console.error("Create plan error:", err);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Plan</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2"
        >
          <div>
            <Label>Plan Name *</Label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label>Min Deposit ($)</Label>
            <Input type="number" {...register("minDeposit")} />
            {errors.minDeposit && (
              <p className="text-red-500 text-sm">
                {errors.minDeposit.message}
              </p>
            )}
          </div>

          <div>
            <Label>Max Deposit ($)</Label>
            <Input type="number" {...register("maxDeposit")} />
            {errors.maxDeposit && (
              <p className="text-red-500 text-sm">
                {errors.maxDeposit.message}
              </p>
            )}
          </div>

          <div>
            <Label>Daily Profit (%)</Label>
            <Input type="number" {...register("dailyProfit")} />
            {errors.dailyProfit && (
              <p className="text-red-500 text-sm">
                {errors.dailyProfit.message}
              </p>
            )}
          </div>

          <div>
            <Label>Contract Duration (days)</Label>
            <Input type="number" {...register("contractDuration")} />
            {errors.contractDuration && (
              <p className="text-red-500 text-sm">
                {errors.contractDuration.message}
              </p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setValue("status", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fixed Deposit</Label>
            <Select
              value={fixedDeposit}
              onValueChange={(val) => setValue("isFixedDeposit", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}