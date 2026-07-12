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
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

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
  status: string | undefined;
};

export const columns: ColumnDef<ITableInterface>[] = [
  {
    accessorKey: "patientName",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-xs font-bold hover:text-primary transition-colors text-[10px] uppercase tracking-widest text-outline"
      >
        Patient
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("patientName") as string;
      const initial = name ? name[0] : "P";
      return (
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-body-sm">
            {initial}
          </div>
          <span className="font-bold text-body-md text-on-surface">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "patientEmail",
    header: () => <span className="text-[10px] uppercase font-bold text-outline tracking-widest">Contact Info</span>,
    cell: ({ row }) => (
      <div className="text-body-sm text-on-surface-variant font-medium">
        {row.getValue("patientEmail")}
      </div>
    ),
  },
  {
    accessorKey: "startingTime",
    header: () => <span className="text-[10px] uppercase font-bold text-outline tracking-widest">Session Schedule</span>,
    cell: ({ row }) => {
      const start = new Date(row.getValue("startingTime") as Date);
      const end = new Date(row.original.endingTime as Date);
      return (
        <div className="flex flex-col">
          <span className="text-body-sm font-bold text-on-surface">
            {format(start, "MMM dd, yyyy")}
          </span>
          <span className="text-xs text-outline tabular-nums">
            {format(start, "hh:mm aa")} - {format(end, "hh:mm aa")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "doctorSpecialicity",
    header: () => <span className="text-[10px] uppercase font-bold text-outline tracking-widest">Mode</span>,
    cell: ({ row }) => {
      const spec = row.getValue("doctorSpecialicity") as string;
      const isCouple = spec?.toLowerCase().includes("couple");
      return (
        <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
          {isCouple ? (
            <>
              <span className="material-symbols-outlined text-secondary text-sm">groups</span>
              <span className="text-secondary">Couple</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-primary text-sm">videocam</span>
              <span>Online</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="text-[10px] uppercase font-bold text-outline tracking-widest">Status</span>,
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "PENDING";
      const isCompleted = status === "COMPLETED";
      return (
        <span
          className={`px-2 py-1 text-[10px] font-bold rounded-full ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-[10px] uppercase font-bold text-outline tracking-widest text-center block">Actions</span>,
    cell: () => (
      <div className="flex justify-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
          <span className="material-symbols-outlined text-[18px]">chat</span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
          <span className="material-symbols-outlined text-[18px]">call</span>
        </button>
      </div>
    ),
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
    <div className="bg-surface-container-lowest rounded-xl custom-shadow overflow-hidden border border-outline-variant/10">
      <div className="px-lg py-md border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Patients Registry</h3>
        <div className="flex items-center gap-md">
          <Input
            placeholder="Search Patient Name..."
            value={(table.getColumn("patientName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("patientName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-9 bg-surface border border-outline-variant/30 rounded-lg text-body-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <Table>
          <TableHeader className="bg-surface-container-low/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-outline-variant/10">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-lg py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-outline-variant/10">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-surface-container-low/20 transition-colors border-b border-outline-variant/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-lg py-4">
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
                  className="h-24 text-center text-body-sm text-outline"
                >
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="px-lg py-3 border-t border-outline-variant/10 flex items-center justify-between">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
};

export default DashboardDataTable;
