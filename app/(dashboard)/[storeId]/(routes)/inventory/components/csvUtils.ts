import { InventoryItem } from "./types";
import Papa from 'papaparse';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";

// Export inventory items to CSV string
export const exportInventoryToCSV = (items: InventoryItem[]): string => {
  const data = items.map(item => ({
    Name: item.name,
    SKU: item.sku || '',
    Quantity: item.quantity,
    'Min Quantity': item.minQuantity,
    Unit: item.unit,
    Category: item.category,
    'Cost (₹)': item.cost,
    Supplier: item.supplier || '',
    Location: item.location || '',
    'Expiry Date': item.expiryDate ? item.expiryDate.toLocaleDateString() : '',
    Notes: item.notes || '',
    Tags: item.tags ? item.tags.join(', ') : '',
    'Last Updated': item.lastUpdated.toLocaleDateString()
  }));

  return Papa.unparse(data);
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Parse CSV file to inventory items
export const parseCSVToInventory = async (file: File): Promise<Partial<InventoryItem>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const items = results.data.map((row: any) => {
            // Convert CSV fields to inventory item properties
            return {
              name: row['Name'] || '',
              sku: row['SKU'] || '',
              quantity: parseFloat(row['Quantity']) || 0,
              minQuantity: parseFloat(row['Min Quantity']) || 0,
              unit: row['Unit'] || '',
              category: row['Category'] || 'Uncategorized',
              cost: parseFloat(row['Cost (₹)']) || 0,
              supplier: row['Supplier'] || '',
              location: row['Location'] || '',
              expiryDate: row['Expiry Date'] ? new Date(row['Expiry Date']) : undefined,
              notes: row['Notes'] || '',
              tags: row['Tags'] ? row['Tags'].split(',').map((tag: string) => tag.trim()) : []
            };
          });
          resolve(items);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Wrapper function to export items to CSV and download
export const exportToCSV = (items: InventoryItem[]): void => {
  const csvContent = exportInventoryToCSV(items);
  const filename = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Import CSV file and add/update items in the database
export const importFromCSV = async (
  file: File, 
  storeId: string, 
  existingItems: InventoryItem[],
  onSuccess: () => void
): Promise<void> => {
  try {
    const parsedItems = await parseCSVToInventory(file);
    
    let added = 0;
    let updated = 0;
    let errors = 0;
    
    // Create a map of existing items by name for quick lookup
    const existingItemMap = new Map<string, InventoryItem>();
    existingItems.forEach(item => {
      existingItemMap.set(item.name.toLowerCase(), item);
    });
    
    for (const item of parsedItems) {
      try {
        if (!item.name) {
          errors++;
          continue;
        }
        
        // Check if item already exists (by name)
        const existingItem = existingItemMap.get(item.name.toLowerCase());
        
        if (existingItem) {
          // Update existing item
          const itemRef = doc(db, "stores", storeId, "inventory", existingItem.id);
          await updateDoc(itemRef, {
            ...item,
            lastUpdated: serverTimestamp()
          });
          updated++;
        } else {
          // Add new item
          const inventoryRef = collection(db, "stores", storeId, "inventory");
          await addDoc(inventoryRef, {
            ...item,
            lastUpdated: serverTimestamp()
          });
          added++;
        }
      } catch (error) {
        console.error(`Error processing item: ${item.name}`, error);
        errors++;
      }
    }
    
    // Show summary toast
    if (added > 0 || updated > 0) {
      toast.success(
        `Import complete: ${added} items added, ${updated} items updated${errors > 0 ? `, ${errors} errors` : ''}`
      );
      onSuccess(); // Refresh the inventory list
    } else if (errors > 0) {
      toast.error(`Import failed: ${errors} errors`);
    } else {
      toast("No items were imported");
    }
  } catch (error) {
    console.error("CSV import error:", error);
    toast.error("Failed to import CSV file");
  }
};
