"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-actions";
import { Badge } from "@/components/ui/badge";

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  category: string;
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
  inventory?: number;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price"
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <Badge variant={row.original.isFeatured ? "default" : "outline"}>
          {row.original.isFeatured ? "Yes" : "No"}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <Badge variant={row.original.isArchived ? "destructive" : "outline"}>
          {row.original.isArchived ? "Yes" : "No"}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "inventory",
    header: "Stock",
    cell: ({ row }) => (
      <div>{row.original.inventory || 0}</div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
