"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import { AlertModal } from "@/components/Modal/alert-modal";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/lib/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import { ProductColumns } from "./columns";

interface CellActionProps {
  data: ProductColumns;
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
      
      // Try to delete the image from storage, but don't let it block the billboard deletion if it fails
      try {
        const nameRef = ref(storage, data.name);
        await deleteObject(nameRef);
      } catch (error) {
        console.log("[IMAGE_DELETE_ERROR]", error);
        // Continue with billboard deletion even if image deletion fails
      }
      
      // Delete billboard from API
      await axios.delete(`/api/${params.storeId}/products/${data.id}`);
      
      toast.success("product deleted successfully");
      location.reload();
    } catch (error) {
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={() => onCopy(data.id)}
            className="flex items-center cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Id
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};