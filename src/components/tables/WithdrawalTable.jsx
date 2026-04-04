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
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

// Dummy withdrawal data
const dummyWithdrawals = [
  {
    _id: "WTD-001",
    user: {
      _id: "USR-001",
      username: "John Doe"
    },
    amount: 2500,
    crypto: "Bitcoin (BTC)",
    status: "pending",
    requestedAt: "2024-03-15T10:30:00Z",
    createdAt: "2024-03-15T10:30:00Z"
  },
  {
    _id: "WTD-002",
    user: {
      _id: "USR-002",
      username: "Jane Smith"
    },
    amount: 5000,
    crypto: "Ethereum (ETH)",
    status: "successful",
    requestedAt: "2024-03-14T14:45:00Z",
    createdAt: "2024-03-14T14:45:00Z"
  },
  {
    _id: "WTD-003",
    user: {
      _id: "USR-003",
      username: "Robert Johnson"
    },
    amount: 1200,
    crypto: "USDT (TRC20)",
    status: "failed",
    requestedAt: "2024-03-14T09:15:00Z",
    createdAt: "2024-03-14T09:15:00Z"
  },
  {
    _id: "WTD-004",
    user: {
      _id: "USR-004",
      username: "Emily Brown"
    },
    amount: 3500,
    crypto: "Bitcoin (BTC)",
    status: "pending",
    requestedAt: "2024-03-13T16:20:00Z",
    createdAt: "2024-03-13T16:20:00Z"
  },
  {
    _id: "WTD-005",
    user: {
      _id: "USR-005",
      username: "Michael Wilson"
    },
    amount: 8000,
    crypto: "Ethereum (ETH)",
    status: "successful",
    requestedAt: "2024-03-13T11:00:00Z",
    createdAt: "2024-03-13T11:00:00Z"
  },
  {
    _id: "WTD-006",
    user: {
      _id: "USR-006",
      username: "Sarah Davis"
    },
    amount: 1500,
    crypto: "USDT (ERC20)",
    status: "pending",
    requestedAt: "2024-03-12T13:30:00Z",
    createdAt: "2024-03-12T13:30:00Z"
  },
  {
    _id: "WTD-007",
    user: {
      _id: "USR-007",
      username: "David Martinez"
    },
    amount: 10000,
    crypto: "Bitcoin (BTC)",
    status: "failed",
    requestedAt: "2024-03-12T08:45:00Z",
    createdAt: "2024-03-12T08:45:00Z"
  },
  {
    _id: "WTD-008",
    user: {
      _id: "USR-008",
      username: "Lisa Anderson"
    },
    amount: 2200,
    crypto: "Ethereum (ETH)",
    status: "successful",
    requestedAt: "2024-03-11T12:10:00Z",
    createdAt: "2024-03-11T12:10:00Z"
  },
  {
    _id: "WTD-009",
    user: {
      _id: "USR-009",
      username: "James Taylor"
    },
    amount: 4200,
    crypto: "USDT (TRC20)",
    status: "pending",
    requestedAt: "2024-03-11T09:30:00Z",
    createdAt: "2024-03-11T09:30:00Z"
  },
  {
    _id: "WTD-010",
    user: {
      _id: "USR-010",
      username: "Maria Garcia"
    },
    amount: 1750,
    crypto: "Bitcoin (BTC)",
    status: "successful",
    requestedAt: "2024-03-10T14:15:00Z",
    createdAt: "2024-03-10T14:15:00Z"
  },
  {
    _id: "WTD-011",
    user: {
      _id: "USR-011",
      username: "Thomas Lee"
    },
    amount: 6200,
    crypto: "Ethereum (ETH)",
    status: "failed",
    requestedAt: "2024-03-10T11:45:00Z",
    createdAt: "2024-03-10T11:45:00Z"
  },
  {
    _id: "WTD-012",
    user: {
      _id: "USR-012",
      username: "Patricia White"
    },
    amount: 3100,
    crypto: "USDT (ERC20)",
    status: "pending",
    requestedAt: "2024-03-09T10:00:00Z",
    createdAt: "2024-03-09T10:00:00Z"
  }
];

export default function WithdrawalTable({ searchTerm = "" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [withdrawals, setWithdrawals] = useState(dummyWithdrawals);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const isLoading = false;

  // Dummy pagination meta
  const meta = {
    total: withdrawals.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(withdrawals.length / limit)
  };

  const filteredData = useMemo(() => {
    const list = !searchTerm.trim()
      ? withdrawals
      : withdrawals.filter((txn) =>
          [txn.user?.username, txn._id, txn.user?._id]
            .filter(Boolean)
            .some((val) => val.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return list.sort(
      (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
    );
  }, [withdrawals, searchTerm]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

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
    setOpenMenuId(null);
  };

  const handleAccept = useCallback(async (transaction) => {
    try {
      setIsProcessingId(transaction._id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update withdrawal status to successful
      setWithdrawals(prev => prev.map(w => 
        w._id === transaction._id ? { ...w, status: "successful" } : w
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error approving withdrawal:", error);
    } finally {
      setIsProcessingId(null);
    }
  }, []);

  const handleDecline = useCallback(async (transaction) => {
    try {
      setIsProcessingId(transaction._id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update withdrawal status to failed
      setWithdrawals(prev => prev.map(w => 
        w._id === transaction._id ? { ...w, status: "failed" } : w
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error declining withdrawal:", error);
    } finally {
      setIsProcessingId(null);
    }
  }, []);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete?._id) return;

    try {
      setIsDeleting(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove withdrawal from state
      setWithdrawals(prev => prev.filter(w => w._id !== transactionToDelete._id));
      
      // Adjust page if needed
      const remainingItems = filteredData.length - 1;
      const currentPageItems = (page - 1) * limit;
      if (remainingItems <= currentPageItems && page > 1) {
        setPage(page - 1);
      }
      
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting withdrawal:", error);
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
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Withdrawal ID</TableHead>
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
            Array(8)
              .fill(0)
              .map((_, idx) => <TableRowSkeleton key={idx} />)
          ) : paginatedData.length > 0 ? (
            paginatedData.map((txn) => {
              const isApproved = txn.status?.toLowerCase() === "successful";
              const isDeclined = txn.status?.toLowerCase() === "failed";
              const isActionDisabled = isApproved || isDeclined;

              return (
                <TableRow key={txn._id}>
                  <TableCell className="truncate max-w-[160px] font-medium">
                    {txn._id || "N/A"}
                  </TableCell>
                  <TableCell className="truncate max-w-[160px] font-medium">
                    {txn.user?._id || "N/A"}
                  </TableCell>
                  <TableCell>{txn.user?.username || "N/A"}</TableCell>
                  <TableCell>₦{txn.amount?.toLocaleString()}</TableCell>
                  <TableCell>{txn.crypto || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(txn.status)}>
                      {txn.status || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuId === txn._id}
                      onOpenChange={(isOpen) =>
                        setOpenMenuId(isOpen ? txn._id : null)
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
                              `/admin/transactions/withdrawal/${txn._id}`
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
                            isActionDisabled ||
                            isProcessingId === txn._id
                          }
                          onClick={() => !isActionDisabled && handleAccept(txn)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className={`${
                            isDeclined
                              ? "opacity-50 cursor-not-allowed"
                              : "text-yellow-600 hover:text-yellow-700"
                          }`}
                          disabled={
                            isActionDisabled ||
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
                          className="text-destructive"
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
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium">No withdrawals found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search term" : "Check back later for new withdrawals"}
                  </p>
                </div>
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
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {transactionToDelete?.user?.username || "this transaction"}
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


// "use client";

// import { useState, useMemo, useCallback } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Dialog,
//   DialogContent,
//   DialogClose,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import {
//   MoreHorizontal,
//   Eye,
//   Trash2,
//   CheckCircle,
//   XCircle,
//   Loader2,
// } from "lucide-react";
// import { useFetchData, useDelete, usePatch } from "@/hooks/useApi";
// import { useRouter } from "next/navigation";
// import Pagination from "@/components/Pagination";

// export default function WithdrawalTable({ searchTerm = "" }) {
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//   const [transactionToDelete, setTransactionToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [isProcessingId, setIsProcessingId] = useState(null);
//   const router = useRouter();
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const { data, isLoading, refetch, error } = useFetchData(
//     `/api/admin/withdrawals?page=${page}&limit=${limit}`,
//     ["withdrawals", page]
//   );

//   const deleteWithdrawal = useDelete(
//     (id) => `/api/admin/withdrawals/${id}`,
//     ["withdrawals", page],
//     {
//       onSuccess: () => {
//         // Check if we should go back a page after deletion
//         if (transactions.length === 1 && page > 1) {
//           setPage(page - 1); // Go to previous page
//         } else {
//           refetch(); // Refetch current page
//         }
//       },
//     }
//   );
  
//   const patchWithdrawal = usePatch(
//     (id) => `/api/admin/withdrawals/${id}`,
//     ["withdrawals", page]
//   );

//   if (error)
//     return (
//       <div className="p-6 text-red-500 text-center">
//         Failed to load withdrawals.
//       </div>
//     );

//   const transactions = data?.data?.withdrawals || data?.data || [];
//   const meta = data?.meta || {};

//   const filteredData = useMemo(() => {
//     const list = !searchTerm.trim()
//       ? transactions
//       : transactions.filter((txn) =>
//           [txn.user?.username, txn._id, txn.user?._id]
//             .filter(Boolean)
//             .some((val) => val.toLowerCase().includes(searchTerm.toLowerCase()))
//         );

//     return list.sort(
//       (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
//     );
//   }, [transactions, searchTerm]);

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "successful":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const handleDeleteClick = (transaction) => {
//     setTransactionToDelete(transaction);
//     setIsDeleteOpen(true);
//   };

//   const handleAccept = useCallback(
//     async (transaction) => {
//       try {
//         setIsProcessingId(transaction._id);

//         await patchWithdrawal.mutateAsync({
//           id: transaction._id,
//           data: { status: "successful" },
//         });
//         refetch();
//         setOpenMenuId(null);
//       } catch (error) {
//         console.error("Error approving transaction:", error);
//       } finally {
//         setIsProcessingId(null);
//       }
//     },
//     [patchWithdrawal, refetch]
//   );

//   const handleDecline = useCallback(
//     async (transaction) => {
//       try {
//         setIsProcessingId(transaction._id);
//         await patchWithdrawal.mutateAsync({
//           id: transaction._id,
//           data: { status: "failed" },
//         });
//         refetch();
//         setOpenMenuId(null);
//       } catch (error) {
//         console.error("Error declining transaction:", error);
//       } finally {
//         setIsProcessingId(null);
//       }
//     },
//     [patchWithdrawal, refetch]
//   );

//   const handleConfirmDelete = async () => {
//     if (!transactionToDelete?._id) return;

//     try {
//       setIsDeleting(true);
//       await deleteWithdrawal.mutateAsync(transactionToDelete._id);
//       setIsDeleting(false);
//       setIsDeleteOpen(false);
//       setTransactionToDelete(null);
//     } catch (error) {
//       setIsDeleting(false);
//     }
//   };

//   const TableRowSkeleton = () => (
//     <TableRow>
//       {Array(7)
//         .fill(0)
//         .map((_, i) => (
//           <TableCell key={i}>
//             <div className="h-4 w-full max-w-[120px] bg-gray-200 rounded animate-pulse"></div>
//           </TableCell>
//         ))}
//     </TableRow>
//   );

//   return (
//     <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Withdrawal ID</TableHead>
//             <TableHead>User ID</TableHead>
//             <TableHead>Name</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Crypto</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {isLoading ? (
//             Array(8)
//               .fill(0)
//               .map((_, idx) => <TableRowSkeleton key={idx} />)
//           ) : filteredData.length > 0 ? (
//             filteredData.map((txn) => {
//               const isApproved = txn.status?.toLowerCase() === "successful";
//               const isDeclined = txn.status?.toLowerCase() === "failed";
//               const isActionDisabled = isApproved || isDeclined;

//               return (
//                 <TableRow key={txn._id}>
//                   <TableCell className="truncate max-w-[160px] font-medium">
//                     {txn._id || "N/A"}
//                   </TableCell>
//                   <TableCell className="truncate max-w-[160px] font-medium">
//                     {txn.user?._id || "N/A"}
//                   </TableCell>
//                   <TableCell>{txn.user?.username || "N/A"}</TableCell>
//                   <TableCell>₦{txn.amount?.toLocaleString()}</TableCell>
//                   <TableCell>{txn.crypto || "N/A"}</TableCell>
//                   <TableCell>
//                     <Badge className={getStatusColor(txn.status)}>
//                       {txn.status || "N/A"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <DropdownMenu
//                       open={openMenuId === txn._id}
//                       onOpenChange={(isOpen) =>
//                         setOpenMenuId(isOpen ? txn._id : null)
//                       }
//                     >
//                       <DropdownMenuTrigger asChild disabled={isDeleting}>
//                         <Button variant="ghost" size="icon">
//                           <MoreHorizontal className="w-4 h-4" />
//                         </Button>
//                       </DropdownMenuTrigger>

//                       <DropdownMenuContent align="end">
//                         <DropdownMenuLabel>Actions</DropdownMenuLabel>

//                         <DropdownMenuItem
//                           onClick={() =>
//                             router.push(
//                               `/admin/transactions/withdrawal/${txn._id}`
//                             )
//                           }
//                         >
//                           <Eye className="w-4 h-4 mr-2" /> View Details
//                         </DropdownMenuItem>

//                         <DropdownMenuSeparator />

//                         <DropdownMenuItem
//                           className={`${
//                             isApproved
//                               ? "opacity-50 cursor-not-allowed"
//                               : "text-green-600 hover:text-green-700"
//                           }`}
//                           disabled={
//                             isActionDisabled ||
//                             patchWithdrawal.isLoading ||
//                             isProcessingId === txn._id
//                           }
//                           onClick={() => !isActionDisabled && handleAccept(txn)}
//                         >
//                           <CheckCircle className="w-4 h-4 mr-2" /> Approve
//                         </DropdownMenuItem>

//                         <DropdownMenuItem
//                           className={`${
//                             isDeclined
//                               ? "opacity-50 cursor-not-allowed"
//                               : "text-yellow-600 hover:text-yellow-700"
//                           }`}
//                           disabled={
//                             isActionDisabled ||
//                             patchWithdrawal.isLoading ||
//                             isProcessingId === txn._id
//                           }
//                           onClick={() =>
//                             !isActionDisabled && handleDecline(txn)
//                           }
//                         >
//                           <XCircle className="w-4 h-4 mr-2" /> Decline
//                         </DropdownMenuItem>

//                         <DropdownMenuSeparator />

//                         <DropdownMenuItem
//                           className="text-destructive"
//                           onClick={() => handleDeleteClick(txn)}
//                         >
//                           <Trash2 className="w-4 h-4 mr-2" /> Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               );
//             })
//           ) : (
//             <TableRow>
//               <TableCell colSpan={8} className="text-center py-6 text-gray-500">
//                 No withdrawals found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       {/* Pagination */}
//       <Pagination meta={meta} onPageChange={setPage} />

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Deletion</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-gray-600">
//             Are you sure you want to delete{" "}
//             <span className="font-semibold">
//               {transactionToDelete?.user?.username || "this transaction"}
//             </span>
//             's transaction record? This action cannot be undone.
//           </p>
//           <DialogFooter className="mt-4">
//             <DialogClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DialogClose>
//             <Button
//               variant="destructive"
//               disabled={isDeleting}
//               onClick={handleConfirmDelete}
//               className="min-w-[140px] flex items-center justify-center gap-2"
//             >
//               {isDeleting ? "Deleting" : "Confirm Delete"}
//               {isDeleting && (
//                 <Loader2 className="w-5 h-5 animate-spin text-white" />
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }