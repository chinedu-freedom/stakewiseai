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
import { MoreHorizontal, Trash2, Loader2, Eye } from "lucide-react";
import { useFetchData, useDelete } from "@/hooks/useApi";
import Pagination from "@/components/Pagination";
import {
  getStatusColor,
  filterAndSortData,
  TableRowSkeleton,
} from "@/lib/tableHelpers";
import { useRouter } from "next/navigation";

export default function UsersTable({ searchTerm = "" }) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const limit = 10;

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/users?page=${page}&limit=${limit}`,
    ["users", page]
  );

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load users.
      </div>
    );
  }

  const deleteUser = useDelete(
    (id) => `/api/users/${id}`,
    ["users", page],
    { onSuccess: () => refetch() }
  );

  const users = data?.data?.records || [];
  const meta = data?.data?.pagination ?? {};

  const filteredData = useMemo(() => {
    return filterAndSortData(users, searchTerm, [
      "_id",
      "username",
      "email",
      "phoneNumber",
    ]);
  }, [users, searchTerm]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?._id) return;

    try {
      setIsDeleting(true);

      await deleteUser.mutateAsync(userToDelete._id);

      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }

      setIsDeleting(false);
      setIsDeleteOpen(false);
      setUserToDelete(null);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => <TableRowSkeleton key={i} columns={7} />)
          ) : filteredData.length ? (
            filteredData.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium truncate max-w-[120px]">
                  {user._id}
                </TableCell>

                <TableCell>{user.username}</TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>{user.phoneNumber || "—"}</TableCell>

                <TableCell>
                  <Badge className={getStatusColor(user.accountStatus)}>
                    {user.accountStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB")
                    : "—"}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu
                    open={openMenuId === user._id}
                    onOpenChange={(open) =>
                      setOpenMenuId(open ? user._id : null)
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

                      {/* VIEW */}
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/user-management/${user._id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>

                      {/* DELETE */}
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteClick(user)}
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
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* DELETE MODAL (same as PlansTable) */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {userToDelete?.username || "this user"}
            </span>
            ? This action cannot be undone.
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