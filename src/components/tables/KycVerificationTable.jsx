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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useFetchData, usePatch, useDelete } from "@/hooks/useApi";
import { getStatusColor, filterAndSortData } from "@/lib/tableHelpers";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

export default function KycVerificationTable({ searchTerm = "" }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [kycToDelete, setKycToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/admin/kycs?page=${page}&limit=${limit}`,
    ["kycs", page]
  );

  const updateKycStatus = usePatch(
    (id) => `/api/admin/kycs/${id}`,
    ["kycs", page]
  );

  const deleteKyc = useDelete(
    (id) => `/api/admin/kycs/${id}`,
    ["kycs", page],
    { onSuccess: () => {
      // Check if we should go back a page after deletion
      if (kycList.length === 1 && page > 1) {
        setPage(page - 1); // Go to previous page
      } else {
        refetch(); // Refetch current page
      }
    }}
  );

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load KYC submissions.
      </div>
    );
  }

  const kycList = data?.data?.kycs || data?.data || [];
  const meta = data?.meta || {};

  const formatDocumentType = (idType) => {
    switch (idType) {
      case "national_id":
        return "National ID";
      case "passport":
        return "Passport";
      case "driver's_license":
        return "Driver's License";
      default:
        return idType;
    }
  };

  const handleApprove = useCallback(
    async (kyc) => {
      try {
        setIsProcessingId(kyc._id);

        await updateKycStatus.mutateAsync({
          id: kyc._id,
          data: { status: "approve" },
        });

        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error approving KYC:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [updateKycStatus, refetch]
  );

  const handleReject = useCallback(
    async (kyc) => {
      try {
        setIsProcessingId(kyc._id);

        await updateKycStatus.mutateAsync({
          id: kyc._id,
          data: { status: "reject" },
        });

        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error rejecting KYC:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [updateKycStatus, refetch]
  );

  const handleDeleteClick = (kyc) => {
    setIsDeleteOpen(true);
    setKycToDelete(kyc);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!kycToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteKyc.mutateAsync(kycToDelete._id);
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setKycToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting KYC:", error);
    }
  };

  const filteredKyc = useMemo(() => {
    return filterAndSortData(kycList, searchTerm, [
      "user._id",
      "fullName",
      "email"
    ]);
  }, [kycList, searchTerm]);

  const TableRowSkeleton = () => (
    <TableRow>
      {Array(7)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
        ))}
    </TableRow>
  );

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, idx) => <TableRowSkeleton key={idx} />)
            : filteredKyc.length > 0
            ? filteredKyc.map((kyc) => {
                const isApproved = kyc.status?.toLowerCase() === "approved";
                const isRejected = kyc.status?.toLowerCase() === "rejected";
                const isActionDisabled = isApproved || isRejected;
                
                return (
                  <TableRow key={kyc._id}>
                    <TableCell className="font-medium truncate max-w-[120px]">
                      {kyc.user?._id || kyc.userId || "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">{kyc.fullName || "N/A"}</TableCell>
                    <TableCell>{kyc.email || "N/A"}</TableCell>
                    <TableCell>{formatDocumentType(kyc.idType)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(kyc.status)}>
                        {kyc.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {kyc._createdAt || kyc.createdAt
                        ? new Date(kyc._createdAt || kyc.createdAt).toLocaleDateString("en-GB")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        open={openMenuId === kyc._id}
                        onOpenChange={(isOpen) =>
                          setOpenMenuId(isOpen ? kyc._id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => router.push(`/admin/user-management/kyc/${kyc._id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={`${isApproved ? "opacity-50 cursor-not-allowed" : "text-green-600 hover:text-green-700"}`}
                            disabled={isApproved || isActionDisabled || updateKycStatus.isLoading || isProcessingId === kyc._id}
                            onClick={() => !isActionDisabled && handleApprove(kyc)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`${isRejected ? "opacity-50 cursor-not-allowed" : "text-yellow-600 hover:text-yellow-700"}`}
                            disabled={isRejected || isActionDisabled || updateKycStatus.isLoading || isProcessingId === kyc._id}
                            onClick={() => !isActionDisabled && handleReject(kyc)}
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(kyc)}
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
            : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-5 text-gray-500">
                    No KYC submissions found
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination meta={meta} onPageChange={setPage} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the KYC submission for{" "}
            <span className="font-semibold">
              {kycToDelete?.fullName || "this user"}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
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