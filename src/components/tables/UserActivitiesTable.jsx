"use client";

import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/tableHelpers";
import { useFetchData } from "@/hooks/useApi";

const months = [
  { label: "All Months", value: "all" },
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function UserActivitiesTable() {
  const [month, setMonth] = useState("all");
  const { data, isLoading } = useFetchData("/api/admin/dashboard-stats");
  
  const activities = data?.data?.activities || [];

  const filteredActivities = useMemo(() => {
    if (month === "all") return activities;

    return activities.filter((a) => {
      if (!a.timestamp) return false;

      const date = new Date(a.timestamp);
      if (isNaN(date.getTime())) return false;

      const activityMonth = String(date.getMonth() + 1).padStart(2, "0");
      return activityMonth === month;
    });
  }, [activities, month]);

  // Skeleton loader
  const TableRowSkeleton = () => (
    <TableRow>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </TableCell>
        ))}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-700">User Activities</h3>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[200px]">
                Username
              </TableHead>
              <TableHead className="w-[200px]">
                Activity
              </TableHead>
              <TableHead className="w-[120px]">
                Status
              </TableHead>
              <TableHead className="min-w-[300px]">
                Details
              </TableHead>
              <TableHead className="w-[200px] text-right">
                Date & Time
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, idx) => <TableRowSkeleton key={idx} />)
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {a.user?.username || "Unknown"}
                  </TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 break-words max-w-[300px]">
                    {a.details}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {new Date(a.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }) +
                      " · " +
                      new Date(a.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-6"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-medium">No activities found</p>
                    <p className="text-sm text-gray-400">
                      {month !== "all" ? "No activities for this month" : "Check back later for user activities"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}