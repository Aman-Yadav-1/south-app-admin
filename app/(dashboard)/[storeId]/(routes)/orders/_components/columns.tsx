"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-actions";
import { Badge } from "@/components/ui/badge";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
  customerName: string;
  order_status: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.address}</div>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.products}</div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "isPaid",
    header: "Payment Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Badge variant={row.original.isPaid ? "default" : "destructive"}>
          {row.original.isPaid ? "Paid" : "Pending"}
        </Badge>
      </div>
    ),  },
  {
    accessorKey: "order_status",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.order_status;
      
      let variant: "default" | "outline" | "secondary" | "destructive" = "default";
      
      switch (status.toLowerCase()) {
        case "completed":
          variant = "default";
          break;
        case "processing":
          variant = "secondary";
          break;
        case "cancelled":
          variant = "destructive";
          break;
        case "pending":
          variant = "outline";
          break;
        default:
          variant = "default";
      }
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
