"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { postData, patchData } from "@/config/apiHelpers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MoreHorizontal, Trash2, Loader2, Eye, KeyRound, Mail } from "lucide-react";
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

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [isEditEmailOpen, setIsEditEmailOpen] = useState(false);
  const [userToEditEmail, setUserToEditEmail] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const limit = 10;

  const { data, isLoading, refetch, error } = useFetchData(
    `/api/users?page=${page}&limit=${limit}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`,
    ["users", page, searchTerm]
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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

  // Use the data directly since the backend now handles the filtering and sorting
  const filteredData = users;

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

  const handleResetClick = (user) => {
    setUserToReset(user);
    setNewPassword("");
    setIsResetOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmReset = async () => {
    if (!userToReset?._id) return;
    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    try {
      setIsResetting(true);
      const res = await postData(`/api/users/${userToReset._id}/reset-password`, { newPassword });
      if (res?.success) {
        toast.success(res.message || "Password reset successfully");
      } else {
        toast.error(res?.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
      setIsResetOpen(false);
      setUserToReset(null);
    }
  };

  const handleEditEmailClick = (user) => {
    setUserToEditEmail(user);
    setNewEmail(user.email || "");
    setIsEditEmailOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmEditEmail = async () => {
    if (!userToEditEmail?._id) return;
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsEditingEmail(true);
      const res = await patchData(`/api/users/${userToEditEmail._id}`, { email: newEmail.trim() });
      if (res?.success) {
        toast.success(res.message || "Email updated successfully");
        refetch();
      } else {
        toast.error(res?.message || "Failed to update email");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update email");
    } finally {
      setIsEditingEmail(false);
      setIsEditEmailOpen(false);
      setUserToEditEmail(null);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="whitespace-nowrap">User ID</TableHead>
              <TableHead className="whitespace-nowrap">Username</TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Phone Number</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created At</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
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
                  <TableCell className="font-medium truncate max-w-[120px] whitespace-nowrap">
                    {user._id}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">{user.username}</TableCell>

                  <TableCell className="whitespace-nowrap">{user.email}</TableCell>

                  <TableCell className="whitespace-nowrap">{user.phoneNumber || "—"}</TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(user.accountStatus)}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
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

                        {/* EDIT EMAIL */}
                        <DropdownMenuItem
                          onClick={() => handleEditEmailClick(user)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Edit Email
                        </DropdownMenuItem>

                        {/* RESET PASSWORD */}
                        <DropdownMenuItem
                          onClick={() => handleResetClick(user)}
                        >
                          <KeyRound className="w-4 h-4 mr-2" />
                          Reset Password
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
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {/* DELETE MODAL */}
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

      {/* RESET PASSWORD MODAL */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            You are about to reset the password for{" "}
            <span className="font-semibold">
              {userToReset?.username || "this user"}
            </span>.
            Please enter the new password below. It will be emailed to them automatically.
          </p>

          <div className="grid gap-2 py-4">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              placeholder="Enter new password (e.g. User@123)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isResetting}>
                Cancel
              </Button>
            </DialogClose>

            <Button
              disabled={isResetting}
              onClick={handleConfirmReset}
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT EMAIL MODAL */}
      <Dialog open={isEditEmailOpen} onOpenChange={setIsEditEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Email</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            You are about to edit the email for{" "}
            <span className="font-semibold">
              {userToEditEmail?.username || "this user"}
            </span>.
          </p>

          <div className="grid gap-2 py-4">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="Enter new email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isEditingEmail}>
                Cancel
              </Button>
            </DialogClose>

            <Button
              disabled={isEditingEmail}
              onClick={handleConfirmEditEmail}
            >
              {isEditingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}