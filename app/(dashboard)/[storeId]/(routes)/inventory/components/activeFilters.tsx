import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterData } from "./types";

interface ActiveFiltersProps {
  filterData: FilterData;
  onResetFilters: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filterData,
  onResetFilters
}) => {
  const hasActiveFilters = 
    filterData.category || 
    filterData.supplier || 
    filterData.lowStock || 
    filterData.expiringSoon || 
    filterData.searchTerm;
    
  if (!hasActiveFilters) return null;
  
  return (
    <div className="bg-muted/30 rounded-md p-3 mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Active Filters:</span>
      
      {filterData.category && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Category: {filterData.category}
        </Badge>
      )}
      
      {filterData.supplier && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Supplier: {filterData.supplier}
        </Badge>
      )}
      
      {filterData.lowStock && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Low Stock
        </Badge>
      )}
      
      {filterData.expiringSoon && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Expiring Soon
        </Badge>
      )}
      
      {filterData.searchTerm && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Search: {filterData.searchTerm}
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onResetFilters}
        className="ml-auto h-7 text-xs"
      >
        Clear All
      </Button>
    </div>
  );
};
