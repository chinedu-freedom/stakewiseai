"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import {
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useFetchData, useDelete, usePatch } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

export default function DepositTable({ searchTerm = "", statusFilter = "all" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/deposits?page=${page}&limit=${limit}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}${statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""}`,
    ["deposits", page, searchTerm, statusFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const deleteDeposit = useDelete(
    (id) => `/api/deposits/${id}`,
    ["deposits", page],
    {
      onSuccess: () => {
        // Check if we should go back a page after deletion
        if (deposits.length === 1 && page > 1) {
          setPage(page - 1); // Go to previous page
        } else {
          refetch(); // Refetch current page
        }
      },
    }
  );

  const patchDeposit = usePatch(
    (id) => `/api/deposits/${id}`,
    ["deposits", page]
  );

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load deposits.
      </div>
    );
  }

  // Extract records and pagination from the response structure
  const records = data?.data?.records || [];
  const pagination = data?.data?.pagination || {};

  const deposits = records;
  const meta = {
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
  };

  const filteredData = deposits;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "successful":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return `$${amount.toLocaleString()}`;
  };

  const handleDeleteClick = (deposit) => {
    setDepositToDelete(deposit);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!depositToDelete?._id) return;

    try {
      setIsDeleting(true);
      await deleteDeposit.mutateAsync(depositToDelete._id);

      if (deposits.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDepositToDelete(null);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleAccept = useCallback(
    async (deposit) => {
      try {
        setIsProcessingId(deposit._id);
        await patchDeposit.mutateAsync({
          id: deposit._id,
          data: { status: "successful" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error approving deposit:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchDeposit, refetch]
  );

  const handleDecline = useCallback(
    async (deposit) => {
      try {
        setIsProcessingId(deposit._id);
        await patchDeposit.mutateAsync({
          id: deposit._id,
          data: { status: "failed" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error declining deposit:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchDeposit, refetch]
  );

  const TableRowSkeleton = () => (
    <TableRow>
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 w-full max-w-[120px] bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
        ))}
    </TableRow>
  );

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden text-sm">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="whitespace-nowrap">Deposit ID</TableHead>
              <TableHead className="whitespace-nowrap">Username</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Amount</TableHead>
              <TableHead className="whitespace-nowrap">Crypto</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Funded At</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(8)
                .fill(0)
                .map((_, idx) => <TableRowSkeleton key={idx} />)
            ) : filteredData.length > 0 ? (
              filteredData.map((dep) => {
                const isApproved = dep.status?.toLowerCase() === "successful";
                const isDeclined = dep.status?.toLowerCase() === "failed";
                const isActionDisabled = isApproved || isDeclined;

                return (
                  <TableRow key={dep._id}>
                    <TableCell className="truncate max-w-[160px] font-medium whitespace-nowrap">
                      {dep._id || "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dep.user?.username || "N/A"}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px] whitespace-nowrap">
                      {dep.user?.email || "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-900">
                      {formatCurrency(dep.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dep.crypto || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(dep.status)}>
                        {dep.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dep.fundedAt
                        ? new Date(dep.fundedAt).toLocaleDateString("en-GB")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        open={openMenuId === dep._id}
                        onOpenChange={(isOpen) =>
                          setOpenMenuId(isOpen ? dep._id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild disabled={isDeleting}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/transactions/deposit/${dep._id}`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className={`${
                              isApproved
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-green-600 hover:text-green-700 font-medium cursor-pointer"
                            }`}
                            disabled={
                              isActionDisabled ||
                              patchDeposit.isLoading ||
                              isProcessingId === dep._id
                            }
                            onClick={() => !isActionDisabled && handleAccept(dep)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className={`${
                              isDeclined
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-red-600 hover:text-red-700 font-medium cursor-pointer"
                            }`}
                            disabled={
                              isActionDisabled ||
                              patchDeposit.isLoading ||
                              isProcessingId === dep._id
                            }
                            onClick={() => !isActionDisabled && handleDecline(dep)}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Decline
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive font-medium cursor-pointer"
                            onClick={() => handleDeleteClick(dep)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-medium">No deposit(s) found</p>
                    <p className="text-sm text-gray-400">Check back later for new requests</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {depositToDelete?.user?.username || "this deposit"}
            </span>
            's deposit record? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="min-w-[140px] flex items-center justify-center gap-2"
            >
              {isDeleting ? "Deleting" : "Confirm Delete"}
              {isDeleting && (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}