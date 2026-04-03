"use client";

import React, { useMemo, useState, useCallback } from "react";
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
import { MoreHorizontal, Eye, Ban, Loader2, Trash2 } from "lucide-react";
import { useFetchData, usePatch, useDelete } from "@/hooks/useApi";
import { getStatusColor, filterAndSortData } from "@/lib/tableHelpers";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

export default function UsersTable({ searchTerm = "" }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useFetchData(
    `/api/admin/users?page=${page}&limit=${limit}`,
    ["users", page]
  );
  const usersList = data?.data ?? [];
  const meta = data?.meta ?? {};

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);

  // Suspend user mutation - fix query key to match fetch
  const suspendUser = usePatch(
    (id) => `/api/admin/users/${id}`,
    ["users", page]
  );

  const handleSuspend = useCallback(
    async (user) => {
      try {
        setIsProcessingId(user._id);

        await suspendUser.mutateAsync({ 
          id: user._id,
          data: { accountStatus: "suspended" },
        });

        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error suspending user:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [suspendUser, refetch]
  );

  // Activate user (undo suspend)
  const handleActivate = useCallback(
    async (user) => {
      try {
        setIsProcessingId(user._id);

        await suspendUser.mutateAsync({
          id: user._id,
          data: { accountStatus: "active" },
        });

        refetch();
        setOpenMenuId(null);
      } catch (error) {
        console.error("Error activating user:", error);
      } finally {
        setIsProcessingId(null);
      }
    },
    [suspendUser, refetch]
  );

  // Delete user mutation
  const deleteUser = useDelete(
    (id) => `/api/admin/users/${id}`,
    ["users", page],
    { onSuccess: () => refetch() }
  );

  const handleDeleteClick = (user) => {
    setIsDeleteOpen(true);
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?._id) return;
    try {
      setIsDeleting(true);
      await deleteUser.mutateAsync(userToDelete._id);

      // Check if we should go back a page after deletion
      if (usersList.length === 1 && page > 1) {
        setPage(page - 1); // Go to previous page
      } else {
        refetch(); // Refetch current page
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  // Skeleton loader
  const TableRowSkeleton = () => (
    <TableRow>
      {Array(7)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          </TableCell>
        ))}
    </TableRow>
  );

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return filterAndSortData(usersList, searchTerm, [
      "_id",
      "fullName",
      "email",
    ]);
  }, [usersList, searchTerm]);

  // KYC status color
  const getKycStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-800";
      case "pending":
        return "text-yellow-800";
      case "rejected":
        return "text-orange-800";
      case "not submitted":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead>Account Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : filteredUsers.length ? (
            filteredUsers.map((user) => {
              const isSuspended = user.accountStatus === "suspended";
              const isActive = user.accountStatus === "active";
              
              return (
                <TableRow key={user._id}>
                  <TableCell className="font-medium truncate max-w-[120px]">
                    {user._id}
                  </TableCell>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className={getKycStatusColor(user.status)}>
                    {user.status}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.accountStatus)}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user._createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuId === user._id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? user._id : null)
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
                            router.push(`/admin/user-management/${user._id}`)
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Suspend/Activate Button */}
                        {isActive ? (
                          <DropdownMenuItem
                            className="text-yellow-600 hover:text-yellow-700"
                            // disabled={
                            //   suspendUser.isLoading ||
                            //   isProcessingId === user._id
                            // }
                            disabled={suspendUser.isPending || isProcessingId === user._id}

                            onClick={() => handleSuspend(user)}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            {/* {suspendUser.isLoading && isProcessingId === user._id
                              ? "Suspending..."
                              : "Suspend"} */}
                              {suspendUser.isPending && isProcessingId === user._id ? "Suspending..." : "Suspend"}

                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600 hover:text-green-700"
                            // disabled={
                            //   suspendUser.isLoading ||
                            //   isProcessingId === user._id
                            // }
                            disabled={suspendUser.isPending || isProcessingId === user._id}

                            onClick={() => handleActivate(user)}
                          >
                            <Ban className="w-4 h-4 mr-2 rotate-180" />
                            {suspendUser.isLoading && isProcessingId === user._id
                              ? "Activating..."
                              : "Activate"}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* Delete Button */}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(user)}
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
              <TableCell colSpan={7} className="text-center py-5 text-gray-500">
                No users found.
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
              {userToDelete?.fullName || "this user"}
            </span>
            's account record? This action cannot be undone.
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