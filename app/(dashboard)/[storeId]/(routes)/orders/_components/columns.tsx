"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Calendar, CreditCard, MapPin, Package, Phone } from "lucide-react"
import { CellAction } from "./cell-actions"
import CellImage from "./cell-image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type OrderColumns={
    id: string,
    phone: string,
    address: string,
    products: string,
    totalPrice: string,
    images: string[],
    isPaid: boolean,
    createdAt: string,
    order_status: string,
    customerName: string;
    orderDate: string; 
}

export const columns: ColumnDef<OrderColumns>[] = [
  {
    accessorKey: "images",
    header: "Products",
    cell: ({ row }) => ( 
        <div className="min-w-[100px]">
            <CellImage data={row.original.images} />
        </div>
    )
  },
  {
    accessorKey: "products",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="whitespace-nowrap"
        >
          <Package className="mr-2 h-4 w-4" />
          Product Details
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const products = row.original.products;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate font-medium">
                {products}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs whitespace-normal">{products}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.customerName}</div>
    )
  },
  {
    accessorKey: "phone",
    header: () => (
      <div className="flex items-center">
        <Phone className="mr-2 h-4 w-4" />
        Contact
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.phone}</div>
    )
  },
  {
    accessorKey: "address",
    header: () => (
      <div className="flex items-center">
        <MapPin className="mr-2 h-4 w-4" />
        Delivery Address
      </div>
    ),
    cell: ({ row }) => {
      const address = row.original.address;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px] truncate">
                {address}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs whitespace-normal">{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: "totalPrice",
    header: () => (
      <div className="flex items-center">
        <CreditCard className="mr-2 h-4 w-4" />
        Amount
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-bold">{row.original.totalPrice}</div>
    )
  },
  {
    accessorKey: "order_status",
    header: "Status",
    cell: ({ row }) => {
      const { order_status } = row.original;
      
      return (
        <Badge className={cn(
          "px-2 py-1 text-xs font-semibold",
          order_status === "Delivering" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
          order_status === "Processing" ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
          order_status === "Delivered" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
          order_status === "Canceled" ? "bg-red-100 text-red-800 hover:bg-red-100" :
          "bg-gray-100 text-gray-800 hover:bg-gray-100"
        )}>
          {order_status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "isPaid",
    header: "Payment",
    cell: ({ row }) => {
      const { isPaid } = row.original;

      return (
        <Badge variant={isPaid ? "default" : "destructive"} className="px-2 py-1">
          {isPaid ? "Paid" : "Unpaid"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="whitespace-nowrap"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Order Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap">{row.original.createdAt}</div>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
