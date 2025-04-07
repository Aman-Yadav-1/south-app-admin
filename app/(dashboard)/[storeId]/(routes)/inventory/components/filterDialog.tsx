import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FilterData } from "./types";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterData: FilterData;
  setFilterData: (data: FilterData) => void;
  categories: string[];
  suppliers: string[];
  onResetFilters: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  filterData,
  setFilterData,
  categories,
  suppliers,
  onResetFilters
}) => {
  const handleFilterChange = (key: keyof FilterData, value: string | boolean) => {
    setFilterData({
      ...filterData,
      [key]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Filter Inventory</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your inventory items
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-category" className="font-medium">Category</Label>
            <Select
              value={filterData.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter-supplier" className="font-medium">Supplier</Label>
            <Select
              value={filterData.supplier}
              onValueChange={(value) => handleFilterChange("supplier", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filter-search" className="font-medium">Search</Label>
            <Input
              id="filter-search"
              value={filterData.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              placeholder="Search by name, SKU, or notes"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-lowStock"
              checked={filterData.lowStock}
              onCheckedChange={(checked) => 
                handleFilterChange("lowStock", checked === true)
              }
            />
            <Label
              htmlFor="filter-lowStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only low stock items
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-expiringSoon"
              checked={filterData.expiringSoon}
              onCheckedChange={(checked) => 
                handleFilterChange("expiringSoon", checked === true)
              }
            />
            <Label
              htmlFor="filter-expiringSoon"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only items expiring soon
            </Label>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="mt-2 sm:mt-0"
          >
            Reset Filters
          </Button>
          <Button 
            onClick={onClose}
            className="mt-2 sm:mt-0"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
