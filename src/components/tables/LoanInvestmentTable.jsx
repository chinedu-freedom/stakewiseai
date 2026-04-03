"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  DialogDescription,
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

export default function LoanInvestmentTable({ searchTerm = "" }) {
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch loan investments from the loan-specific endpoint
  const { data, isLoading, refetch, error } = useFetchData(
    `/api/admin/user-investments/loan?page=${page}&limit=${limit}`,
    ["loan-investments", page]
  );

  if (error)
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load loan investments.
      </div>
    );

  const deleteInvestment = useDelete(
    (id) => `/api/admin/user-investments/${id}`,
    ["loan-investments", page],
    { onSuccess: () => refetch() }
  );

  const patchInvestment = usePatch(
    (id) => `/api/admin/user-investments/${id}`,
    ["loan-investments", page]
  );

  const investments = data?.data?.investments || data?.data || [];
  const meta = data?.meta ?? {};

  const filteredData = useMemo(() => {
    const list = !searchTerm.trim()
      ? investments
      : investments.filter((inv) =>
          [
            inv.user?.fullName,
            inv._id,
            inv.user?._id,
            inv.plan?.title,
            inv.planType,
          ]
            .filter(Boolean)
            .some((val) => val.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return list.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [investments, searchTerm]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "defaulted":
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

  const handleDeleteClick = (investment) => {
    setIsDeleteOpen(true);
    setInvestmentToDelete(investment);
  };

  const handleConfirmDelete = async () => {
    if (!investmentToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteInvestment.mutateAsync(investmentToDelete._id);

      // Check if we should go back a page after deletion
      if (investments.length === 1 && page > 1) {
        setPage(page - 1); // Go to previous page
      } else {
        refetch(); // Refetch current page
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setInvestmentToDelete(null);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleApprove = useCallback(
    async (investment) => {
      try {
        setIsProcessingId(investment._id);
        await patchInvestment.mutateAsync({
          id: investment._id,
          data: { status: "approved" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error approving loan:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchInvestment, refetch]
  );

  const handleReject = useCallback(
    async (investment) => {
      try {
        setIsProcessingId(investment._id);
        await patchInvestment.mutateAsync({
          id: investment._id,
          data: { status: "rejected" },
        });
        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error rejecting loan:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [patchInvestment, refetch]
  );

  const TableRowSkeleton = () => (
    <TableRow>
      {Array(9)
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
            <TableHead>Investment ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Plan Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : filteredData.length > 0 ? (
            filteredData.map((inv) => {
              const isApproved = inv.status?.toLowerCase() === "approved";
              const isRejected = inv.status?.toLowerCase() === "rejected";
              const isCompleted = inv.status?.toLowerCase() === "completed";
              const isActionDisabled = isRejected || isCompleted;
              
              return (
                <TableRow key={inv._id}>
                  <TableCell className="truncate max-w-[10px] font-medium">
                    {inv._id || "N/A"}
                  </TableCell>
                  <TableCell className="truncate max-w-[10px] font-medium">
                    {inv.user?._id || "N/A"}
                  </TableCell>
                  <TableCell>{inv.user?.fullName || "N/A"}</TableCell>
                  <TableCell>{inv.plan?.title || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>
                    {inv.plan?.contractDuration || "N/A"} months
                  </TableCell>
                  <TableCell>
                    {inv.plan?.interestRate
                      ? `${inv.plan.interestRate}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inv.status)}>
                      {inv.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.createdAt
                      ? new Date(inv.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuId === inv._id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? inv._id : null)
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
                          onClick={() => setSelectedInvestment(inv)}
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
                            patchInvestment.isLoading ||
                            isProcessingId === inv._id
                          }
                          onClick={() => !isActionDisabled && handleApprove(inv)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`${
                            isRejected
                              ? "opacity-50 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700"
                          }`}
                          disabled={
                            isRejected ||
                            isActionDisabled ||
                            patchInvestment.isLoading ||
                            isProcessingId === inv._id
                          }
                          onClick={() => !isActionDisabled && handleReject(inv)}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(inv)}
                          disabled={isDeleting}
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
              <TableCell colSpan={10} className="text-center py-5 text-gray-500">
                No loan investments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {investmentToDelete?.user?.fullName || "this loan investment"}
            </span>
            's record? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
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

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedInvestment}
        onOpenChange={() => setSelectedInvestment(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loan Investment Details</DialogTitle>
            <DialogDescription>
              Full details of the selected loan investment.
            </DialogDescription>
          </DialogHeader>

          {selectedInvestment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Investment ID
                  </p>
                  <p className="truncate">{selectedInvestment._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedInvestment.status)}>
                    {selectedInvestment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p>{selectedInvestment.user?.fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedInvestment.user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="truncate">{selectedInvestment.user?._id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{selectedInvestment.user?.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Plan Title
                  </p>
                  <p>{selectedInvestment.plan?.title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan Type</p>
                  <p>{selectedInvestment.planType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p>{formatCurrency(selectedInvestment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Interest Rate
                  </p>
                  <p>
                    {selectedInvestment.plan?.interestRate
                      ? `${selectedInvestment.plan.interestRate}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p>
                    {selectedInvestment.plan?.contractDuration || "N/A"} months
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Collateral Type
                  </p>
                  <p>{selectedInvestment.plan?.collateralType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Start Date
                  </p>
                  <p>
                    {selectedInvestment.startDate
                      ? new Date(selectedInvestment.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p>
                    {selectedInvestment.endDate
                      ? new Date(selectedInvestment.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created At
                  </p>
                  <p>
                    {new Date(selectedInvestment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Updated At
                  </p>
                  <p>
                    {new Date(selectedInvestment.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedInvestment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}