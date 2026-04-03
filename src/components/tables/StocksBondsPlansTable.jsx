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
import { useFetchData, useDelete } from "@/hooks/useApi";
import Pagination from "@/components/Pagination";
import {
  getStatusColor,
  formatCurrency,
  filterAndSortData,
  formatDate,
  TableRowSkeleton,
} from "@/lib/tableHelpers";
import { useRouter } from "next/navigation";

export default function StocksBondsPlansTable({ searchTerm = "" }) {
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const limit = 10;
  const router = useRouter();

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/admin/investments/stock-bond/plans?page=${page}&limit=${limit}`,
    ["stock-bond/plans", page]
  );

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load stock/bond plans.
      </div>
    );
  }

  const deletePlan = useDelete(
    (id) => `/api/admin/investments/stock-bond/plans/${id}`,
    ["stock-bond/plans", page],
    { onSuccess: () => refetch() }
  );

  const plans = data?.data?.plans || data?.data || [];
  const meta = data?.meta ?? {};

  const filteredData = useMemo(() => {
    return filterAndSortData(
      plans,
      searchTerm,
      ["title"],
      "createdAt",
      "desc"
    );
  }, [plans, searchTerm]);

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete?._id) return;

    try {
      setIsDeleting(true);
      await deletePlan.mutateAsync(planToDelete._id);

      if (plans.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Unit Held</TableHead>
            <TableHead>Change %</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Contract Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => <TableRowSkeleton key={i} columns={9} />)
          ) : filteredData.length ? (
            filteredData.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-medium">{plan.title}</TableCell>
                <TableCell className="capitalize">{plan.type}</TableCell>
                <TableCell>{plan.unitHeld}</TableCell>
                <TableCell>{plan.changePercent}%</TableCell>
                <TableCell>{formatCurrency(plan.currentPrice)}</TableCell>
                <TableCell>{plan.contractDuration} days</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(plan.createdAt)}</TableCell>
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
                        onClick={() => router.push(`/admin/plans-management/stock-bond/${plan._id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/plans-management/stock-bond/${plan._id}/edit`)}
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
                colSpan={9}
                className="text-center py-10 text-gray-500"
              >
                No stock/bond plans found
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
                  Deleting
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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