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

// Dummy deposit data
const dummyDeposits = [
  {
    _id: "DEP-001",
    user: {
      _id: "USR-001",
      fullName: "John Doe"
    },
    amount: 5000,
    crypto: "Bitcoin (BTC)",
    currency: "BTC",
    status: "pending",
    fundedAt: "2024-03-15T10:30:00Z",
    createdAt: "2024-03-15T10:30:00Z",
    transactionId: "TX-123456"
  },
  {
    _id: "DEP-002",
    user: {
      _id: "USR-002",
      fullName: "Jane Smith"
    },
    amount: 15000,
    crypto: "Ethereum (ETH)",
    currency: "ETH",
    status: "successful",
    fundedAt: "2024-03-14T14:45:00Z",
    createdAt: "2024-03-14T14:45:00Z",
    transactionId: "TX-123457"
  },
  {
    _id: "DEP-003",
    user: {
      _id: "USR-003",
      fullName: "Robert Johnson"
    },
    amount: 2500,
    crypto: "Bitcoin (BTC)",
    currency: "BTC",
    status: "failed",
    fundedAt: "2024-03-14T09:15:00Z",
    createdAt: "2024-03-14T09:15:00Z",
    transactionId: "TX-123458"
  },
  {
    _id: "DEP-004",
    user: {
      _id: "USR-004",
      fullName: "Emily Brown"
    },
    amount: 7500,
    crypto: "USDT (TRC20)",
    currency: "USDT",
    status: "pending",
    fundedAt: "2024-03-13T16:20:00Z",
    createdAt: "2024-03-13T16:20:00Z",
    transactionId: "TX-123459"
  },
  {
    _id: "DEP-005",
    user: {
      _id: "USR-005",
      fullName: "Michael Wilson"
    },
    amount: 12000,
    crypto: "Ethereum (ETH)",
    currency: "ETH",
    status: "successful",
    fundedAt: "2024-03-13T11:00:00Z",
    createdAt: "2024-03-13T11:00:00Z",
    transactionId: "TX-123460"
  },
  {
    _id: "DEP-006",
    user: {
      _id: "USR-006",
      fullName: "Sarah Davis"
    },
    amount: 3000,
    crypto: "Bitcoin (BTC)",
    currency: "BTC",
    status: "pending",
    fundedAt: "2024-03-12T13:30:00Z",
    createdAt: "2024-03-12T13:30:00Z",
    transactionId: "TX-123461"
  },
  {
    _id: "DEP-007",
    user: {
      _id: "USR-007",
      fullName: "David Martinez"
    },
    amount: 20000,
    crypto: "USDT (ERC20)",
    currency: "USDT",
    status: "failed",
    fundedAt: "2024-03-12T08:45:00Z",
    createdAt: "2024-03-12T08:45:00Z",
    transactionId: "TX-123462"
  },
  {
    _id: "DEP-008",
    user: {
      _id: "USR-008",
      fullName: "Lisa Anderson"
    },
    amount: 4500,
    crypto: "Ethereum (ETH)",
    currency: "ETH",
    status: "successful",
    fundedAt: "2024-03-11T12:10:00Z",
    createdAt: "2024-03-11T12:10:00Z",
    transactionId: "TX-123463"
  },
  {
    _id: "DEP-009",
    user: {
      _id: "USR-009",
      fullName: "James Taylor"
    },
    amount: 8500,
    crypto: "Bitcoin (BTC)",
    currency: "BTC",
    status: "pending",
    fundedAt: "2024-03-11T09:30:00Z",
    createdAt: "2024-03-11T09:30:00Z",
    transactionId: "TX-123464"
  },
  {
    _id: "DEP-010",
    user: {
      _id: "USR-010",
      fullName: "Maria Garcia"
    },
    amount: 3500,
    crypto: "USDT (TRC20)",
    currency: "USDT",
    status: "successful",
    fundedAt: "2024-03-10T14:15:00Z",
    createdAt: "2024-03-10T14:15:00Z",
    transactionId: "TX-123465"
  },
  {
    _id: "DEP-011",
    user: {
      _id: "USR-011",
      fullName: "Thomas Lee"
    },
    amount: 18000,
    crypto: "Ethereum (ETH)",
    currency: "ETH",
    status: "failed",
    fundedAt: "2024-03-10T11:45:00Z",
    createdAt: "2024-03-10T11:45:00Z",
    transactionId: "TX-123466"
  },
  {
    _id: "DEP-012",
    user: {
      _id: "USR-012",
      fullName: "Patricia White"
    },
    amount: 6200,
    crypto: "Bitcoin (BTC)",
    currency: "BTC",
    status: "pending",
    fundedAt: "2024-03-09T10:00:00Z",
    createdAt: "2024-03-09T10:00:00Z",
    transactionId: "TX-123467"
  }
];

export default function DepositTable({ searchTerm = "" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isProcessingId, setIsProcessingId] = useState(null);
  const [deposits, setDeposits] = useState(dummyDeposits);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;
  const isLoading = false;

  // Dummy pagination meta
  const meta = {
    total: deposits.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(deposits.length / limit)
  };

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

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

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
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!depositToDelete?._id) return;
    try {
      setIsDeleting(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove deposit from state
      setDeposits(prev => prev.filter(d => d._id !== depositToDelete._id));
      
      // Adjust page if needed
      const remainingItems = filteredData.length - 1;
      const currentPageItems = (page - 1) * limit;
      if (remainingItems <= currentPageItems && page > 1) {
        setPage(page - 1);
      }
      
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDepositToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting deposit:", error);
    }
  };

  const handleAccept = useCallback(async (deposit) => {
    try {
      setIsProcessingId(deposit._id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update deposit status to successful
      setDeposits(prev => prev.map(d => 
        d._id === deposit._id ? { ...d, status: "successful" } : d
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error approving deposit:", error);
    } finally {
      setIsProcessingId(null);
    }
  }, []);

  const handleDecline = useCallback(async (deposit) => {
    try {
      setIsProcessingId(deposit._id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update deposit status to failed
      setDeposits(prev => prev.map(d => 
        d._id === deposit._id ? { ...d, status: "failed" } : d
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error declining deposit:", error);
    } finally {
      setIsProcessingId(null);
    }
  }, []);

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
          ) : paginatedData.length > 0 ? (
            paginatedData.map((dep) => {
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
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium">No deposits found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search term" : "Check back later for new deposits"}
                  </p>
                </div>
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

// export default function DepositTable({ searchTerm = "" }) {
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//   const [depositToDelete, setDepositToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const [isProcessingId, setIsProcessingId] = useState(null);
//   const router = useRouter();
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const { data, isLoading, refetch, error } = useFetchData(
//     `/api/admin/deposits?page=${page}&limit=${limit}`,
//     ["deposits", page]
//   );

//   if (error)
//     return (
//       <div className="p-6 text-red-500 text-center">
//         Failed to load deposits.
//       </div>
//     );

//   const deleteDeposit = useDelete(
//     (id) => `/api/admin/deposits/${id}`,
//     ["deposits", page],
//     { onSuccess: () => refetch() }
//   );

//   const patchDeposit = usePatch(
//     (id) => `/api/admin/deposits/${id}`,
//     ["deposits", page]
//   );

//   const deposits = Array.isArray(data?.data?.deposits)
//   ? data.data.deposits
//   : [];

//   const meta = data?.meta ?? {};

//   const filteredData = useMemo(() => {
//   const list = !searchTerm.trim()
//     ? deposits
//     : deposits.filter((dep) =>
//         [
//           dep.user?.fullName,
//           dep._id,
//           dep.user?._id,
//           dep.crypto,
//           dep.transactionId,
//         ]
//           .filter(Boolean)
//           .some((val) =>
//             val.toString().toLowerCase().includes(searchTerm.toLowerCase())
//           )
//       );

//   return [...list].sort(
//     (a, b) =>
//       new Date(b.fundedAt || b.createdAt || 0) -
//       new Date(a.fundedAt || a.createdAt || 0)
//   );
// }, [deposits, searchTerm]);


//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "successful":
//       case "approved":
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//       case "processing":
//         return "bg-yellow-100 text-yellow-800";
//       case "failed":
//       case "rejected":
//       case "cancelled":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "₦0";
//     return `₦${amount.toLocaleString()}`;
//   };

//   const handleDeleteClick = (deposit) => {
//     setIsDeleteOpen(true);
//     setDepositToDelete(deposit);
//   };

//   const handleConfirmDelete = async () => {
//     if (!depositToDelete?._id) return;
//     try {
//       setIsDeleting(true);
//       await deleteDeposit.mutateAsync(depositToDelete._id);

//       // Check if we should go back a page after deletion
//       if (deposits.length === 1 && page > 1) {
//         setPage(page - 1); // Go to previous page
//       } else {
//         refetch(); // Refetch current page
//       }

//       setIsDeleting(false);
//       setIsDeleteOpen(false);
//       setDepositToDelete(null);
//     } catch (error) {
//       setIsDeleting(false);
//     }
//   };

//   const handleAccept = useCallback(
//     async (deposit) => {
//       try {
//         setIsProcessingId(deposit._id);
//         await patchDeposit.mutateAsync({
//           id: deposit._id,
//           data: { status: "successful" },
//         });
//         refetch();
//         setOpenMenuId(null);
//       } catch (error) {
//         console.error("Error approving deposit:", error);
//       } finally {
//         setIsProcessingId(null);
//       }
//     },
//     [patchDeposit, refetch]
//   );

//   const handleDecline = useCallback(
//     async (deposit) => {
//       try {
//         setIsProcessingId(deposit._id);
//         await patchDeposit.mutateAsync({
//           id: deposit._id,
//           data: { status: "failed" },
//         });
//         refetch();
//         setOpenMenuId(null);
//       } catch (error) {
//         console.error("Error declining deposit:", error);
//       } finally {
//         setIsProcessingId(null);
//       }
//     },
//     [patchDeposit, refetch]
//   );

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
//             <TableHead>Deposit ID</TableHead>
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
//             Array(6)
//               .fill(0)
//               .map((_, idx) => <TableRowSkeleton key={idx} />)
//           ) : filteredData.length > 0 ? (
//             filteredData.map((dep) => {
//               const isApproved = dep.status?.toLowerCase() === "successful" || dep.status?.toLowerCase() === "approved";
//               const isDeclined = dep.status?.toLowerCase() === "failed" || dep.status?.toLowerCase() === "rejected";
//               const isActionDisabled = isApproved || isDeclined;
              
//               return (
//                 <TableRow key={dep._id}>
//                   <TableCell className="truncate max-w-[160px] font-medium">
//                     {dep._id || "N/A"}
//                   </TableCell>
//                   <TableCell className="truncate max-w-[160px] font-medium">
//                     {dep.user?._id || "N/A"}
//                   </TableCell>
//                   <TableCell>{dep.user?.fullName || "N/A"}</TableCell>
//                   <TableCell>{formatCurrency(dep.amount)}</TableCell>
//                   <TableCell>{dep.crypto || dep.currency || "N/A"}</TableCell>
//                   <TableCell>
//                     <Badge className={getStatusColor(dep.status)}>
//                       {dep.status || "N/A"}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <DropdownMenu
//                       open={openMenuId === dep._id}
//                       onOpenChange={(isOpen) =>
//                         setOpenMenuId(isOpen ? dep._id : null)
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
//                                onClick={() =>
//                             router.push(
//                               `/admin/transactions/deposit/${dep._id}`
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
//                             isApproved ||
//                             isActionDisabled ||
//                             patchDeposit.isLoading ||
//                             isProcessingId === dep._id
//                           }
//                           onClick={() => !isActionDisabled && handleAccept(dep)}
//                         >
//                           <CheckCircle className="w-4 h-4 mr-2" /> Approve
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           className={`${
//                             isDeclined
//                               ? "opacity-50 cursor-not-allowed"
//                               : "text-red-600 hover:text-red-700"
//                           }`}
//                           disabled={
//                             isDeclined ||
//                             isActionDisabled ||
//                             patchDeposit.isLoading ||
//                             isProcessingId === dep._id
//                           }
//                           onClick={() => !isActionDisabled && handleDecline(dep)}
//                         >
//                           <XCircle className="w-4 h-4 mr-2" /> Decline
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem
//                           className="text-destructive"
//                           onClick={() => handleDeleteClick(dep)}
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
//                 No deposits found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//       <Pagination meta={meta} onPageChange={setPage} />

//       {/* Delete Dialog */}
//       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Deletion</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-gray-600">
//             Are you sure you want to delete{" "}
//             <span className="font-semibold">
//               {depositToDelete?.user?.fullName || "this transaction"}
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