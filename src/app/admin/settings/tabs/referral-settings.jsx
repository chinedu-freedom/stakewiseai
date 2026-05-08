"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchData, usePatch } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";

export default function ReferralSettings() {
  const patchConfig = usePatch("/api/admin/referral-config", "referral-config");
  const { data, refetch, isLoading } = useFetchData("/api/admin/referral-config", "referral-config");

  const [form, setForm] = useState({
    level1: 10,
    level2: 5,
    level3: 1,
  });

  useEffect(() => {
    if (data?.success && data?.data) {
      setForm({
        level1: data.data.level1 ?? 10,
        level2: data.data.level2 ?? 5,
        level3: data.data.level3 ?? 1,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    patchConfig.mutate(form, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#3C3CF6]" />
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md p-6 shadow-sm w-full md:w-[65%]">
      <h2 className="text-base text-center font-medium mb-1">
        Referral System Configuration
      </h2>
      <p className="text-sm text-center text-muted-foreground mb-8">
        Set the commission percentages for each referral level
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Level 1 Commission (%)</label>
            <Input
              type="number"
              placeholder="e.g. 10"
              name="level1"
              value={form.level1}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">Percentage reward for direct referrals.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Level 2 Commission (%)</label>
            <Input
              type="number"
              placeholder="e.g. 5"
              name="level2"
              value={form.level2}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">Percentage reward for secondary referrals.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Level 3 Commission (%)</label>
            <Input
              type="number"
              placeholder="e.g. 1"
              name="level3"
              value={form.level3}
              onChange={handleChange}
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">Percentage reward for tertiary referrals.</p>
          </div>
        </div>

        <Button
          type="submit"
          className="mt-4 bg-[#3C3CF6] text-white hover:bg-[#2e2ee6] min-w-[140px] flex items-center justify-center gap-2"
          disabled={patchConfig.isPending}
        >
          {patchConfig.isPending ? "Saving" : "Save Changes"}
          {patchConfig.isPending && (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          )}
        </Button>
      </form>
    </div>
  );
}
