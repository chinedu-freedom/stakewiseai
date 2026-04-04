
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
import { MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { 
  getStatusColor, 
  formatCurrency, 
  filterAndSortData, 
  formatDate, 
  TableRowSkeleton 
} from "@/lib/tableHelpers";

// Dummy investment data
const dummyInvestments = [
  {
    _id: "INV-001",
    user: {
      _id: "USR-001",
      username: "John Doe"
    },
    plan: {
      title: "Silver Plan"
    },
    amount: 5000,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    _id: "INV-002",
    user: {
      _id: "USR-002",
      username: "Jane Smith"
    },
    plan: {
      title: "Gold Plan"
    },
    amount: 15000,
    status: "pending",
    createdAt: "2024-01-20T14:45:00Z"
  },
  {
    _id: "INV-003",
    user: {
      _id: "USR-003",
      username: "Robert Johnson"
    },
    plan: {
      title: "Platinum Plan"
    },
    amount: 25000,
    status: "completed",
    createdAt: "2024-01-25T09:15:00Z"
  },
  {
    _id: "INV-004",
    user: {
      _id: "USR-004",
      username: "Emily Brown"
    },
    plan: {
      title: "Silver Plan"
    },
    amount: 7500,
    status: "cancelled",
    createdAt: "2024-02-01T16:20:00Z"
  },
  {
    _id: "INV-005",
    user: {
      _id: "USR-005",
      username: "Michael Wilson"
    },
    plan: {
      title: "Gold Plan"
    },
    amount: 12000,
    status: "active",
    createdAt: "2024-02-05T11:00:00Z"
  },
  {
    _id: "INV-006",
    user: {
      _id: "USR-006",
      username: "Sarah Davis"
    },
    plan: {
      title: "Diamond Plan"
    },
    amount: 50000,
    status: "pending",
    createdAt: "2024-02-10T13:30:00Z"
  },
  {
    _id: "INV-007",
    user: {
      _id: "USR-007",
      username: "David Martinez"
    },
    plan: {
      title: "Platinum Plan"
    },
    amount: 30000,
    status: "active",
    createdAt: "2024-02-15T08:45:00Z"
  },
  {
    _id: "INV-008",
    user: {
      _id: "USR-008",
      username: "Lisa Anderson"
    },
    plan: {
      title: "Silver Plan"
    },
    amount: 4500,
    status: "completed",
    createdAt: "2024-02-20T12:10:00Z"
  }
];

export default function InvestmentTable({ searchTerm = "" }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [investments, setInvestments] = useState(dummyInvestments);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const limit = 10;
  const isLoading = false; // No loading state for dummy data

  // Dummy pagination meta
  const meta = {
    total: investments.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(investments.length / limit)
  };

  const filteredData = useMemo(() => {
    return filterAndSortData(
      investments,
      searchTerm,
      ["_id", "user._id", "user.username", "plan.title"],
      "createdAt",
      "desc"
    );
  }, [investments, searchTerm]);

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  const handleDeleteClick = (investment) => {
    setIsDeleteOpen(true);
    setInvestmentToDelete(investment);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!investmentToDelete?._id) return;
    try {
      setIsDeleting(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove investment from state
      setInvestments(prev => prev.filter(inv => inv._id !== investmentToDelete._id));
      
      // Adjust page if needed
      const remainingItems = filteredData.length - 1;
      const currentPageItems = (page - 1) * limit;
      if (remainingItems <= currentPageItems && page > 1) {
        setPage(page - 1);
      }
      
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setInvestmentToDelete(null);
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting investment:", error);
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Investment ID</TableHead>
            <TableHead className="whitespace-nowrap">User ID</TableHead>
            <TableHead className="whitespace-nowrap">Name</TableHead>
            <TableHead className="whitespace-nowrap">Plan Title</TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap">Created At</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, idx) => (
                <TableRowSkeleton 
                  key={idx} 
                  columns={8} 
                  maxWidth="120px" 
                />
              ))
          ) : paginatedData.length > 0 ? (
            paginatedData.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell className="truncate max-w-[120px] font-mono text-xs">
                  {inv._id || "N/A"}
                </TableCell>
                <TableCell className="truncate max-w-[120px] font-mono text-xs">
                  {inv.user?._id || "N/A"}
                </TableCell>
                <TableCell className="font-medium">
                  {inv.user?.username || "N/A"}
                </TableCell>
                <TableCell>
                  {inv.plan?.title || "N/A"}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(inv.amount)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(inv.status)}>
                    {inv.status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(inv.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu
                    open={openMenuId === inv._id}
                    onOpenChange={(isOpen) =>
                      setOpenMenuId(isOpen ? inv._id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild disabled={isDeleting}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/financial-services/investments/${inv._id}`)
                        }
                        className="cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" /> 
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() => handleDeleteClick(inv)}
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
              <TableCell 
                colSpan={8} 
                className="text-center py-10 text-gray-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium">No investments found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search term" : "Check back later for new investments"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <Pagination meta={meta} onPageChange={setPage} />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {investmentToDelete?.user?.username || "this investment"}
              </span>
              's investment record?
            </p>
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-xs text-red-600">
                ⚠️ This action cannot be undone. All investment data will be permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                disabled={isDeleting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// "use client";

// import { useState, useMemo } from "react";
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
// import { MoreHorizontal, Eye, Trash2, Loader2 } from "lucide-react";
// import { useFetchData, useDelete } from "@/hooks/useApi";
// import { useRouter } from "next/navigation";
// import Pagination from "@/components/Pagination";
// import { 
//   getStatusColor, 
//   formatCurrency, 
//   filterAndSortData, 
//   formatDate, 
//   TableRowSkeleton 
// } from "@/lib/tableHelpers";

// export default function InvestmentTable({ searchTerm = "" }) {
//   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
//   const [investmentToDelete, setInvestmentToDelete] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [openMenuId, setOpenMenuId] = useState(null);
//   const router = useRouter();
//   const [page, setPage] = useState(1);
//   const limit = 10;

//   // Fetch all investments (unified endpoint)
//   const { data, isLoading, refetch, error } = useFetchData(
//     `/api/admin/user-investments?page=${page}&limit=${limit}`,
//     ["user-investments", page]
//   );

//   if (error) {
//     return (
//       <div className="p-6 text-red-500 text-center">
//         Failed to load investments.
//       </div>
//     );
//   }

//   const deleteInvestment = useDelete(
//     (id) => `/api/admin/user-investments/${id}`,
//     ["user-investments", page],
//     { onSuccess: () => refetch() }
//   );

//   const investments = data?.data?.investments || data?.data || [];
//   const meta = data?.meta ?? {};

//   const filteredData = useMemo(() => {
//     return filterAndSortData(
//       investments,
//       searchTerm,
//       ["_id", "user._id", "user.username", "plan.title"],
//       "createdAt",
//       "desc"
//     );
//   }, [investments, searchTerm]);

//   const handleDeleteClick = (investment) => {
//     setIsDeleteOpen(true);
//     setInvestmentToDelete(investment);
//     setOpenMenuId(null);
//   };

//   const handleConfirmDelete = async () => {
//     if (!investmentToDelete?._id) return;
//     try {
//       setIsDeleting(true);
//       await deleteInvestment.mutateAsync(investmentToDelete._id);

//       if (investments.length === 1 && page > 1) {
//         setPage(page - 1);
//       } else {
//         refetch();
//       }

//       setIsDeleting(false);
//       setIsDeleteOpen(false);
//       setInvestmentToDelete(null);
//     } catch (error) {
//       setIsDeleting(false);
//       console.error("Error deleting investment:", error);
//     }
//   };

//   return (
//     <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="whitespace-nowrap">Investment ID</TableHead>
//             <TableHead className="whitespace-nowrap">User ID</TableHead>
//             <TableHead className="whitespace-nowrap">Name</TableHead>
//             <TableHead className="whitespace-nowrap">Plan Title</TableHead>
//             <TableHead className="whitespace-nowrap">Amount</TableHead>
//             <TableHead className="whitespace-nowrap">Status</TableHead>
//             <TableHead className="whitespace-nowrap">Created At</TableHead>
//             <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {isLoading ? (
//             Array(6)
//               .fill(0)
//               .map((_, idx) => (
//                 <TableRowSkeleton 
//                   key={idx} 
//                   columns={8} 
//                   maxWidth="120px" 
//                 />
//               ))
//           ) : filteredData.length > 0 ? (
//             filteredData.map((inv) => (
//               <TableRow key={inv._id}>
//                 <TableCell className="truncate max-w-[120px] font-mono text-xs">
//                   {inv._id || "N/A"}
//                 </TableCell>
//                 <TableCell className="truncate max-w-[120px] font-mono text-xs">
//                   {inv.user?._id || "N/A"}
//                 </TableCell>
//                 <TableCell className="font-medium">
//                   {inv.user?.username || "N/A"}
//                 </TableCell>
//                 <TableCell>
//                   {inv.plan?.title || "N/A"}
//                 </TableCell>
//                 <TableCell className="font-medium">
//                   {formatCurrency(inv.amount)}
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={getStatusColor(inv.status)}>
//                     {inv.status || "N/A"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-sm">
//                   {formatDate(inv.createdAt)}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <DropdownMenu
//                     open={openMenuId === inv._id}
//                     onOpenChange={(isOpen) =>
//                       setOpenMenuId(isOpen ? inv._id : null)
//                     }
//                   >
//                     <DropdownMenuTrigger asChild disabled={isDeleting}>
//                       <Button 
//                         variant="ghost" 
//                         size="icon"
//                         className="h-8 w-8"
//                       >
//                         <MoreHorizontal className="w-4 h-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-48">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuItem
//                         onClick={() =>
//                           router.push(`/admin/financial-services/investments/${inv._id}`)
//                         }
//                         className="cursor-pointer"
//                       >
//                         <Eye className="w-4 h-4 mr-2" /> 
//                         View Details
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem
//                         className="text-destructive cursor-pointer"
//                         onClick={() => handleDeleteClick(inv)}
//                         disabled={isDeleting}
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" /> 
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))
//           ) : (
//             <TableRow>
//               <TableCell 
//                 colSpan={8} 
//                 className="text-center py-10 text-gray-500"
//               >
//                 <div className="flex flex-col items-center gap-2">
//                   <p className="text-lg font-medium">No investments found</p>
//                   <p className="text-sm text-gray-400">
//                     {searchTerm ? "Try adjusting your search term" : "Check back later for new investments"}
//                   </p>
//                 </div>
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
      
//       <Pagination meta={meta} onPageChange={setPage} />

//       <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-lg font-semibold">
//               Confirm Deletion
//             </DialogTitle>
//           </DialogHeader>
//           <div className="py-4">
//             <p className="text-sm text-gray-600">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold">
//                 {investmentToDelete?.user?.username || "this investment"}
//               </span>
//               's investment record?
//             </p>
//             <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
//               <p className="text-xs text-red-600">
//                 ⚠️ This action cannot be undone. All investment data will be permanently deleted.
//               </p>
//             </div>
//           </div>
//           <DialogFooter className="gap-2 sm:gap-0">
//             <DialogClose asChild>
//               <Button 
//                 variant="outline" 
//                 disabled={isDeleting}
//                 className="flex-1 sm:flex-none"
//               >
//                 Cancel
//               </Button>
//             </DialogClose>
//             <Button
//               variant="destructive"
//               disabled={isDeleting}
//               onClick={handleConfirmDelete}
//               className="flex-1 sm:flex-none min-w-[140px]"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Confirm Delete"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }