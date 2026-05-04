import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

export const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return "$0";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export const getStatusColor = (status) => {
  const normalizedStatus = String(status || "").toLowerCase().trim();
  
  switch (normalizedStatus) {
    case "active":
    case "approved":
    case "verified":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "completed":
    case "successful":
    case "success":
    case "paid":
    case "delivered":
      return "bg-green-100 text-green-800 border border-green-200";
    case "pending":
    case "inactive":
    case "processing":
    case "review":
    case "on-hold":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "failed":
    case "cancelled":
    case "rejected":
    case "suspended":
    case "declined":
    case "expired":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

export const filterAndSortData = (
  data = [],
  searchTerm = "",
  keys = [],
  dateField = "createdAt",
  sortOrder = "desc"
) => {
  if (!Array.isArray(data)) return [];
  if (!data.length) return [];
  
  const term = String(searchTerm || "").trim().toLowerCase();
  
  let filtered = term
    ? data.filter((item) =>
        keys.some((key) => {
          const value = key
            .split(".")
            .reduce((obj, k) => (obj != null ? obj[k] : null), item);
          return value?.toString().toLowerCase().includes(term);
        })
      )
    : [...data];
  
  return filtered.sort((a, b) => {
    const dateA = new Date(a[dateField] || a.createdAt || 0);
    const dateB = new Date(b[dateField] || b.createdAt || 0);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Default to numeric format (1/2/2025) for en-GB locale
    const defaultOptions = {
      day: "numeric",
      month: "numeric", 
      year: "numeric",
      ...options
    };
    
    // Auto-remove time if not specified
    if (!options.hour && !options.minute) {
      delete defaultOptions.hour;
      delete defaultOptions.minute;
    }
    
    return date.toLocaleDateString("en-GB", defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const TableRowSkeleton = ({ 
  columns = 7, 
  maxWidth = "120px",
  className = "",
  showCheckbox = false
}) => {
  const totalColumns = showCheckbox ? columns + 1 : columns;
  
  return (
    <TableRow className={className}>
      {showCheckbox && (
        <TableCell>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto" />
        </TableCell>
      )}
      {Array(columns)
        .fill(0)
        .map((_, i) => (
          <TableCell key={i}>
            <div 
              className="h-4 bg-gray-200 rounded animate-pulse w-full"
              style={{ maxWidth }}
            />
          </TableCell>
        ))}
    </TableRow>
  );
};