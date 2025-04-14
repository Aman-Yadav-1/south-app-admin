"use client";

import { useState } from "react";
import { Copy, Edit, MoreVertical, Trash, Archive, Star, Eye, BarChart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/Modal/alert-modal";
import { ProductColumn } from "./columns";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CellActionProps {
  data: ProductColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Product ID copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy ID to clipboard");
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      
      // Delete product from Firestore
      await deleteDoc(doc(db, "stores", params.storeId as string, "products", data.id));
      
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const onToggleArchive = async () => {
    try {
      setIsLoading(true);
      
      // Toggle archive status
      await updateDoc(doc(db, "stores", params.storeId as string, "products", data.id), {
        isArchived: !data.isArchived
      });
      
      toast.success(data.isArchived ? "Product restored" : "Product archived");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onToggleFeatured = async () => {
    try {
      setIsLoading(true);
      
      // Toggle featured status
      await updateDoc(doc(db, "stores", params.storeId as string, "products", data.id), {
        isFeatured: !data.isFeatured
      });
      
      toast.success(data.isFeatured ? "Product unfeatured" : "Product featured");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                  disabled={isLoading}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actions</p>
            </TooltipContent>
          </Tooltip>
          
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem 
              onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
              className="flex items-center cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onToggleFeatured()}
              className="flex items-center cursor-pointer"
            >
              <Star className="h-4 w-4 mr-2" />
              {data.isFeatured ? "Unmark as Featured" : "Mark as Featured"}
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onToggleArchive()}
              className="flex items-center cursor-pointer"
            >
              <Archive className="h-4 w-4 mr-2" />
              {data.isArchived ? "Restore Product" : "Archive Product"}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => onCopy(data.id)}
              className="flex items-center cursor-pointer"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy ID
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </>
  );
};
