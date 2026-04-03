"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Loader2, Eye, Edit } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  getStatusColor,
  formatCurrency,
  filterAndSortData,
  formatDate,
  TableRowSkeleton,
} from "@/lib/tableHelpers";
import { useRouter } from "next/navigation";

// Dummy plans data
const dummyPlans = [
  {
    _id: "PLAN-001",
    title: "Starter Plan",
    minDeposit: 100,
    maxDeposit: 1000,
    dailyProfit: 2.5,
    contractDuration: 30,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "PLAN-002",
    title: "Silver Plan",
    minDeposit: 1000,
    maxDeposit: 5000,
    dailyProfit: 3.0,
    contractDuration: 45,
    status: "active",
    createdAt: "2024-01-20T14:45:00Z"
  },
  {
    _id: "PLAN-003",
    title: "Gold Plan",
    minDeposit: 5000,
    maxDeposit: 15000,
    dailyProfit: 3.5,
    contractDuration: 60,
    status: "active",
    createdAt: "2024-01-25T09:15:00Z"
  },
  {
    _id: "PLAN-004",
    title: "Platinum Plan",
    minDeposit: 15000,
    maxDeposit: 30000,
    dailyProfit: 4.0,
    contractDuration: 90,
    status: "inactive",
    createdAt: "2024-02-01T16:20:00Z"
  },
  {
    _id: "PLAN-005",
    title: "Diamond Plan",
    minDeposit: 30000,
    maxDeposit: 100000,
    dailyProfit: 5.0,
    contractDuration: 120,
    status: "active",
    createdAt: "2024-02-05T11:00:00Z"
  },
  {
    _id: "PLAN-006",
    title: "Basic Plan",
    minDeposit: 50,
    maxDeposit: 500,
    dailyProfit: 1.5,
    contractDuration: 15,
    status: "active",
    createdAt: "2024-02-10T13:30:00Z"
  },
  {
    _id: "PLAN-007",
    title: "Premium Plan",
    minDeposit: 10000,
    maxDeposit: 25000,
    dailyProfit: 3.8,
    contractDuration: 75,
    status: "inactive",
    createdAt: "2024-02-15T08:45:00Z"
  },
  {
    _id: "PLAN-008",
    title: "Ultimate Plan",
    minDeposit: 50000,
    maxDeposit: 200000,
    dailyProfit: 6.0,
    contractDuration: 180,
    status: "active",
    createdAt: "2024-02-20T12:10:00Z"
  },
  {
    _id: "PLAN-009",
    title: "Bronze Plan",
    minDeposit: 500,
    maxDeposit: 3000,
    dailyProfit: 2.0,
    contractDuration: 30,
    status: "active",
    createdAt: "2024-02-25T09:30:00Z"
  },
  {
    _id: "PLAN-010",
    title: "VIP Plan",
    minDeposit: 100000,
    maxDeposit: 500000,
    dailyProfit: 7.5,
    contractDuration: 365,
    status: "inactive",
    createdAt: "2024-03-01T14:15:00Z"
  },
  {
    _id: "PLAN-011",
    title: "Enterprise Plan",
    minDeposit: 200000,
    maxDeposit: 1000000,
    dailyProfit: 8.0,
    contractDuration: 365,
    status: "active",
    createdAt: "2024-03-05T11:45:00Z"
  },
  {
    _id: "PLAN-012",
    title: "Lite Plan",
    minDeposit: 25,
    maxDeposit: 250,
    dailyProfit: 1.0,
    contractDuration: 7,
    status: "active",
    createdAt: "2024-03-10T10:00:00Z"
  }
];

export default function PlansTable({ searchTerm = "" }) {
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [plans, setPlans] = useState(dummyPlans);
  const limit = 10;
  const router = useRouter();
  const isLoading = false;

  // Dummy pagination meta
  const meta = {
    total: plans.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(plans.length / limit)
  };

  const filteredData = useMemo(() => {
    return filterAndSortData(
      plans,
      searchTerm,
      ["title", "_id"],
      "createdAt",
      "desc"
    );
  }, [plans, searchTerm]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete?._id) return;

    try {
      setIsDeleting(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove plan from state
      setPlans(prev => prev.filter(p => p._id !== planToDelete._id));
      
      // Adjust page if needed
      const remainingItems = filteredData.length - 1;
      const currentPageItems = (page - 1) * limit;
      if (remainingItems <= currentPageItems && page > 1) {
        setPage(page - 1);
      }
      
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Title</TableHead>
            <TableHead>Min Deposit</TableHead>
            <TableHead>Max Deposit</TableHead>
            <TableHead>Daily Profit</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <TableRowSkeleton key={i} columns={8} />
              ))
          ) : paginatedData.length ? (
            paginatedData.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-medium">
                  {plan.title}
                </TableCell>
                <TableCell>
                  {formatCurrency(plan.minDeposit)}
                </TableCell>
                <TableCell>
                  {formatCurrency(plan.maxDeposit)}
                </TableCell>
                <TableCell>
                  {plan.dailyProfit}%
                </TableCell>
                <TableCell>
                  {plan.contractDuration} days
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(plan.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu
                    open={openMenuId === plan._id}
                    onOpenChange={(open) =>
                      setOpenMenuId(open ? plan._id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/plans-management/plans/${plan._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/plans-management/plans/${plan._id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteClick(plan)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-10 text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium">No plans found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search term" : "Check back later for new plans"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination meta={meta} onPageChange={setPage} />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {planToDelete?.title || "this plan"}
            </span>{" "}
            plan record? This action cannot be undone.
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}