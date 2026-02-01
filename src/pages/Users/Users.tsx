
import React, { useEffect, useState, useMemo } from "react";
import { getUsers, type User } from "../../api/adapters/backendAPI";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import Avatar from "../../components/ui/avatar/Avatar";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type ColumnResizeMode,
} from "@tanstack/react-table";

// User row shape for table
type UserRow = {
  id: string;
  name: string;
  email: string;
  img: string;
  isActive: boolean;
};

const columnHelper = createColumnHelper<UserRow>();

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [userStatuses, setUserStatuses] = useState<Record<string, boolean>>({});

  // Fixed page size for consistent user experience
  const pageLimit = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: { page: number; limit: number; search?: string } = {
          page: currentPage,
          limit: pageLimit,
        };
        const trimmed = appliedSearchTerm.trim();
        if (trimmed) params.search = trimmed;
        const result = await getUsers(params);
        setUsers(result.items);
        setTotal(result.total);
        setTotalPages(Math.max(1, Math.ceil(result.total / pageLimit)));
        
        // Initialize user statuses (default to active)
        const statuses: Record<string, boolean> = {};
        result.items.forEach(user => {
          if (!(user.id in userStatuses)) {
            statuses[user.id] = true; // Default to active
          }
        });
        if (Object.keys(statuses).length > 0) {
          setUserStatuses(prev => ({ ...prev, ...statuses }));
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, pageLimit, appliedSearchTerm]); // Removed userStatuses from dependencies

  const applySearch = () => {
    setAppliedSearchTerm(searchTerm.trim());
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  const handleStatusToggle = (userId: string) => {
    setUserStatuses(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const displayUsers = useMemo(() => {
    return users.map((u) => {
      const record = u as unknown as Record<string, unknown>;
      const profile = (record["profile"] as Record<string, unknown> | undefined) ?? undefined;

      const name =
        (typeof u.name === "string" && u.name !== "Unknown" ? u.name : undefined) ??
        (typeof profile?.["name"] === "string" ? (profile["name"] as string) : undefined) ??
        (typeof profile?.["fullName"] === "string" ? (profile["fullName"] as string) : undefined) ??
        (typeof profile?.["username"] === "string" ? (profile["username"] as string) : undefined) ??
        "—";

      const email =
        u.email ??
        (typeof profile?.["email"] === "string" ? (profile["email"] as string) : undefined) ??
        (typeof profile?.["mail"] === "string" ? (profile["mail"] as string) : undefined) ??
        "—";

      const imgCandidates = [
        (u as any).photoURL, // Direct access to photoURL from user object
        profile?.["photoURL"],


      ];
      const img = imgCandidates.find((v) => typeof v === "string" && v.length > 0) as string | undefined;

      return {
        id: u.id,
        name,
        email,
        img: img ?? "/images/user/owner.png",
        isActive: userStatuses[u.id] ?? true,
      };
    });
  }, [users, userStatuses]);

  // Memoize mobile check to prevent re-renders
  const isMobile = useMemo(() => {
    return typeof window !== "undefined" && window.innerWidth < 640;
  }, []);

  // Define columns with resizable functionality
  const columns = useMemo(
    () => [
      columnHelper.accessor("img", {
        header: "Avatar",
        cell: (info) => (
          <div className="flex justify-center">
            <Avatar
              src={info.getValue()}
              alt={info.row.original.name}
              name={info.row.original.name}
              size="small"
            />
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <div className="truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => {
          const userId = info.row.original.id;
          const isActive = info.getValue();
          return (
            <div className="flex justify-center">
              <button
                onClick={() => handleStatusToggle(userId)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                }`}
                title={isActive ? "Active - Click to deactivate" : "Inactive - Click to activate"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        },
        size: 100,
        minSize: 80,
        maxSize: 120,
      }),
    ],
    [userStatuses]
  );

  const table = useReactTable({
    data: displayUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Disable column resizing for mobile
    ...(isMobile
      ? {
          enableColumnResizing: false,
          columnResizeMode: undefined,
          defaultColumn: {},
        }
      : {
          enableColumnResizing: true,
          columnResizeMode: "onChange" as ColumnResizeMode,
          defaultColumn: {
            minSize: 50,
            maxSize: 800,
            size: 150,
          },
        }),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Users</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus:border-blue-500"
          />
          <button
            onClick={applySearch}
            className="rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Search
          </button>
          {(appliedSearchTerm || searchTerm) && (
            <button
              onClick={clearSearch}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto" style={{ maxWidth: "100vw" }}>
        <Table className={isMobile ? "w-full" : "w-full table-fixed"}>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const isLastColumn = headerIndex === headerGroup.headers.length - 1;
                  return (
                    <TableCell
                      key={header.id}
                      isHeader
                      className={`py-3 px-2 sm:px-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap relative ${
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
                      className={`py-3 px-2 sm:px-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center relative whitespace-nowrap ${
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

      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
            Showing {((currentPage - 1) * pageLimit) + 1} to {Math.min(currentPage * pageLimit, total)} of {total} users
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

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
                    className={`inline-flex items-center justify-center rounded-lg border px-2 sm:px-3 py-2 text-theme-sm font-medium shadow-theme-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
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
};

export default Users;
