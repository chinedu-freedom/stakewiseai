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

export default function WithdrawalTable({ searchTerm = "", statusFilter = "all" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/withdrawals?page=${page}&limit=${limit}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}${statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : ""}`,
    ["withdrawals", page, searchTerm, statusFilter]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const deleteWithdrawal = useDelete(
    (id) => `/api/withdrawals/${id}`,
    ["withdrawals", page],
    {
      onSuccess: () => {
        // Check if we should go back a page after deletion
        if (transactions.length === 1 && page > 1) {
          setPage(page - 1); // Go to previous page
        } else {
          refetch(); // Refetch current page
        }
      },
    },
  );

  const patchWithdrawal = usePatch(
    (id) => `/api/withdrawals/${id}`,
    ["withdrawals", page],
  );

  if (error)
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load withdrawals.
      </div>
    );

  // Extract records and pagination from the new response structure
  const records = data?.data?.records || [];
  const pagination = data?.data?.pagination || {};

  const transactions = records;
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

  const filteredData = transactions;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "successful":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteOpen(true);
  };

  const handleAccept = useCallback(
    async (transaction) => {
      try {
        setIsProcessingId(transaction._id);

        await patchWithdrawal.mutateAsync({
          id: transaction._id,
          data: { status: "successful" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error approving transaction:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchWithdrawal, refetch],
  );

  const handleDecline = useCallback(
    async (transaction) => {
      try {
        setIsProcessingId(transaction._id);
        await patchWithdrawal.mutateAsync({
          id: transaction._id,
          data: { status: "failed" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error declining transaction:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchWithdrawal, refetch],
  );

  const handleConfirmDelete = async () => {
    if (!transactionToDelete?._id) return;

    try {
      setIsDeleting(true);
      await deleteWithdrawal.mutateAsync(transactionToDelete._id);
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const TableRowSkeleton = () => (
    <TableRow>
      {Array(7)
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
              <TableHead className="whitespace-nowrap">Withdrawal ID</TableHead>
              <TableHead className="whitespace-nowrap">Username</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Gross Amount</TableHead>
              <TableHead className="whitespace-nowrap">Fee (6%)</TableHead>
              <TableHead className="whitespace-nowrap">Net Amount</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Requested At</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(8)
                .fill(0)
                .map((_, idx) => <TableRowSkeleton key={idx} />)
            ) : filteredData.length > 0 ? (
              filteredData.map((txn) => {
                const isApproved = txn.status?.toLowerCase() === "successful";
                const isDeclined = txn.status?.toLowerCase() === "failed";
                const isActionDisabled = isApproved || isDeclined;

                return (
                  <TableRow key={txn._id}>
                    <TableCell className="truncate max-w-[160px] font-medium whitespace-nowrap">
                      {txn._id || "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{txn.user?.username || "N/A"}</TableCell>
                    <TableCell className="truncate max-w-[200px] whitespace-nowrap">
                      {txn.user?.email || "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold text-gray-500">${txn.amount?.toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-red-500">-${txn.fee ? txn.fee.toLocaleString() : (txn.amount * 0.06).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap font-bold text-emerald-600">${txn.netAmount ? txn.netAmount.toLocaleString() : (txn.amount * 0.94).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(txn.status)}>
                        {txn.status || "N/A"}
                      </Badge>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {txn.requestedAt
                        ? new Date(txn.requestedAt).toLocaleDateString("en-GB")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        open={openMenuId === txn._id}
                        onOpenChange={(isOpen) =>
                          setOpenMenuId(isOpen ? txn._id : null)
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
                                `/admin/transactions/withdrawal/${txn._id}`,
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
                              patchWithdrawal.isLoading ||
                              isProcessingId === txn._id
                            }
                            onClick={() => !isActionDisabled && handleAccept(txn)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className={`${
                              isDeclined
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer"
                            }`}
                            disabled={
                              isActionDisabled ||
                              patchWithdrawal.isLoading ||
                              isProcessingId === txn._id
                            }
                            onClick={() =>
                              !isActionDisabled && handleDecline(txn)
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Decline
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive font-medium cursor-pointer"
                            onClick={() => handleDeleteClick(txn)}
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
                    <p className="text-lg font-medium">No withdrawal(s) found</p>
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
              {transactionToDelete?.user?.username || "this transaction"}
            </span>
            's withdrawal record? This action cannot be undone.
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
