"use client";

import { useState, useMemo, useCallback } from "react";
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

export default function DepositTable({ searchTerm = "" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/admin/deposits?page=${page}&limit=${limit}`,
    ["deposits", page]
  );

  if (error)
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load deposits.
      </div>
    );

  const deleteDeposit = useDelete(
    (id) => `/api/admin/deposits/${id}`,
    ["deposits", page],
    { onSuccess: () => refetch() }
  );

  const patchDeposit = usePatch(
    (id) => `/api/admin/deposits/${id}`,
    ["deposits", page]
  );

  const deposits = Array.isArray(data?.data?.deposits)
  ? data.data.deposits
  : [];

  const meta = data?.meta ?? {};

  const filteredData = useMemo(() => {
  const list = !searchTerm.trim()
    ? deposits
    : deposits.filter((dep) =>
        [
          dep.user?.fullName,
          dep._id,
          dep.user?._id,
          dep.crypto,
          dep.transactionId,
        ]
          .filter(Boolean)
          .some((val) =>
            val.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
      );

  return [...list].sort(
    (a, b) =>
      new Date(b.fundedAt || b.createdAt || 0) -
      new Date(a.fundedAt || a.createdAt || 0)
  );
}, [deposits, searchTerm]);


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
    if (!amount) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  const handleDeleteClick = (deposit) => {
    setIsDeleteOpen(true);
    setDepositToDelete(deposit);
  };

  const handleConfirmDelete = async () => {
    if (!depositToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteDeposit.mutateAsync(depositToDelete._id);

      // Check if we should go back a page after deletion
      if (deposits.length === 1 && page > 1) {
        setPage(page - 1); // Go to previous page
      } else {
        refetch(); // Refetch current page
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
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deposit ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Crypto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : filteredData.length > 0 ? (
            filteredData.map((dep) => {
              const isApproved = dep.status?.toLowerCase() === "successful" || dep.status?.toLowerCase() === "approved";
              const isDeclined = dep.status?.toLowerCase() === "failed" || dep.status?.toLowerCase() === "rejected";
              const isActionDisabled = isApproved || isDeclined;
              
              return (
                <TableRow key={dep._id}>
                  <TableCell className="truncate max-w-[160px] font-medium">
                    {dep._id || "N/A"}
                  </TableCell>
                  <TableCell className="truncate max-w-[160px] font-medium">
                    {dep.user?._id || "N/A"}
                  </TableCell>
                  <TableCell>{dep.user?.fullName || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(dep.amount)}</TableCell>
                  <TableCell>{dep.crypto || dep.currency || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(dep.status)}>
                      {dep.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuId === dep._id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? dep._id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild disabled={isDeleting}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                               onClick={() =>
                            router.push(
                              `/admin/transactions/deposit/${dep._id}`
                            )
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={`${
                            isApproved
                              ? "opacity-50 cursor-not-allowed"
                              : "text-green-600 hover:text-green-700"
                          }`}
                          disabled={
                            isApproved ||
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
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700"
                          }`}
                          disabled={
                            isDeclined ||
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
                          className="text-destructive"
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
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No deposits found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination meta={meta} onPageChange={setPage} />

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {depositToDelete?.user?.fullName || "this transaction"}
            </span>
            's transaction record? This action cannot be undone.
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