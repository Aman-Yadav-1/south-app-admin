import { Timestamp } from "firebase/firestore";

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
}

export interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: string;
  reference: string;
  notes?: string;
}

export interface Purchase {
  id: string;
  type: "purchase_order" | "credit_note" | "debit_note";
  number: string;
  supplier: string;
  date: Date;
  dueDate?: Date;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  status: "pending" | "partial" | "paid" | "cancelled";
  notes?: string;
  attachments?: string[];
  payments: Payment[];
  createdAt?: Date; // Add these properties
  updatedAt?: Date;
}



export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export interface FilterData {
  supplier: string;
  status: string;
  type: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  searchTerm: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  category: string;
  subcategory?: string; // Added subcategory
  cost: number;
  lastUpdated: Date;
  supplier: string;
  expiryDate?: Date;
  location?: string;
  sku?: string;
  notes?: string;
  tags: string[];
  // Optional fields
  brand?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive?: boolean;
}
