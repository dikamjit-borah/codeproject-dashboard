import { useEffect, useState, useMemo, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type ColumnResizeMode,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import codeprojektBackend from "../../api/adapters/codeprojektDashboardBackend";
import type { Transaction } from "../../api/adapters/codeprojektDashboardBackend";

// Transaction row shape
type TransactionRow = {
  id: string;
  transactionId: string;
  spuId: string;
  spu: string;
  username: string;
  status: string;
  subStatus: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

const staticRows: TransactionRow[] = [];

// Helper function to get badge color based on status
const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "dark" => {
  const normalizedStatus = status?.toLowerCase();
  
  switch (normalizedStatus) {
    case "success":
      return "success";
    case "pending":
      return "warning";
    case "payment_completed":
      return "info";
    case "failed":
      return "error";
    case "cancelled":
      return "error";
    default:
      return "dark";
  }
};

// Helper function to format date in IST (Indian Standard Time)
const formatDateIST = (dateString: string | undefined): string => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    
    // Format as: DD MMM YYYY, HH:MM:SS AM/PM IST
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };
    
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  } catch {
    return "—";
  }
};

const columnHelper = createColumnHelper<TransactionRow>();

// Status options
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "payment_completed", label: "Payment Completed" },
  { value: "failed", label: "Failed" },
  { value: "success", label: "Success" },
  { value: "cancelled", label: "Cancelled" },
];

// subStatus options
const subStatus_OPTIONS = [
  { value: "", label: "All Sub Statuses" },
  { value: "order_initiated", label: "Order Initiated" },
  { value: "order_placed", label: "Order Placed" },
  { value: "order_pending", label: "Order Pending" },
  { value: "gateway_initiated", label: "Gateway Initiated" },
  { value: "gateway_failed", label: "Gateway Failed" },
  { value: "payment_initiated", label: "Payment Initiated" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "payment_success", label: "Payment Success" },
  { value: "vendor_queued", label: "Vendor Queued" },
  { value: "vendor_failed", label: "Vendor Failed" },
  { value: "user_cancelled", label: "User Cancelled" },
];

export default function RecentOrders() {
  const [rows, setRows] = useState<TransactionRow[]>(staticRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  // Temporary filter states (user input)
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Applied filter states (used for API calls)
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("");
  const [appliedSubStatusFilter, setAppliedSubStatusFilter] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<string>("");
  const [appliedEndDate, setAppliedEndDate] = useState<string>("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startDatePickerRef = useRef<flatpickr.Instance | null>(null);
  const endDatePickerRef = useRef<flatpickr.Instance | null>(null);

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionId", {
        header: "Transaction ID",
        size: 200,
        minSize: 100,
        maxSize: 500,
        cell: (info) => (
          <span className="font-mono text-xs text-center">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("spuId", {
        header: "SPU ID",
        size: 100,
        minSize: 80,
        maxSize: 200,
      }),
      columnHelper.accessor("spu", {
        header: "SPU",
        size: 200,
        minSize: 100,
        maxSize: 400,
        cell: (info) => (
          <div className="truncate text-center" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("username", {
        header: "Username",
        size: 150,
        minSize: 100,
        maxSize: 300,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 120,
        minSize: 100,
        maxSize: 200,
        cell: (info) => (
          <div className="flex justify-center">
            <Badge size="sm" color={getStatusColor(info.getValue())}>
              {info.getValue()}
            </Badge>
          </div>
        ),
      }),
      columnHelper.accessor("subStatus", {
        header: "Sub Status",
        size: 120,
        minSize: 100,
        maxSize: 200,
      }),
      columnHelper.accessor("remarks", {
        header: "Remarks",
        size: 250,
        minSize: 150,
        maxSize: 500,
        cell: (info) => (
          <div className="truncate text-center" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        size: 180,
        minSize: 150,
        maxSize: 300,
        cell: (info) => (
          <div className="truncate text-center" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("updatedAt", {
        header: "Updated At",
        size: 180,
        minSize: 150,
        maxSize: 300,
        cell: (info) => (
          <div className="truncate text-center" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: { 
          page: number; 
          limit: number; 
          status?: string; 
          subStatus?: string;
          startDate?: string;
          endDate?: string;
          search?: string;
        } = {
          page: currentPage,
          limit,
        };
        
        if (appliedStatusFilter) {
          params.status = appliedStatusFilter;
        }
        
        if (appliedSubStatusFilter) {
          params.subStatus = appliedSubStatusFilter;
        }
        
        if (appliedStartDate) {
          params.startDate = appliedStartDate;
        }
        
        if (appliedEndDate) {
          params.endDate = appliedEndDate;
        }
        
        if (appliedSearchTerm) {
          params.search = appliedSearchTerm;
        }
        
        const res = await codeprojektBackend.getTransactions(params);
        if (!mounted) return;
        
        // Calculate total pages
        const calculatedTotalPages = Math.ceil(res.total / limit);
        setTotalPages(calculatedTotalPages);
        setTotal(res.total);
        const mapped: TransactionRow[] = res.items.map((t: Transaction) => {
          // Map Transaction -> TransactionRow
          // The raw transaction data is stored in metadata.raw
          const md = t.metadata as Record<string, unknown> | undefined;
          const raw = md?.raw as Record<string, unknown> | undefined;
          
          // Extract transactionId (from raw transaction, fallback to metadata)
          const transactionId = 
            typeof raw?.transactionId === "string"
              ? raw.transactionId
              : typeof md?.transactionId === "string" 
              ? md.transactionId 
              : "—";

          // Extract spuDetails and spuId
          // Note: spuId is at root level in the API response, spuDetails.spu contains the SPU name
          const spuDetails = (raw?.spuDetails || md?.spuDetails) as Record<string, unknown> | undefined;
          const spuId = 
            typeof raw?.spuId === "string" 
              ? raw.spuId 
              : typeof spuDetails?.spuId === "string"
              ? spuDetails.spuId
              : "—";
          const spu = 
            typeof spuDetails?.spu === "string" 
              ? spuDetails.spu 
              : "—";

          // Extract userDetails
          const userDetails = (raw?.userDetails || md?.userDetails) as Record<string, unknown> | undefined;
          const username = 
            typeof userDetails?.username === "string" 
              ? userDetails.username 
              : "—";

          // Extract status and subStatus (note: API uses subStatus with capital S)
          const status = 
            typeof raw?.status === "string" 
              ? raw.status 
              : typeof t.status === "string"
              ? t.status
              : "—";
          const subStatus = 
            typeof raw?.subStatus === "string" 
              ? raw.subStatus 
              : typeof raw?.subStatus === "string"
              ? raw.subStatus
              : typeof t.subStatus === "string"
              ? t.subStatus
              : "—";

          // Extract vendorResponse for remarks (combine order_id and message)
          const vendorResponse = (raw?.vendorResponse || md?.vendorResponse) as Record<string, unknown> | undefined;
          const orderId = typeof vendorResponse?.order_id === "string" ? vendorResponse.order_id : "";
          const message = typeof vendorResponse?.message === "string" ? vendorResponse.message : "";
          const remarks = [orderId, message].filter(Boolean).join(" - ") || "—";

          // Extract createdAt and updatedAt
          const createdAt = 
            typeof raw?.createdAt === "string"
              ? raw.createdAt
              : typeof t.createdAt === "string"
              ? t.createdAt
              : undefined;
          const updatedAt = 
            typeof raw?.updatedAt === "string"
              ? raw.updatedAt
              : undefined;

          return {
            id: t.id,
            transactionId,
            spuId,
            spu,
            username,
            status,
            subStatus,
            remarks,
            createdAt: formatDateIST(createdAt),
            updatedAt: formatDateIST(updatedAt),
          };
        });

        setRows(mapped.length ? mapped : staticRows);
      } catch (err: unknown) {
        const e = err as { message?: string } | undefined;
        setError(e?.message ?? "Failed to load transactions");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [currentPage, limit, appliedStatusFilter, appliedSubStatusFilter, appliedStartDate, appliedEndDate, appliedSearchTerm]);

  // Initialize date pickers when filter panel is visible (inputs exist in the DOM)
  useEffect(() => {
    if (showFilters) {
      if (startDateRef.current && !startDatePickerRef.current) {
        startDatePickerRef.current = flatpickr(startDateRef.current, {
          dateFormat: "Y-m-d",
          appendTo: document.body,
          clickOpens: true,
          disableMobile: true,
          onChange: (selectedDates) => {
            if (selectedDates.length > 0) {
              const dateStr = selectedDates[0].toISOString().split("T")[0];
              setStartDate(dateStr);
            } else {
              setStartDate("");
            }
          },
        });
      }

      if (endDateRef.current && !endDatePickerRef.current) {
        endDatePickerRef.current = flatpickr(endDateRef.current, {
          dateFormat: "Y-m-d",
          appendTo: document.body,
          clickOpens: true,
          disableMobile: true,
          onChange: (selectedDates) => {
            if (selectedDates.length > 0) {
              const dateStr = selectedDates[0].toISOString().split("T")[0];
              setEndDate(dateStr);
            } else {
              setEndDate("");
            }
          },
        });
      }
    }

    return () => {
      // Always destroy on cleanup to avoid stale instances across toggles
      if (startDatePickerRef.current) {
        startDatePickerRef.current.destroy();
        startDatePickerRef.current = null;
      }
      if (endDatePickerRef.current) {
        endDatePickerRef.current.destroy();
        endDatePickerRef.current = null;
      }
    };
  }, [showFilters]);

  // Reset to page 1 when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedStatusFilter, appliedSubStatusFilter, appliedStartDate, appliedEndDate, appliedSearchTerm]);

  const handleFilterChange = (type: "status" | "subStatus", value: string) => {
    if (type === "status") {
      setStatusFilter(value);
    } else {
      setSubStatusFilter(value);
    }
  };

  const applyFilters = () => {
    setAppliedStatusFilter(statusFilter);
    setAppliedSubStatusFilter(subStatusFilter);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setAppliedSearchTerm(searchTerm);
  };

  const clearFilters = () => {
    // Clear temporary filters
    setStatusFilter("");
    setSubStatusFilter("");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    // Clear applied filters
    setAppliedStatusFilter("");
    setAppliedSubStatusFilter("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setAppliedSearchTerm("");
    if (startDatePickerRef.current) {
      startDatePickerRef.current.clear();
    }
    if (endDatePickerRef.current) {
      endDatePickerRef.current.clear();
    }
    setShowFilters(false);
  };

  const hasActiveFilters = appliedStatusFilter || appliedSubStatusFilter || appliedStartDate || appliedEndDate || appliedSearchTerm;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange" as ColumnResizeMode,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
      size: 150,
    },
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Transactions</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-theme-sm font-medium shadow-theme-xs transition-colors ${
              hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            }`}
          >
            <svg className="stroke-current fill-white dark:fill-gray-800" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.29004 5.90393H17.7067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.7075 14.0961H2.29085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z" strokeWidth="1.5" />
              <path d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z" strokeWidth="1.5" />
            </svg>
            Filter
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                {[appliedStatusFilter, appliedSubStatusFilter, appliedSearchTerm].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sub Status
              </label>
              <select
                value={subStatusFilter}
                onChange={(e) => handleFilterChange("subStatus", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
              >
                {subStatus_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                ref={startDateRef}
                type="text"
                placeholder="Select start date"
                value={startDate}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                ref={endDateRef}
                type="text"
                placeholder="Select end date"
                value={endDate}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={applyFilters}
              className="rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const isLastColumn = headerIndex === headerGroup.headers.length - 1;
                  return (
                    <TableCell
                      key={header.id}
                      isHeader
                      className={`py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap relative truncate overflow-hidden text-ellipsis ${
                        !isLastColumn ? "border-r border-gray-200 dark:border-gray-700" : ""
                      }`}
                      style={{
                        width: header.getSize(),
                        position: "relative",
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 right-0 h-full cursor-col-resize select-none touch-none bg-transparent w-1"
                          style={{
                            userSelect: "none",
                            touchAction: "none",
                            marginRight: "-1px",
                            width: "4px",
                          }}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && (
              <TableRow>
                <TableCell className="py-6 text-center" colSpan={columns.length}>
                  <span className="text-gray-500 text-center">Loading...</span>
                </TableCell>
              </TableRow>
            )}

            {error && !loading && (
              <TableRow>
                <TableCell className="py-6 text-center" colSpan={columns.length}>
                  <span className="text-red-500 text-center">{error}</span>
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isLastColumn = cellIndex === row.getVisibleCells().length - 1;
                  return (
                    <TableCell
                      key={cell.id}
                      className={`py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center relative truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                        !isLastColumn ? "border-r border-gray-200 dark:border-gray-700" : ""
                      }`}
                      style={{
                        width: cell.column.getSize(),
                        position: "relative",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} transactions
          </div>
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                      ...
                    </span>
                  );
                }
                
                const pageNum = page as number;
                const isActive = pageNum === currentPage;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-theme-sm font-medium shadow-theme-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isActive
                        ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
