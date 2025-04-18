"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { doc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Plus, Trash, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Purchase, PurchaseItem, Payment, Supplier } from "./types";
import { cn } from "@/lib/utils";

interface EditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  purchase: Purchase | null;
  suppliers: Supplier[];
  onSuccess: () => void;
}

export const EditPurchaseDialog: React.FC<EditPurchaseDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  purchase,
  suppliers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Purchase>>({
    type: "purchase_order",
    number: "",
    supplier: "",
    date: new Date(),
    dueDate: undefined,
    items: [],
    totalAmount: 0,
    paidAmount: 0,
    status: "pending",
    notes: "",
    payments: [],
  });

  // Payment form state
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    date: new Date(),
    amount: 0,
    method: "cash",
    reference: "",
    notes: "",
  });

  // Initialize form with purchase data when it changes
  useEffect(() => {
    if (purchase) {
      setFormData({
        ...purchase,
      });
    }
  }, [purchase]);

  // Calculate totals when items change
useEffect(() => {
  if (formData.items) {
    const total = formData.items.reduce((sum, item) => sum + item.total, 0);
    setFormData(prev => {
      // Only update if the total has changed
      if (prev.totalAmount !== total) {
        return {
          ...prev,
          totalAmount: total,
        };
      }
      return prev;
    });
  }
}, [formData.items]);

  // Calculate paid amount when payments change
useEffect(() => {
  if (formData.payments) {
    const paid = formData.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update paid amount and status
    setFormData(prev => {
      const newStatus = determineStatus(paid, prev.totalAmount || 0);
      // Only update if values have changed
      if (prev.paidAmount !== paid || prev.status !== newStatus) {
        return {
          ...prev,
          paidAmount: paid,
          status: newStatus,
        };
      }
      return prev;
    });
  }
}, [formData.payments]);

  // Helper function to determine status based on payment
  const determineStatus = (paidAmount: number, totalAmount: number): Purchase['status'] => {
    if (paidAmount <= 0) return "pending";
    if (paidAmount >= totalAmount) return "paid";
    return "partial";
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    if (!formData.items) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate subtotal and total
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const price = field === 'price' ? value : updatedItems[index].price;
      const subtotal = quantity * price;
      
      updatedItems[index].subtotal = subtotal;
      updatedItems[index].total = subtotal; // Assuming no tax/discount for simplicity
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Add new item
  const addItem = () => {
    if (!formData.items) return;
    
    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      unit: "pcs",
      price: 0,
      subtotal: 0,
      total: 0,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  // Remove item
  const removeItem = (index: number) => {
    if (!formData.items) return;
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Handle payment input changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPayment({
      ...newPayment,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    });
  };
  // Handle payment select changes
  const handlePaymentSelectChange = (name: string, value: string) => {
    setNewPayment({
      ...newPayment,
      [name]: value,
    });
  };

  // Handle payment date change
  const handlePaymentDateChange = (date: Date | undefined) => {
    setNewPayment({
      ...newPayment,
      date: date || new Date(),
    });
  };

  // Add new payment
  const addPayment = () => {
    if (!formData.payments || !newPayment.amount || newPayment.amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      date: newPayment.date || new Date(),
      amount: newPayment.amount || 0,
      method: newPayment.method as string || "cash",
      reference: newPayment.reference || "",
      notes: newPayment.notes,
    };

    setFormData({
      ...formData,
      payments: [...formData.payments, payment],
    });

    // Reset payment form
    setNewPayment({
      date: new Date(),
      amount: 0,
      method: "cash",
      reference: "",
      notes: "",
    });
  };

  // Remove payment
  const removePayment = (index: number) => {
    if (!formData.payments) return;
    
    const updatedPayments = [...formData.payments];
    updatedPayments.splice(index, 1);

    setFormData({
      ...formData,
      payments: updatedPayments,
    });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!purchase || !formData.number || !formData.supplier) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Update purchase in Firestore
      const purchaseRef = doc(db, "stores", storeId, "purchases", purchase.id);
      await updateDoc(purchaseRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Purchase updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast.error("Failed to update purchase");
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!purchase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Purchase #{purchase.number}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto px-1">
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Purchase Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase_order">Purchase Order</SelectItem>
                      <SelectItem value="credit_note">Credit Note</SelectItem>
                      <SelectItem value="debit_note">Debit Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Purchase Number *</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="PO-0001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => handleSelectChange("supplier", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleDateChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => handleDateChange("dueDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Additional notes about this purchase"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Purchase Items</h3>
                <Button
                  size="sm"
                  onClick={addItem}
                  disabled={loading}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>

              {formData.items && formData.items.length > 0 ? (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="border rounded-md p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Item #{index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Item Name *</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            disabled={loading}
                            placeholder="Item name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                              disabled={loading}
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) => handleItemChange(index, "unit", value)}
                              disabled={loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pcs">Pieces</SelectItem>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="g">Grams</SelectItem>
                                <SelectItem value="l">Liters</SelectItem>
                                <SelectItem value="ml">Milliliters</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                                <SelectItem value="pack">Pack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Unit Price *</Label>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                            disabled={loading}
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subtotal</Label>
                          <Input
                            value={formatCurrency(item.subtotal)}
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Total</Label>
                          <Input
                            value={formatCurrency(item.total)}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <div className="w-1/3 space-y-2 border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Subtotal:</span>
                        <span>{formatCurrency(formData.totalAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-sm">Total:</span>
                        <span>{formatCurrency(formData.totalAmount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-6 text-center text-muted-foreground">
                  No items added yet. Click "Add Item" to add purchase items.
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">Payment History</h3>
                  <p className="text-xs text-muted-foreground">
                    Total: {formatCurrency(formData.totalAmount || 0)} • 
                    Paid: {formatCurrency(formData.paidAmount || 0)} • 
                    Balance: {formatCurrency((formData.totalAmount || 0) - (formData.paidAmount || 0))}
                  </p>
                </div>
              </div>

              {/* Add new payment form */}
              <div className="border rounded-md p-3 space-y-3">
                <h4 className="text-sm font-medium">Add Payment</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Payment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPayment.date && "text-muted-foreground"
                          )}
                          disabled={loading}
                        >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPayment.date ? format(newPayment.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newPayment.date}
                          onSelect={handlePaymentDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      name="amount"
                      value={newPayment.amount || ""}
                      onChange={handlePaymentChange}
                      disabled={loading}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={newPayment.method || "cash"}
                      onValueChange={(value) => handlePaymentSelectChange("method", value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      name="reference"
                      value={newPayment.reference || ""}
                      onChange={handlePaymentChange}
                      disabled={loading}
                      placeholder="Payment reference"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    name="notes"
                    value={newPayment.notes || ""}
                    onChange={handlePaymentChange}
                    disabled={loading}
                    placeholder="Payment notes"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={addPayment}
                    disabled={loading || !newPayment.amount || newPayment.amount <= 0}
                  >
                    Add Payment
                  </Button>
                </div>
              </div>

              {/* Payment list */}
              {formData.payments && formData.payments.length > 0 ? (
                <div className="space-y-3">
                  {formData.payments.map((payment, index) => (
                    <div key={payment.id} className="border rounded-md p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(payment.date, "MMM dd, yyyy")} • {payment.method} 
                          {payment.reference && ` • Ref: ${payment.reference}`}
                        </div>
                        {payment.notes && (
                          <div className="text-sm mt-1">{payment.notes}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(index)}
                        disabled={loading}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-6 text-center text-muted-foreground">
                  No payments recorded yet.
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
