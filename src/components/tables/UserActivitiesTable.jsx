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

// Dummy activities data
const dummyActivities = [
  {
    _id: "ACT-001",
    action: "User Login",
    status: "success",
    details: "User john.doe@example.com logged in successfully",
    timestamp: "2024-03-15T09:30:00Z"
  },
  {
    _id: "ACT-002",
    action: "Investment Created",
    status: "success",
    details: "User jane.smith@example.com invested $5,000 in Silver Plan",
    timestamp: "2024-03-15T10:15:00Z"
  },
  {
    _id: "ACT-003",
    action: "Withdrawal Request",
    status: "pending",
    details: "User robert.johnson@example.com requested withdrawal of $1,200",
    timestamp: "2024-03-14T14:45:00Z"
  },
  {
    _id: "ACT-004",
    action: "KYC Submission",
    status: "pending",
    details: "User emily.brown@example.com submitted KYC documents",
    timestamp: "2024-03-14T11:20:00Z"
  },
  {
    _id: "ACT-005",
    action: "Deposit",
    status: "success",
    details: "User michael.wilson@example.com deposited $10,000 via Bank Transfer",
    timestamp: "2024-03-13T16:30:00Z"
  },
  {
    _id: "ACT-006",
    action: "Investment Created",
    status: "failed",
    details: "User sarah.davis@example.com failed to invest $2,000 - Insufficient balance",
    timestamp: "2024-03-13T09:45:00Z"
  },
  {
    _id: "ACT-007",
    action: "Profile Update",
    status: "success",
    details: "User david.martinez@example.com updated profile information",
    timestamp: "2024-03-12T13:20:00Z"
  },
  {
    _id: "ACT-008",
    action: "Withdrawal Approved",
    status: "success",
    details: "User lisa.anderson@example.com withdrawal of $3,500 was approved",
    timestamp: "2024-03-12T10:00:00Z"
  },
  {
    _id: "ACT-009",
    action: "Password Change",
    status: "success",
    details: "User james.taylor@example.com changed password",
    timestamp: "2024-03-11T15:45:00Z"
  },
  {
    _id: "ACT-010",
    action: "Investment Matured",
    status: "success",
    details: "User maria.garcia@example.com investment of $15,000 matured with profit of $3,000",
    timestamp: "2024-03-11T08:30:00Z"
  },
  {
    _id: "ACT-011",
    action: "KYC Approved",
    status: "success",
    details: "User thomas.lee@example.com KYC verification approved",
    timestamp: "2024-03-10T14:15:00Z"
  },
  {
    _id: "ACT-012",
    action: "Withdrawal Request",
    status: "failed",
    details: "User patricia.white@example.com withdrawal of $500 failed - Account not verified",
    timestamp: "2024-03-10T11:00:00Z"
  },
  {
    _id: "ACT-013",
    action: "Referral Bonus",
    status: "success",
    details: "User john.doe@example.com earned $100 referral bonus for referring jane.smith@example.com",
    timestamp: "2024-03-09T16:20:00Z"
  },
  {
    _id: "ACT-014",
    action: "Investment Created",
    status: "success",
    details: "User emily.brown@example.com invested $7,500 in Gold Plan",
    timestamp: "2024-03-09T09:45:00Z"
  },
  {
    _id: "ACT-015",
    action: "Account Suspension",
    status: "warning",
    details: "User robert.johnson@example.com account temporarily suspended due to suspicious activity",
    timestamp: "2024-03-08T13:30:00Z"
  }
];

export default function UserActivitiesTable() {
  const [month, setMonth] = useState("all");
  const [activities, setActivities] = useState(dummyActivities);
  const isLoading = false;

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
      {Array(4)
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
                Date & Time
              </TableHead>
              <TableHead className="w-[250px]">
                Activity
              </TableHead>
              <TableHead className="w-[120px]">
                Status
              </TableHead>
              <TableHead className="min-w-[400px]">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, idx) => <TableRowSkeleton key={idx} />)
            ) : filteredActivities.length > 0 ? (
              filteredActivities.slice(0, 4).map((a) => (
                <TableRow key={a._id}>
                  <TableCell className="whitespace-nowrap">
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

                  <TableCell>{a.action}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 break-words max-w-[400px]">
                    {a.details}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
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