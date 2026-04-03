"use client";

import React, { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Pencil, Slash, Trash2 } from "lucide-react";

const plans = [
  { id: 1, name: "Crypto Growth Plan", type: "Crypto", roi: "12%", duration: "6 months", status: "Active", createdAt: "2025-09-20" },
  { id: 2, name: "Real Estate Flex", type: "Real Estate", roi: "9%", duration: "1 year", status: "Inactive", createdAt: "2025-08-14" },
  { id: 3, name: "Stock Booster", type: "Stocks & Bonds", roi: "10%", duration: "8 months", status: "Active", createdAt: "2025-07-02" },
  { id: 4, name: "Loan Max Plan", type: "Loans", roi: "6%", duration: "4 months", status: "Active", createdAt: "2025-10-01" },
];

export default function PlansTable({ searchTerm = "", filterType = "" }) {
  const [isDeletePlanOpen, setIsDeletePlanOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  const filteredPlans = useMemo(() => {
    let result = plans;

    if (filterType) {
      result = result.filter((p) => p.type.toLowerCase() === filterType.toLowerCase());
    }

    if (searchTerm.trim()) {
      result = result.filter((p) =>
        [p.name, p.type].some((val) =>
          val.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return result;
  }, [filterType, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeletePlanOpen(true);
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>ROI</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredPlans.length ? (
            filteredPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.type}</TableCell>
                <TableCell>{plan.roi}</TableCell>
                <TableCell>{plan.duration}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell>{plan.createdAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4}>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                      <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Slash className="w-4 h-4 mr-2" /> Deactivate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(plan)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-5 text-gray-500">
                No plans found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDeletePlanOpen} onOpenChange={setIsDeletePlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">“{planToDelete?.name}”</span>?
            This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
