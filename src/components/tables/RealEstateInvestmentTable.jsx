"use client";

import React, { useState, useMemo } from "react";
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
import { MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react";
import { useFetchData, useDelete } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { 
  getStatusColor, 
  formatCurrency, 
  filterAndSortData, 
  formatDate, 
  TableRowSkeleton 
} from "@/lib/tableHelpers";

export default function RealEstateInvestmentTable({ searchTerm = "" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch real estate investments from the real-estate-specific endpoint
  const { data, isLoading, refetch, error } = useFetchData(
    `/api/admin/user-investments/real-estate?page=${page}&limit=${limit}`,
    ["user-investments/real-estate", page]
  );

  if (error)
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load real estate investments.
      </div>
    );

  const deleteInvestment = useDelete(
    (id) => `/api/admin/user-investments/${id}`,
    ["user-investments/real-estate", page],
    { onSuccess: () => refetch() }
  );

  // Data is directly in data.data array based on the response
  const investments = data?.data || [];
  const meta = data?.meta ?? {};

  // Use filterAndSortData helper instead of manual filtering
  const filteredInvestments = useMemo(() => {
    return filterAndSortData(
      investments,
      searchTerm,
      [
        "_id", 
        "user._id", 
        "user.fullName",
        "plan.title",
        "planType",
        "status"
      ],
      "createdAt",
      "desc"
    );
  }, [investments, searchTerm]);

  const handleDeleteClick = (investment) => {
    setInvestmentToDelete(investment);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!investmentToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteInvestment.mutateAsync(investmentToDelete._id);

      // Check if we should go back a page after deletion
      if (investments.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setInvestmentToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting real estate investment:", error);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Investment ID</TableHead>
            <TableHead className="whitespace-nowrap">User ID</TableHead>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="whitespace-nowrap">Plan Title</TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Created At</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, idx) => (
                <TableRowSkeleton 
                  key={idx} 
                  columns={8} 
                  maxWidth="120px" 
                />
              ))
          ) : filteredInvestments.length > 0 ? (
            filteredInvestments.map((inv) => {
              return (
                <TableRow key={inv._id}>
                  <TableCell className="truncate max-w-[120px] font-mono text-xs">
                    {inv._id || "N/A"}
                  </TableCell>
                  <TableCell className="truncate max-w-[120px] font-mono text-xs">
                    {inv.user?._id || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {inv.user?.fullName || "N/A"}
                  </TableCell>
                  <TableCell>
                    {inv.plan?.title || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inv.status)}>
                      {inv.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(inv.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuId === inv._id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? inv._id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild disabled={isDeleting}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/financial-services/real-estate/${inv._id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" /> 
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDeleteClick(inv)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> 
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell 
                colSpan={8} 
                className="text-center py-10 text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium">No real estate investments found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search term" : "Check back later for new investments"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {investmentToDelete?.user?.fullName || "this investment"}
              </span>
              's real estate investment record?
            </p>
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-xs text-red-600">
                ⚠️ This action cannot be undone. All investment data will be permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}