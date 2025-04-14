"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FilterData } from "./types";

interface ActiveFiltersProps {
  filterData: FilterData;
  onResetFilters: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filterData,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filterData.supplier !== "all" ||
    filterData.status !== "all" ||
    filterData.type !== "all" ||
    filterData.dateRange.from !== undefined ||
    filterData.dateRange.to !== undefined ||
    filterData.searchTerm !== "";

  if (!hasActiveFilters) {
    return null;
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "purchase_order":
        return "Purchase Order";
      case "credit_note":
        return "Credit Note";
      case "debit_note":
        return "Debit Note";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-6">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filterData.searchTerm && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Search: {filterData.searchTerm}
        </Badge>
      )}
      
      {filterData.supplier !== "all" && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Supplier: {filterData.supplier}
        </Badge>
      )}
      
      {filterData.status !== "all" && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Status: {filterData.status.charAt(0).toUpperCase() + filterData.status.slice(1)}
        </Badge>
      )}
      
      {filterData.type !== "all" && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Type: {getTypeLabel(filterData.type)}
        </Badge>
      )}
      
      {filterData.dateRange.from && (
        <Badge variant="secondary" className="flex items-center gap-1">
          From: {format(filterData.dateRange.from, "dd MMM yyyy")}
        </Badge>
      )}
      
      {filterData.dateRange.to && (
        <Badge variant="secondary" className="flex items-center gap-1">
          To: {format(filterData.dateRange.to, "dd MMM yyyy")}
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onResetFilters}
        className="h-7 px-2 text-xs"
      >
        <X className="h-3 w-3 mr-1" />
        Clear all
      </Button>
    </div>
  );
};
