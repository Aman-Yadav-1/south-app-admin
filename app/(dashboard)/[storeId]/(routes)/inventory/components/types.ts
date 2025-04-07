export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    category: string;
    cost: number;
    supplier: string;
    expiryDate?: Date;
    location?: string;
    sku?: string;
    notes?: string;
    tags: string[];
    lastUpdated: Date;
  }
  
  export interface InventoryHistory {
    id: string;
    type: "create" | "update" | "adjustment";
    timestamp: Date;
    user?: string;
    quantityChange?: number;
    reason?: string;
    notes?: string;
    changes?: {
      [key: string]: {
        old?: any;
        new?: any;
      }
    };
  }
  
  export interface Supplier {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
  }
  
  export interface FilterData {
    category: string;
    supplier: string;
    lowStock: boolean;
    expiringSoon: boolean;
    searchTerm: string;
  }  
  
  export interface InventoryStats {
    totalItems: number;
    lowStock: number;
    expiringSoon: number;
    totalValue: number;
  }
  