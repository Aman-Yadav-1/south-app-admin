import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
  SelectValue
} from "@/components/ui/select";
import { adjustInventoryStock } from "./inventoryActions";
import { InventoryItem } from "./types";

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  item: InventoryItem | null;
  onSuccess: () => void;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  item,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: "",
    reason: "",
    notes: ""
  });

  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdjustmentData({
      ...adjustmentData,
      [name]: value
    });
  };

  const handleAdjustStock = async () => {
    if (!item) return;
    
    try {
      setLoading(true);
      
      const quantityChange = parseFloat(adjustmentData.quantity.replace(/^[-+]/, ''));
      const isNegative = adjustmentData.quantity.startsWith('-');
      
      await adjustInventoryStock(
        storeId,
        item.id,
        isNegative ? -quantityChange : quantityChange,
        adjustmentData.reason,
        adjustmentData.notes
      );
      
      toast.success("Stock adjusted successfully");
      onSuccess();
      onClose();
      
      // Reset form
      setAdjustmentData({
        quantity: "",
        reason: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Adjust Stock</DialogTitle>
          <DialogDescription>
            Current stock: {item.quantity} {item.unit}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjust-quantity" className="font-medium">Quantity Change</Label>
            <div className="flex items-center gap-2">
              <Select
                value={adjustmentData.quantity.startsWith('-') ? 'remove' : 'add'}
                onValueChange={(value) => {
                  const currentValue = adjustmentData.quantity.replace(/^[-+]/, '');
                  setAdjustmentData({
                    ...adjustmentData,
                    quantity: value === 'remove' ? `-${currentValue}` : currentValue
                  });
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add (+)</SelectItem>
                  <SelectItem value="remove">Remove (-)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="adjust-quantity"
                name="quantity"
                type="number"
                value={adjustmentData.quantity.replace(/^[-+]/, '')}
                onChange={(e) => {
                  const isNegative = adjustmentData.quantity.startsWith('-');
                  setAdjustmentData({
                    ...adjustmentData,
                    quantity: isNegative ? `-${e.target.value}` : e.target.value
                  });
                }}
                min="0"
                step="0.01"
                placeholder="0"
                required
              />
              <span className="text-muted-foreground">{item.unit}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adjust-reason" className="font-medium">Reason</Label>
            <Select
              value={adjustmentData.reason}
              onValueChange={(value) => {
                setAdjustmentData({
                  ...adjustmentData,
                  reason: value
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restock">Restock</SelectItem>
                <SelectItem value="Inventory Count">Inventory Count</SelectItem>
                <SelectItem value="Damaged">Damaged/Spoiled</SelectItem>
                <SelectItem value="Used">Used in Production</SelectItem>
                <SelectItem value="Returned">Customer Return</SelectItem>
                <SelectItem value="Adjustment">Manual Adjustment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adjust-notes" className="font-medium">Notes</Label>
            <Textarea
              id="adjust-notes"
              name="notes"
              value={adjustmentData.notes}
              onChange={handleAdjustmentChange}
              placeholder="Additional details about this adjustment"
              rows={3}
            />
          </div>
        </div>
        
        <Separator className="my-4" />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdjustStock} 
            disabled={loading || !adjustmentData.quantity || !adjustmentData.reason}
            className="mt-2 sm:mt-0"
          >
            {loading ? "Adjusting..." : "Adjust Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
