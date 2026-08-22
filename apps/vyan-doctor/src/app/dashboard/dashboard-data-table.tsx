"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { addDays, format } from "date-fns";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@repo/ui/src/@/components/button";
import { Checkbox } from "@repo/ui/src/@/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/src/@/components/dropdown-menu";
import { Input } from "@repo/ui/src/@/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/src/@/components/table";
import { DataTablePagination } from "./dashboard-data-table-pagination";

export type ITableInterface = {
  id: string;
  patientName: string;
  patientEmail: string;
  bookingDate: Date;
  startingTime: Date;
  endingTime: Date;
  doctorSpecialicity: string | undefined;
  /** Real values from the booking, not the hard-coded "Online" this used to print. */
  status: string | null | undefined;
  serviceType: string | undefined;
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "border-success-100 bg-success-50 text-secondary-700",
  PAYMENT_SUCCESSFUL: "border-info-100 bg-info-50 text-info-600",
  PAYMENT_PENDING: "border-warning-100 bg-warning-50 text-warning-600",
  PAYMMENT_FAILED: "border-danger-100 bg-danger-50 text-danger-700",
  CANCELLED: "border-danger-100 bg-danger-50 text-danger-700",
  CANCELLED_WITH_REFUND: "border-danger-100 bg-danger-50 text-danger-700",
};

/** `PAYMENT_SUCCESSFUL` is not a phrase to show a doctor. */
const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  PAYMENT_SUCCESSFUL: "Confirmed",
  PAYMENT_PENDING: "Awaiting payment",
  PAYMMENT_FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  CANCELLED_WITH_REFUND: "Cancelled · refunded",
};

export const columns: ColumnDef<ITableInterface>[] = [
  {
    accessorKey: "patientName",
    accessorFn: (row) => row.patientName,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm text-body">
        {row.getValue("patientName")}
      </div>
    ),
  },
  {
    accessorKey: "patientEmail",
    accessorFn: (row) => row.patientEmail,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {/* Email */}
          Patient Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm lowercase text-body">
        {row.getValue("patientEmail")}
      </div>
    ),
  },
  {
    accessorKey: "bookingDate",
    header: "Booking Date",
    accessorFn: (row) => row.bookingDate,
    cell: ({ row }) => (
      <div className="text-sm text-body">
        {format(new Date(row.getValue("bookingDate")), "dd/MM/yyyy")}
      </div>
    ),
  },
  {
    accessorKey: "startingTime",
    header: "Appointment Time",
    accessorFn: (row) => row.startingTime,

    cell: ({ row }) => (
      <div className="text-sm text-body">
        {format(new Date(row.getValue("startingTime")), "hh:mm aa")}-
        {format(new Date(row.original.endingTime), "hh:mm aa")}{" "}
      </div>
    ),
  },
  {
    accessorKey: "doctorSpecialicity",
    header: "Appointment & Mode",
    accessorFn: (row) => row.doctorSpecialicity,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-body">
          {row.getValue("doctorSpecialicity") ?? "—"}
        </span>
        <span className="text-xs font-medium text-primary-700">
          {row.original.serviceType === "OFFLINE" ? "In person" : "Online"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    accessorFn: (row) => row.status ?? "",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) {
        return <span className="text-sm text-muted">—</span>;
      }
      return (
        <span
          className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-2xs font-medium ${
            STATUS_STYLES[status] ?? "border-hairline bg-slate-50 text-body"
          }`}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      );
    },
  },
];

const DashboardDataTable = ({
  tableValue,
}: {
  tableValue: ITableInterface[];
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: tableValue || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    // getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center px-5 py-4">
        <Input
          placeholder="Search Patient Name"
          value={(table.getColumn("patientName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("patientName")?.setFilterValue(event.target.value)
          }
          className="h-10 max-w-sm rounded-lg border-hairline-strong bg-surface text-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table  >
          <TableHeader  className="bg-[#F9FAFB]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
            {/* {table && table.getRowModel()?.rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )} */}
          </TableHeader>
          <TableBody>
            {table?.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <DataTablePagination table={table}/>
      </div>
    </div>
  );
};

export default DashboardDataTable;
