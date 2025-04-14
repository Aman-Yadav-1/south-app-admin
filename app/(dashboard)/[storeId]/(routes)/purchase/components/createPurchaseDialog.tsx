"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Supplier, PurchaseItem } from "./types";

interface CreatePurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  suppliers: Supplier[];
  onSuccess: () => void;
}

export const CreatePurchaseDialog: React.FC<CreatePurchaseDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  suppliers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    type: "purchase_order",
    number: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier: "",
    date: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [] as PurchaseItem[],
    totalAmount: 0,
    paidAmount: 0,
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    } else {
      resetForm();
    }
  }, [isOpen, storeId]);

  useEffect(() => {
    calculateTotal();
  }, [formData.items]);

  const fetchInventoryItems = async () => {
    try {
      const inventoryRef = collection(db, "stores", storeId, "inventory");
      const inventorySnapshot = await getDocs(inventoryRef);
      
      const items: any[] = [];
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name,
          unit: data.unit || "units",
          cost: data.cost || 0,
        });
      });
      
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "purchase_order",
      number: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: "",
      date: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [],
      totalAmount: 0,
      paidAmount: 0,
      status: "pending",
      notes: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Generate appropriate number based on type
    if (name === "type") {
      let prefix = "PO";
      if (value === "credit_note") prefix = "CN";
      if (value === "debit_note") prefix = "DN";
      
      setFormData(prev => ({
        ...prev,
        number: `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      }));
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        [name]: date,
      });
    }
  };

  const addItem = () => {
    const newItem: PurchaseItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit: "units",
      price: 0,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id),
    });
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If it's a field that affects calculation, update the totals
        if (field === "quantity" || field === "price" || field === "tax" || field === "discount") {
          const quantity = field === "quantity" ? parseFloat(value) || 0 : item.quantity;
          const price = field === "price" ? parseFloat(value) || 0 : item.price;
          const tax = field === "tax" ? parseFloat(value) || 0 : (item.tax || 0);
          const discount = field === "discount" ? parseFloat(value) || 0 : (item.discount || 0);
          
          const subtotal = quantity * price;
          const taxAmount = subtotal * (tax / 100);
          const discountAmount = subtotal * (discount / 100);
          const total = subtotal + taxAmount - discountAmount;
          
          return {
            ...updatedItem,
            subtotal,
            total
          };
        }
        
        // If the name field is changed and it's an inventory item, update related fields
        if (field === "name") {
          const selectedItem = inventoryItems.find(invItem => invItem.id === value);
          if (selectedItem) {
            return {
              ...updatedItem,
              unit: selectedItem.unit,
              price: selectedItem.cost,
              subtotal: item.quantity * selectedItem.cost,
              total: (item.quantity * selectedItem.cost) + 
                    ((item.quantity * selectedItem.cost) * ((item.tax || 0) / 100)) - 
                    ((item.quantity * selectedItem.cost) * ((item.discount || 0) / 100))
            };
          }
        }
        
        return updatedItem;
      }
      return item;
    });

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const calculateTotal = () => {
    const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);
    
    setFormData(prev => ({
      ...prev,
      totalAmount
    }));
  };

  const handleSubmit = async () => {
    if (!formData.supplier) {
      toast.error("Please select a supplier");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      setLoading(true);
      
      const purchaseData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const purchasesRef = collection(db, "stores", storeId, "purchases");
      await addDoc(purchasesRef, purchaseData);
      
      toast.success("Purchase created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating purchase:", error);
      toast.error("Failed to create purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[800px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Create New Purchase
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new purchase order, credit note, or debit note
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        {/* Tabs for Form Sections */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-muted/30 p-1">
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "details" 
                  ? "bg-white dark:bg-slate-800 shadow-sm" 
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Purchase Details
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "items" 
                  ? "bg-white dark:bg-slate-800 shadow-sm" 
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveTab("items")}
            >
              Items & Pricing
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "notes" 
                  ? "bg-white dark:bg-slate-800 shadow-sm" 
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => setActiveTab("notes")}
            >
              Notes & Summary
            </button>
          </div>
        </div>
        
        {/* Purchase Details Tab */}
        <div className={activeTab === "details" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                Document Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger className="w-full transition-all hover:border-primary focus:border-primary">
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
              <Label htmlFor="number" className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                Document Number
              </Label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="w-full transition-all hover:border-primary focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier" className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Supplier
              </Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => handleSelectChange("supplier", value)}
              >
                <SelectTrigger className="w-full transition-all hover:border-primary focus:border-primary">
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
              <Label className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal transition-all hover:border-primary focus:border-primary"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formData.date ? format(formData.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <Label className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal transition-all hover:border-primary focus:border-primary"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleDateChange("dueDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-full transition-all hover:border-primary focus:border-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="partial">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      Partially Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => setActiveTab("items")}
              className="bg-primary hover:bg-primary/90"
            >
              Next: Add Items
            </Button>
          </div>
        </div>
        
        {/* Items Tab */}
<div className={activeTab === "items" ? "block" : "hidden"}>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <ShoppingBag className="h-5 w-5 text-primary" />
      Items
    </h3>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={addItem}
      className="flex items-center gap-1 border-dashed transition-all hover:border-primary hover:text-primary"
    >
      <Plus className="h-4 w-4" /> Add Item
    </Button>
  </div>
  
  {formData.items.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-md bg-muted/10">
      <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-muted-foreground font-medium">No items added yet</p>
      <p className="text-sm text-muted-foreground/70 mt-1">Click "Add Item" to add items to this purchase</p>
    </div>
  ) : (
    <div className="space-y-6">
      {/* Items Container - Card Style Layout */}
      <div className="space-y-4">
        {formData.items.map((item, index) => (
          <div 
            key={item.id} 
            className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-all"
          >
            {/* Item Header */}
            <div className="bg-muted/20 px-4 py-2 flex justify-between items-center">
              <h4 className="font-medium flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Item #{index + 1}
                {inventoryItems.find(inv => inv.id === item.name)?.name && (
                  <span className="text-sm text-muted-foreground">
                    - {inventoryItems.find(inv => inv.id === item.name)?.name}
                  </span>
                )}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Item Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column - Item and Quantity */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`item-name-${index}`} className="text-sm font-medium">
                      Item
                    </Label>
                    <Select
                      value={item.name}
                      onValueChange={(value) => handleItemChange(item.id, "name", value)}
                    >
                      <SelectTrigger className="w-full bg-background transition-all hover:border-primary focus:border-primary">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-quantity-${index}`} className="text-sm font-medium">
                        Quantity
                      </Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value))}
                        className="bg-background transition-all hover:border-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-unit-${index}`} className="text-sm font-medium">
                        Unit
                      </Label>
                      <Input
                        id={`item-unit-${index}`}
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                        className="bg-background transition-all hover:border-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Middle Column - Price and Calculations */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`item-price-${index}`} className="text-sm font-medium">
                      Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value))}
                        className="pl-7 bg-background transition-all hover:border-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-tax-${index}`} className="text-sm font-medium">
                        Tax %
                      </Label>
                      <div className="relative">
                        <Input
                          id={`item-tax-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.tax || 0}
                          onChange={(e) => handleItemChange(item.id, "tax", parseFloat(e.target.value))}
                          className="pr-6 bg-background transition-all hover:border-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-discount-${index}`} className="text-sm font-medium">
                        Discount %
                      </Label>
                      <div className="relative">
                        <Input
                          id={`item-discount-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount || 0}
                          onChange={(e) => handleItemChange(item.id, "discount", parseFloat(e.target.value))}
                          className="pr-6 bg-background transition-all hover:border-primary focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Calculations Summary */}
                <div className="bg-muted/10 rounded-lg p-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tax ({item.tax || 0}%):</span>
                      <span>₹{((item.quantity * item.price) * ((item.tax || 0) / 100)).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Discount ({item.discount || 0}%):</span>
                      <span>₹{((item.quantity * item.price) * ((item.discount || 0) / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-primary">₹{item.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Summary */}
      <div className="bg-primary/5 rounded-lg p-4 border mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Items: <span className="font-medium text-foreground">{formData.items.length}</span></p>
            <p className="text-sm text-muted-foreground mt-1">Total Quantity: <span className="font-medium text-foreground">{formData.items.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Amount:</p>
            <p className="font-bold text-lg">₹{formData.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )}
  
  <div className="mt-6 flex justify-between">
    <Button 
      variant="outline"
      onClick={() => setActiveTab("details")}
    >
      Back
    </Button>
    <Button 
      onClick={() => setActiveTab("notes")}
      className="bg-primary hover:bg-primary/90"
      disabled={formData.items.length === 0}
    >
      {formData.items.length === 0 ? "Add Items to Continue" : "Next: Notes & Summary"}
    </Button>
  </div>
</div>

      
      {/* Notes & Summary Tab */}
      <div className={activeTab === "notes" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes or terms..."
              rows={5}
              className="resize-none transition-all hover:border-primary focus:border-primary"
            />
          </div>
          
          {/* Summary Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Order Summary
            </h3>
            <div className="bg-primary/5 rounded-lg p-4 border">
              <div className="space-y-4">
                {/* Summary Header */}
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-semibold text-sm">Item</span>
                  <span className="font-semibold text-sm">Amount</span>
                </div>
                
                {/* Summary Items */}
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[70%]">
                        {inventoryItems.find(inv => inv.id === item.name)?.name || "Item"} 
                        <span className="text-xs"> × {item.quantity}</span>
                      </span>
                      <span>₹{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Summary Calculations */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{formData.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>₹{formData.items.reduce((sum, item) => sum + (item.subtotal * ((item.tax || 0) / 100)), 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>₹{formData.items.reduce((sum, item) => sum + (item.subtotal * ((item.discount || 0) / 100)), 0).toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">₹{formData.totalAmount.toFixed(2)}</span>
                </div>
                
                {/* Status Badge */}
                <div className="pt-2 flex justify-end">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500' :
                    formData.status === 'partial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                    formData.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                  }`}>
                    {formData.status === 'pending' ? 'Pending' :
                     formData.status === 'partial' ? 'Partially Paid' :
                     formData.status === 'paid' ? 'Paid' : 'Cancelled'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setActiveTab("items")}
          >
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Creating...
              </>
            ) : (
              "Create Purchase"
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

};