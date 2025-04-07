import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History } from "lucide-react";
import { updateInventoryItem } from "./inventoryActions";
import { InventoryItem } from "./types";

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  item: InventoryItem | null;
  categories: string[];
  suppliers: { id: string; name: string }[];
  onSuccess: () => void;
  onAdjustStock: () => void;
  onViewHistory: () => void;
}

export const EditItemDialog: React.FC<EditItemDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  item,
  categories,
  suppliers,
  onSuccess,
  onAdjustStock,
  onViewHistory,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    minQuantity: "",
    unit: "",
    category: "",
    cost: "",
    supplier: "",
    expiryDate: undefined as Date | undefined,
    location: "",
    sku: "",
    notes: "",
    tags: [] as string[],
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        quantity: item.quantity.toString() || "",
        minQuantity: item.minQuantity.toString() || "",
        unit: item.unit || "",
        category: item.category || "",
        cost: item.cost.toString() || "",
        // Fix: Handle empty supplier value
        supplier: item.supplier || "none",
        expiryDate: item.expiryDate,
        location: item.location || "",
        sku: item.sku || "",
        notes: item.notes || "",
        tags: item.tags || [],
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCategoryChange = (value: string) => {
    if (value === "new") {
      // When "Add New Category" is selected
      setIsAddingNewCategory(true);
      setNewCategoryName("");
      // Keep the dropdown open
      setIsCategoryDropdownOpen(true);
    } else {
      // Normal category selection
      setFormData({
        ...formData,
        category: value
      });
      setIsAddingNewCategory(false);
    }
  };

  const handleNewCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategoryName(value);
    
    // Update the form data with the new category name
    setFormData({
      ...formData,
      category: value
    });
  };
  const handleUpdateItem = async () => {
    if (!item) return;

    try {
      setLoading(true);

      // Convert empty strings to 0 for numeric fields
      const processedData = {
        name: formData.name,
        quantity: formData.quantity === "" ? 0 : parseFloat(formData.quantity),
        minQuantity:
          formData.minQuantity === "" ? 0 : parseFloat(formData.minQuantity),
        unit: formData.unit,
        category: formData.category,
        cost: formData.cost === "" ? 0 : parseFloat(formData.cost),
        // Fix: Handle "none" value for supplier
        supplier: formData.supplier === "none" ? "" : formData.supplier,
        expiryDate: formData.expiryDate,
        location: formData.location,
        sku: formData.sku,
        notes: formData.notes,
        tags: formData.tags,
      };

      await updateInventoryItem(storeId, item.id, processedData);

      toast.success("Item updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Edit Item</DialogTitle>
          <DialogDescription>
            Update the details of your inventory item
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="font-medium">
                  Name *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-sku" className="font-medium">
                  SKU / Item Code
                </Label>
                <Input
                  id="edit-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="SKU or item code"
                />
              </div>

              <div className="space-y-2">
  <Label htmlFor="edit-category" className="font-medium">Category</Label>
  
  {!isAddingNewCategory ? (
    // Regular category dropdown
    <Select
      value={formData.category}
      onValueChange={handleCategoryChange}
      open={isCategoryDropdownOpen}
      onOpenChange={setIsCategoryDropdownOpen}
    >
      <SelectTrigger id="edit-category">
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Uncategorized">Uncategorized</SelectItem>
        
        {/* Original categories */}
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
        
        {/* Custom categories */}
        {customCategories.map((category) => (
          <SelectItem key={`custom-${category}`} value={category}>
            {category}
          </SelectItem>
        ))}
        
        <SelectItem value="new">+ Add New Category</SelectItem>
      </SelectContent>
    </Select>
  ) : (
    // New category input field without any additional label
    <div className="flex gap-2">
      <Input
        id="newEditCategory"
        placeholder="Enter new category name"
        value={newCategoryName}
        onChange={handleNewCategoryInputChange}
        className="flex-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && newCategoryName.trim()) {
            e.preventDefault();
            const trimmedCategory = newCategoryName.trim();
            
            // Save the category name to form data
            setFormData({
              ...formData,
              category: trimmedCategory
            });
            
            // Add to custom categories if not already in the original categories list
            if (!categories.includes(trimmedCategory) && !customCategories.includes(trimmedCategory)) {
              setCustomCategories(prev => [...prev, trimmedCategory]);
            }
            
            // Exit input mode
            setIsAddingNewCategory(false);
          }
        }}
      />
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => {
          setIsAddingNewCategory(false);
          if (!newCategoryName) {
            setFormData({
              ...formData,
              category: ""
            });
          }
        }}
      >
        ✕
      </Button>
    </div>
  )}
</div>

              <div className="space-y-2">
                <Label htmlFor="edit-supplier" className="font-medium">
                  Supplier
                </Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) =>
                    handleSelectChange("supplier", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Fix: Change empty string to "none" */}
                    <SelectItem value="none">None</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cost" className="font-medium">
                  Cost (₹) *
                </Label>
                <Input
                  id="edit-cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location" className="font-medium">
                  Storage Location
                </Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Shelf, bin, etc."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-notes" className="font-medium">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional information about this item"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="font-medium">
                  Current Quantity *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                  <span className="text-muted-foreground">{formData.unit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity" className="font-medium">
                  Min Quantity
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-minQuantity"
                    name="minQuantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <span className="text-muted-foreground">{formData.unit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-unit" className="font-medium">
                  Unit *
                </Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="kg, liters, pieces, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="font-medium">
                  Expiry Date
                </Label>

                {/* Use a native date input which is guaranteed to work */}
                <Input
                  id="expiryDate"
                  type="date"
                  value={
                    formData.expiryDate
                      ? formData.expiryDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const dateString = e.target.value;
                    if (dateString) {
                      const selectedDate = new Date(dateString);
                      console.log("Date input changed:", selectedDate);
                      setFormData({
                        ...formData,
                        expiryDate: selectedDate,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        expiryDate: undefined,
                      });
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={onAdjustStock}
                  className="flex items-center gap-2"
                >
                  Adjust Stock Level
                </Button>

                <Button
                  variant="outline"
                  onClick={onViewHistory}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  View History
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {formData.tags.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No tags added
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a tag"
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        e.preventDefault();
                        const newTag = e.currentTarget.value.trim();
                        if (newTag && !formData.tags.includes(newTag)) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, newTag],
                          });
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousSibling as HTMLInputElement;
                      const newTag = input.value.trim();
                      if (newTag && !formData.tags.includes(newTag)) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, newTag],
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateItem}
            disabled={loading || !formData.name || !formData.quantity}
            className="mt-2 sm:mt-0"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
