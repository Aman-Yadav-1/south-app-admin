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
import { Copy, Edit, Eye, MoreVertical, Trash } from "lucide-react";
import { AlertModal } from "@/components/Modal/alert-modal";
import axios from "axios";
import toast from "react-hot-toast";
import { OrderColumns } from "./columns";

interface CellActionProps {
  data: OrderColumns;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Order ID copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy ID to clipboard");
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      
      // Delete order from API
      await axios.delete(`/api/${params.storeId}/orders/${data.id}`);
      
      toast.success("Order deleted successfully");
      router.push(`/${params.storeId}/orders`);
      location.reload();
    } catch (error) {
      toast.error("Failed to delete order. Please try again.");
      console.error("[ORDER_DELETE_ERROR]", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const onUpdate = async (data:any) => {
    try {
      setIsLoading(true);
      
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, data);
      
      toast.success("Order Updated successfully");
      router.push(`/${params.storeId}/orders`);
      location.reload();
    } catch (error) {
      toast.error("Failed to update order. Please try again.");
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
        description="Are you sure you want to delete this order?"
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
            Copy Order ID
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onUpdate({id: data.id, order_status: "Delivering"})}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Delivering
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onUpdate({id: data.id, order_status: "Delivered"})}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Delivered
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => onUpdate({id: data.id, order_status: "Canceled"})}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Cancel
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => router.push(`/${params.storeId}/orders/${data.id}`)}
            className="flex items-center cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
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
  );};