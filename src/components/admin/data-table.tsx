import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <Table className={cn("text-sm", className)}>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn(
                "text-muted-foreground h-9 px-4 text-xs font-medium",
                column.className,
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={getRowKey(row)}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className={cn("px-4 py-2.5 text-sm", column.className)}
              >
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
