"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Copy,
  Edit,
  MoreVertical,
  Trash,
  FileText,
  Eye,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/Modal/alert-modal";
import { OrderColumn } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState(data.order_status);
  const [paymentStatus, setPaymentStatus] = useState(data.isPaid);
  const [showViewModal, setShowViewModal] = useState(false);

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

      // Delete from Firestore
      await deleteDoc(
        doc(db, "stores", params.storeId as string, "orders", data.id)
      );

      toast.success("Order deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const onUpdateStatus = async () => {
    try {
      setIsLoading(true);

      // Update order status in Firestore
      await updateDoc(
        doc(db, "stores", params.storeId as string, "orders", data.id),
        {
          order_status: orderStatus,
          isPaid: paymentStatus,
        }
      );

      toast.success("Order status updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setIsLoading(false);
      setShowUpdateModal(false);
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

      {/* Update Status Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{data.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-status" className="text-right">
                Order Status
              </Label>
              <Select
                value={orderStatus}
                onValueChange={setOrderStatus}
                disabled={isLoading}
              >
                <SelectTrigger id="order-status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-status" className="text-right">
                Payment Status
              </Label>
              <Select
                value={paymentStatus ? "Paid" : "Unpaid"}
                onValueChange={(value) => setPaymentStatus(value === "Paid")}
                disabled={isLoading}
              >
                <SelectTrigger id="payment-status" className="col-span-3">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={onUpdateStatus} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Details Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900">
  <DialogHeader>
    <DialogTitle>Order Details</DialogTitle>
    <DialogDescription>
      Order #{data.id.substring(0, 8)}
    </DialogDescription>
  </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Customer Information
                </h3>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {data.customerName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {data.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {data.address}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Order Information
                </h3>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Date:</span> {data.createdAt}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span>{" "}
                    {data.totalPrice}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Payment Status:</span>
                    <Badge variant={data.isPaid ? "secondary" : "destructive"}>
                      {data.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Order Status:</span>
                    <Badge
                      variant={
                        data.order_status.toLowerCase() === "completed"
                          ? "secondary"
                          : data.order_status.toLowerCase() === "processing"
                          ? "secondary"
                          : data.order_status.toLowerCase() === "cancelled"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {data.order_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Products
              </h3>
              <div className="mt-2">
                <p>{data.products}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowViewModal(false);
                setShowUpdateModal(true);
              }}
            >
              Update Status
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
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setShowViewModal(true)}
            className="flex items-center cursor-pointer"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Status
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
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
