import { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2, History, BarChart2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "./types";

interface InventoryDataTableProps {
  data: InventoryItem[];
  loading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
}

export const InventoryDataTable: React.FC<InventoryDataTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onAdjustStock,
  onViewHistory
}) => {
  // Helper function to safely format dates from Firestore
  const formatFirestoreDate = (date: any) => {
    if (!date) return null;
    
    // If it's a Firestore Timestamp with toDate method
    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    // If it's a Firestore timestamp object with seconds
    if (date && date.seconds !== undefined) {
      return new Date(date.seconds * 1000);
    }
    
    // If it's already a Date object
    if (date instanceof Date) {
      return date;
    }
    
    // Try to parse as a date string or timestamp
    try {
      return new Date(date);
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => {
        const value = row.getValue("name") as string;
        return <span className="font-medium">{value}</span>;
      }
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const quantity = parseFloat(row.getValue("quantity"));
        const minQuantity = parseFloat(row.original.minQuantity);
        const isLowStock = quantity <= minQuantity;
        
        return (
          <div className="flex items-center">
            <span className={isLowStock ? "text-red-600 font-medium" : ""}>{quantity}</span>
            <span className="ml-1 text-muted-foreground">{row.original.unit}</span>
            {isLowStock && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Low
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const value = row.getValue("category") as string;
        return (
          <Badge variant="outline" className="font-normal">
            {value}
          </Badge>
        );
      }
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => {
        const value = row.getValue("supplier") as string;
        return value ? <span className="text-sm">{value}</span> : <span className="text-muted-foreground text-sm">-</span>;
      }
    },
    {
      accessorKey: "cost",
      header: "Cost (₹)",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("cost"));
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount);
        return <span className="font-medium">{formatted}</span>;
      },
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const rawDate = row.getValue("expiryDate");
        const date = formatFirestoreDate(rawDate);
        
        if (!date) return <span className="text-muted-foreground text-sm">-</span>;
        
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        const isExpiringSoon = date <= thirtyDaysFromNow;
        const isExpired = date <= now;
        
        return (
          <div className="flex items-center">
            <span className={
              isExpired 
                ? "text-red-600 font-medium" 
                : isExpiringSoon 
                  ? "text-amber-600 font-medium" 
                  : "text-muted-foreground"
            }>
              {format(date, "MMM dd, yyyy")}
            </span>
            {isExpired && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Expired
              </Badge>
            )}
            {!isExpired && isExpiringSoon && (
              <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-600">
                Soon
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => {
        const rawDate = row.getValue("lastUpdated");
        const date = formatFirestoreDate(rawDate);
        
        if (!date) return <span className="text-muted-foreground text-sm">-</span>;
        
        return <span className="text-muted-foreground text-sm">{format(date, "MMM dd, yyyy")}</span>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onAdjustStock(item)}
            >
              <BarChart2 className="h-4 w-4" />
              <span className="sr-only">Adjust Stock</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewHistory(item)}
            >
              <History className="h-4 w-4" />
              <span className="sr-only">History</span>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-card rounded-md border shadow-sm">
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search items by name..."
        isLoading={loading}
      />
    </div>
  );
};
