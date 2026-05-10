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
import { formatDistanceToNow } from "date-fns";

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

export default function AccessLogsTable({ userId }) {
  const [month, setMonth] = useState("all");
  
  // Fetch activities specific to this user
  const { data, isLoading } = useFetchData(`/api/users/${userId}/activities`);
  const activities = data?.data || [];

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
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </TableCell>
        ))}
    </TableRow>
  );

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-700">Access Logs</h3>
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

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[200px]">Last Access</TableHead>
                <TableHead className="w-[150px]">IP Address</TableHead>
                <TableHead className="min-w-[300px]">Browser (User Agent)</TableHead>
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
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">
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
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                      </div>
                    </TableCell>

                    
                    
                    <TableCell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {a.ipAddress || "Unknown"}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-sm text-gray-600 break-all">
                      {a.userAgent || "Unknown"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-gray-500 py-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">No access logs found</p>
                      <p className="text-sm text-gray-400">
                        {month !== "all" ? "No access logs for this month" : "No activity recorded yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
