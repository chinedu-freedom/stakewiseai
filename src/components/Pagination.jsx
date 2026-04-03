"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || Object.keys(meta).length === 0) return null;

  // Extract pagination data
  const currentPage = meta.currentPage || 1;
  const totalPages = meta.totalPages || 1;
  const totalItems = meta.totalItems || 0;
  const pageSize = meta.pageSize || 10;
  const hasNextPage = meta.hasNextPage || false;
  const hasPrevPage = meta.hasPrevPage || false;

  // Calculate the range being shown with ALWAYS 2-digit format
  const calculateRange = () => {
    if (totalItems === 0) return "0 results";
    
    const start = ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    // ALWAYS use 2-digit format (01, 02, 03... 10, 11, 12...)
    const formatNumber = (num) => {
      // For total items less than 10, still show 2-digit for start/end
      // but keep total items as-is
      return num.toString().padStart(2, '0');
    };
    
    return `${formatNumber(start)}-${formatNumber(end)} of ${totalItems}`;
  };

  return (
    <div
      className="flex items-center justify-between text-sm text-gray-700 
                px-4 py-3 bg-white border-t 
                sticky bottom-0 left-0 right-0"
    >
      {/* Results info - shows "01-10 of 78" */}
      <div>
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{calculateRange()}</span>
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="p-2 border rounded-md hover:bg-gray-50 
                     disabled:opacity-40 disabled:cursor-not-allowed 
                     cursor-pointer transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="p-2 border rounded-md hover:bg-gray-50 
                     disabled:opacity-40 disabled:cursor-not-allowed 
                     cursor-pointer transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}