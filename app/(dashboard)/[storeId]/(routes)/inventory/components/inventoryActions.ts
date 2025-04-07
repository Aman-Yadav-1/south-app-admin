import { collection, doc, deleteDoc, getDocs, query, where, orderBy, serverTimestamp, addDoc, updateDoc, getDoc, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InventoryItem, InventoryHistory, InventoryStats } from "./types";

// Fetch all inventory items for a store
export const fetchInventory = async (storeId: string): Promise<InventoryItem[]> => {
  const inventoryRef = collection(db, "stores", storeId, "inventory");
  const q = query(inventoryRef, orderBy("name"));
  const querySnapshot = await getDocs(q);
  
  const inventoryItems: InventoryItem[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    inventoryItems.push({
      id: doc.id,
      name: data.name,
      quantity: data.quantity,
      minQuantity: data.minQuantity || 0,
      unit: data.unit || "units",
      category: data.category || "Uncategorized",
      cost: data.cost || 0,
      supplier: data.supplier || "",
      expiryDate: data.expiryDate?.toDate(),
      location: data.location || "",
      sku: data.sku || "",
      notes: data.notes || "",
      tags: data.tags || [],
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    });
  });
  
  return inventoryItems;
};

// Add a new inventory item
export const addInventoryItem = async (storeId: string, itemData: Partial<InventoryItem>): Promise<string> => {
  const inventoryRef = collection(db, "stores", storeId, "inventory");
  
  const newItem = {
    ...itemData,
    lastUpdated: serverTimestamp()
  };
  
  const docRef = await addDoc(inventoryRef, newItem);
  
  // Record history
  await addInventoryHistory(storeId, docRef.id, {
    type: "create",
    timestamp: new Date(),
    notes: "Item created"
  });
  
  return docRef.id;
};

// Update an existing inventory item
export const updateInventoryItem = async (storeId: string, itemId: string, itemData: Partial<InventoryItem>): Promise<void> => {
  const itemRef = doc(db, "stores", storeId, "inventory", itemId);
  
  // Get the current item data to compare changes
  const currentDoc = await getDoc(itemRef);
  const currentData = currentDoc.data();
  
  const changes: Record<string, { old?: any, new?: any }> = {};
  
  // Compare and record changes
  if (currentData) {
    Object.keys(itemData).forEach(key => {
      const typedKey = key as keyof typeof itemData;
      if (itemData[typedKey] !== undefined && 
          JSON.stringify(currentData[key]) !== JSON.stringify(itemData[typedKey])) {
        changes[key] = {
          old: currentData[key],
          new: itemData[typedKey]
        };
      }
    });
  }
  
  // Update the item
  await updateDoc(itemRef, {
    ...itemData,
    lastUpdated: serverTimestamp()
  });
  
  // Record history if there are changes
  if (Object.keys(changes).length > 0) {
    await addInventoryHistory(storeId, itemId, {
      type: "update",
      timestamp: new Date(),
      changes
    });
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (storeId: string, itemId: string): Promise<void> => {
  await deleteDoc(doc(db, "stores", storeId, "inventory", itemId));
};

// Adjust inventory stock level
export const adjustInventoryStock = async (
  storeId: string, 
  itemId: string, 
  quantityChange: number,
  reason: string,
  notes?: string
): Promise<void> => {
  const itemRef = doc(db, "stores", storeId, "inventory", itemId);
  const itemDoc = await getDoc(itemRef);
  
  if (!itemDoc.exists()) {
    throw new Error("Item not found");
  }
  
  const currentData = itemDoc.data();
  const currentQuantity = currentData.quantity || 0;
  const newQuantity = currentQuantity + quantityChange;
  
  // Prevent negative quantity
  if (newQuantity < 0) {
    throw new Error("Cannot reduce stock below zero");
  }
  
  // Update the quantity
  await updateDoc(itemRef, {
    quantity: newQuantity,
    lastUpdated: serverTimestamp()
  });
  
  // Record history
  await addInventoryHistory(storeId, itemId, {
    type: "adjustment",
    timestamp: new Date(),
    quantityChange,
    reason,
    notes,
    changes: {
      quantity: {
        old: currentQuantity,
        new: newQuantity
      }
    }
  });
};

// Add inventory history record
export const addInventoryHistory = async (
  storeId: string, 
  itemId: string, 
  historyData: Partial<InventoryHistory>
): Promise<string> => {
  const historyRef = collection(db, "stores", storeId, "inventory", itemId, "history");
  
  const docRef = await addDoc(historyRef, {
    ...historyData,
    timestamp: serverTimestamp()
  });
  
  return docRef.id;
};

// Get inventory history for an item
export const getInventoryHistory = async (storeId: string, itemId: string): Promise<InventoryHistory[]> => {
  const historyRef = collection(db, "stores", storeId, "inventory", itemId, "history");
  const q = query(historyRef, orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  
  const history: InventoryHistory[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    history.push({
      id: doc.id,
      type: data.type,
      timestamp: data.timestamp?.toDate() || new Date(),
      user: data.user,
      quantityChange: data.quantityChange,
      reason: data.reason,
      notes: data.notes,
      changes: data.changes
    });
  });
  
  return history;
};

// Fetch inventory statistics
export const fetchInventoryStats = async (storeId: string): Promise<InventoryStats> => {
  const inventoryRef = collection(db, "stores", storeId, "inventory");
  const querySnapshot = await getDocs(inventoryRef);
  
  let totalItems = 0;
  let lowStock = 0;
  let expiringSoon = 0;
  let totalValue = 0;
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  querySnapshot.forEach((doc) => {
    const item = doc.data();
    totalItems++;
    
    // Calculate total value
    totalValue += (item.quantity || 0) * (item.cost || 0);
    
    // Check for low stock
    if ((item.quantity || 0) <= (item.minQuantity || 0)) {
      lowStock++;
    }
    
    // Check for expiring soon
    if (item.expiryDate && item.expiryDate.toDate() <= thirtyDaysFromNow) {
      expiringSoon++;
    }
  });
  
  return {
    totalItems,
    lowStock,
    expiringSoon,
    totalValue
  };
};

// Fetch unique categories
export const fetchCategories = async (storeId: string): Promise<string[]> => {
  const inventoryRef = collection(db, "stores", storeId, "inventory");
  const querySnapshot = await getDocs(inventoryRef);
  
  const categories = new Set<string>();
  querySnapshot.forEach((doc) => {
    const category = doc.data().category;
    if (category) {
      categories.add(category);
    }
  });
  
  return Array.from(categories).sort();
};

// Fetch suppliers
export const fetchSuppliers = async (storeId: string): Promise<{ id: string, name: string }[]> => {
  const suppliersRef = collection(db, "stores", storeId, "suppliers");
  const querySnapshot = await getDocs(suppliersRef);
  
  const suppliers: { id: string, name: string }[] = [];
  querySnapshot.forEach((doc) => {
    suppliers.push({
      id: doc.id,
      name: doc.data().name
    });
  });
  
  return suppliers.sort((a, b) => a.name.localeCompare(b.name));
};

// Bulk import inventory items
export const bulkImportInventory = async (
  storeId: string, 
  items: Partial<InventoryItem>[]
): Promise<number> => {
  let successCount = 0;
  
  for (const item of items) {
    try {
      await addInventoryItem(storeId, item);
      successCount++;
    } catch (error) {
      console.error(`Failed to import item: ${item.name}`, error);
    }
  }
  
  return successCount;
};
