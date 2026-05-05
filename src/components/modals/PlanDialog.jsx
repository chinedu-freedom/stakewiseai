"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
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
import { Loader2 } from "lucide-react";
import { usePost, usePatch } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

// ✅ Schema
const planSchema = z.object({
  title: z.string().min(3, "Plan name is required"),
  minDeposit: z.coerce.number().min(1),
  maxDeposit: z.coerce.number().min(1),
  dailyProfit: z.coerce.number().min(1),
  contractDuration: z.coerce.number().min(1),
  planLevel: z.coerce.number().min(1, "Plan level is required and must be at least 1"),
  status: z.enum(["active", "inactive"]),
  isFixedDeposit: z.enum(["yes", "no"]),
});

export default function PlanDialog({ open, setOpen, initialData }) {
  const queryClient = useQueryClient();
  const isEdit = !!initialData?._id;

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
      planLevel: 1,
      status: "active",
      isFixedDeposit: "no",
    },
  });

  // ✅ Populate form when editing
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        minDeposit: initialData.minDeposit || 0,
        maxDeposit: initialData.maxDeposit || 0,
        dailyProfit: initialData.dailyProfit || 0,
        contractDuration: initialData.contractDuration || 0,
        planLevel: initialData.planLevel || 1,
        status: initialData.status || "active",
        isFixedDeposit: initialData.isFixedDeposit ? "yes" : "no",
      });
    }
  }, [initialData, reset]);

  const status = watch("status");
  const fixedDeposit = watch("isFixedDeposit");

  // ✅ Create (POST)
  const createMutation = usePost("/api/plans", ["plans"]);

  // ✅ Update (PATCH)
  const updateMutation = usePatch(
    (id) => `/api/plans/${id}`,
    ["plans"]
  );

  const onSubmit = (data) => {
    if (data.maxDeposit < data.minDeposit) {
      setError("maxDeposit", {
        type: "manual",
        message: "Max deposit must be ≥ min deposit",
      });
      return;
    }

    const payload = {
      title: data.title,
      minDeposit: data.minDeposit,
      maxDeposit: data.maxDeposit,
      dailyProfit: data.dailyProfit,
      contractDuration: data.contractDuration,
      planLevel: data.planLevel,
      status: data.status,
      isFixedDeposit: data.isFixedDeposit === "yes",
    };

    if (isEdit) {
      // ✅ PATCH request
      updateMutation.mutate(
        { id: initialData._id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            setOpen(false);
            reset();
          },
        }
      );
    } else {
      // ✅ POST request
      createMutation.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["plans"] });
          setOpen(false);
          reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Plan" : "Create Plan"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2"
        >
          <div>
            <Label>Plan Name *</Label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label>Min Deposit ($)</Label>
            <Input type="number" {...register("minDeposit")} />
          </div>

          <div>
            <Label>Max Deposit ($)</Label>
            <Input type="number" {...register("maxDeposit")} />
          </div>

          <div>
            <Label>Plan Level (1=Basic, 2=Standard, etc.)</Label>
            <Input type="number" {...register("planLevel")} />
            {errors.planLevel && (
              <p className="text-red-500 text-sm">
                {errors.planLevel.message}
              </p>
            )}
          </div>

          <div>
            <Label>Daily Profit (%)</Label>
            <Input type="number" {...register("dailyProfit")} />
          </div>

          <div>
            <Label>Contract Duration (days)</Label>
            <Input type="number" {...register("contractDuration")} />
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

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="mt-2">Cancel</Button>
          </DialogClose>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                {isEdit ? "Updating" : "Creating"}
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </>
            ) : isEdit ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}