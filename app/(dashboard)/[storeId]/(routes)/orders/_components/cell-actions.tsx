"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Printer, Truck, X } from "lucide-react";
import { AlertModal } from "@/components/Modal/alert-modal";
import axios from "axios";
import toast from "react-hot-toast";
import { OrderColumns } from "./columns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CellActionProps {
  data: OrderColumns;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState(data.order_status);

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
      
      // First close the modal to prevent UI issues
      setShowDeleteModal(false);
      
      // Then delete the order
      await axios.delete(`/api/${params.storeId}/orders/${data.id}`);
      
      // Show success message
      toast.success("Order deleted successfully");
      
      // Use a timeout to ensure the UI has time to update before refreshing
      setTimeout(() => {
        router.refresh();
      }, 300);
      
    } catch (error) {
      toast.error("Failed to delete order. Please try again.");
      console.error("[ORDER_DELETE_ERROR]", error);
      setIsLoading(false);
    }
  };

  const onUpdate = async () => {
    try {
      setIsLoading(true);
      
      // First close the modal to prevent UI issues
      setShowUpdateModal(false);
      
      // Then update the order
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        order_status: orderStatus
      });
      
      // Show success message
      toast.success("Order status updated successfully");
      
      // Use a timeout to ensure the UI has time to update before refreshing
      setTimeout(() => {
        router.refresh();
      }, 300);
      
    } catch (error) {
      toast.error("Failed to update order. Please try again.");
      console.error("[ORDER_UPDATE_ERROR]", error);
      setIsLoading(false);
    }
  };

  const printOrder = () => {
    toast.success("Print functionality would be implemented here");
  };

  return (
    <>
      <AlertModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDelete}
        loading={isLoading}
        description="Are you sure you want to delete this order? This action cannot be undone."
      />
      
      <Dialog open={showUpdateModal} onOpenChange={(open) => {
        if (!isLoading) setShowUpdateModal(open);
      }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{data.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 bg-white">
            <div className="grid gap-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={orderStatus}
                onValueChange={setOrderStatus}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Delivering">Delivering</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => !isLoading && setShowUpdateModal(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={onUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
          
          <DropdownMenuItem 
            onClick={() => onCopy(data.id)}
            className="flex items-center cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Order ID
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => !isLoading && setShowUpdateModal(true)}
            className="flex items-center cursor-pointer"
          >
            <Truck className="h-4 w-4 mr-2" />
            Update Status
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={printOrder}
            className="flex items-center cursor-pointer"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Order
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => !isLoading && setShowDeleteModal(true)}
            className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
