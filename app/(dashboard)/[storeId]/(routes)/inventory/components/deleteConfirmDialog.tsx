import { useState } from "react";
import { toast } from "react-hot-toast";
import { AlertModal } from "@/components/Modal/alert-modal";
import { deleteInventoryItem } from "./inventoryActions";
import { InventoryItem } from "./types";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  item: InventoryItem | null;
  onSuccess: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  item,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    
    try {
      setLoading(true);
      
      // Call the existing delete function from inventoryActions
      await deleteInventoryItem(storeId, item.id);
      
      toast.success("Item deleted successfully");
      onSuccess(); // Refresh the inventory list
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      loading={loading}
    />
  );
};
