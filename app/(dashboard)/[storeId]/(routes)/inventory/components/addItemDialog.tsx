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
import { addInventoryItem } from "./inventoryActions";

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  categories: string[];
  suppliers: { id: string; name: string }[];
  onSuccess: () => void;
}

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  categories,
  suppliers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    minQuantity: "",
    unit: "",
    category: "",
    cost: "",
    supplier: "",
    expiryDate: undefined as Date | undefined, // Explicitly type this
    location: "",
    sku: "",
    notes: "",
    tags: [] as string[],
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "category" && value === "new") {
      setShowNewCategoryInput(true);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset new category input when selecting a different category
    if (name === "category") {
      setShowNewCategoryInput(false);
      setNewCategoryInput("");
    }
  };
  
  const handleNewCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCategoryInput(value);
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      quantity: "",
      minQuantity: "",
      unit: "",
      category: "",
      cost: "",
      supplier: "",
      expiryDate: undefined,
      location: "",
      sku: "",
      notes: "",
      tags: [],
    });
    setShowNewCategoryInput(false);
  };

  const handleAddItem = async () => {
    try {
      setLoading(true);

      if (!formData.name || !formData.quantity) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Convert empty strings to 0 for numeric fields
      const processedData = {
        name: formData.name,
        quantity: formData.quantity === "" ? 0 : parseFloat(formData.quantity),
        minQuantity:
          formData.minQuantity === "" ? 0 : parseFloat(formData.minQuantity),
        unit: formData.unit,
        category: formData.category,
        cost: formData.cost === "" ? 0 : parseFloat(formData.cost),
        supplier: formData.supplier === "none" ? "" : formData.supplier,
        expiryDate: formData.expiryDate,
        location: formData.location,
        sku: formData.sku,
        notes: formData.notes,
        tags: formData.tags,
      };

      await addInventoryItem(storeId, processedData);

      toast.success("Item added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Add New Item</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new inventory item
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="font-medium">
              SKU / Item Code
            </Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="SKU or item code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-medium">
              Quantity *
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="font-medium">
              Unit *
            </Label>
            <Input
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="kg, liters, pieces, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minQuantity" className="font-medium">
              Min Quantity
            </Label>
            <Input
              id="minQuantity"
              name="minQuantity"
              type="number"
              value={formData.minQuantity}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost" className="font-medium">
              Cost (₹) *
            </Label>
            <Input
              id="cost"
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
  <Label htmlFor="category" className="font-medium">Category</Label>
  <div className="space-y-2">
    {!showNewCategoryInput ? (
      <Select
      value={formData.category}
      onValueChange={(value) => handleSelectChange("category", value)}
    >
      <SelectTrigger>
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
      <div className="flex gap-2">
        <Input
          placeholder="Enter new category name"
          value={newCategoryInput}
          onChange={handleNewCategoryInputChange}
          className="flex-1"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newCategoryInput.trim()) {
              e.preventDefault();
              const trimmedCategory = newCategoryInput.trim();
              
              // Save the category name to form data
              setFormData(prev => ({
                ...prev,
                category: trimmedCategory
              }));
              
              // Add to custom categories if not already in the original categories list
              if (!categories.includes(trimmedCategory) && !customCategories.includes(trimmedCategory)) {
                setCustomCategories(prev => [...prev, trimmedCategory]);
              }
              
              // Exit input mode
              setShowNewCategoryInput(false);
            }
          }}
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setShowNewCategoryInput(false);
            setFormData(prev => ({
              ...prev,
              category: ""
            }));
          }}
        >
          ✕
        </Button>
      </div>
    )}
  </div>
</div>

          <div className="space-y-2">
            <Label htmlFor="supplier" className="font-medium">
              Supplier
            </Label>
            <Select
              value={formData.supplier}
              onValueChange={(value) => handleSelectChange("supplier", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="location" className="font-medium">
              Storage Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Shelf, bin, etc."
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes" className="font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional information about this item"
              rows={3}
            />
          </div>
        </div>

        <Separator className="my-4" />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={
              loading || !formData.name || !formData.quantity || !formData.unit
            }
            className="mt-2 sm:mt-0"
          >
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
