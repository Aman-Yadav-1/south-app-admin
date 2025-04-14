"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Purchase } from "./types";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  purchase: Purchase | null;
  onSuccess: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  purchase,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!purchase) return;

    try {
      setLoading(true);
      
      // Delete the purchase document
      await deleteDoc(doc(db, "stores", storeId, "purchases", purchase.id));
      
      toast.success("Purchase deleted successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error deleting purchase:", error);
      toast.error("Failed to delete purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this purchase record?
            {purchase && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="font-medium">{purchase.number}</p>
                <p className="text-sm text-muted-foreground">
                  Supplier: {purchase.supplier}
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: ₹{purchase.totalAmount.toFixed(2)}
                </p>
              </div>
            )}
            <p className="mt-2 text-red-500">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
