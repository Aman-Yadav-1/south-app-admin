"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Plus, Filter, FileDown, FileUp, Truck } from "lucide-react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

import { InventoryStatsCards } from "./components/inventoryStats";
import { InventoryDataTable } from "./components/inventoryTable";
import { AddItemDialog } from "./components/addItemDialog";
import { EditItemDialog } from "./components/editItemDialog";
import { AdjustStockDialog } from "./components/adjustStockDialog";
import { FilterDialog } from "./components/filterDialog";
import { SupplierDialog } from "./components/supplierDialog";
import { HistoryDialog } from "./components/historyDialog";
import { ActiveFilters } from "./components/activeFilters";
import { DeleteConfirmDialog } from "./components/deleteConfirmDialog";
import { exportToCSV, importFromCSV } from "./components/csvUtils";
import {
  InventoryItem,
  InventoryHistory,
  Supplier,
  FilterData,
} from "./components/types";

const InventoryPage = () => {
  const params = useParams();
  const storeId = params.storeId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for inventory data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // State for selected item and history
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [itemHistory, setItemHistory] = useState<InventoryHistory[]>([]);

  // State for filters
  const [filterData, setFilterData] = useState<FilterData>({
    category: "all",
    supplier: "all",
    lowStock: false,
    expiringSoon: false,
    searchTerm: "",
  });

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, [storeId]);

  useEffect(() => {
    if (items.length > 0) {
      applyFilters();
      calculateStats();
    }
  }, [items, filterData]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const inventoryRef = collection(db, "stores", storeId, "inventory");
      const q = query(inventoryRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const inventoryItems: InventoryItem[] = [];
      const uniqueCategories = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.category) {
          uniqueCategories.add(data.category);
        }

        inventoryItems.push({
          id: doc.id,
          name: data.name,
          quantity: data.quantity,
          minQuantity: data.minQuantity || 0,
          unit: data.unit || "units",
          category: data.category || "Uncategorized",
          cost: data.cost || 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          supplier: data.supplier || "",
          expiryDate: data.expiryDate?.toDate(),
          location: data.location || "",
          sku: data.sku || "",
          notes: data.notes || "",
          tags: data.tags || [],
        });
      });

      setItems(inventoryItems);
      setFilteredItems(inventoryItems);
      setCategories(Array.from(uniqueCategories));
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const suppliersRef = collection(db, "stores", storeId, "suppliers");
      const q = query(suppliersRef, orderBy("name"));
      const querySnapshot = await getDocs(q);

      const suppliersList: Supplier[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        suppliersList.push({
          id: doc.id,
          name: data.name,
          contact: data.contact || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      });

      setSuppliers(suppliersList);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const totalItems = items.length;
    const lowStock = items.filter(
      (item) => item.quantity <= item.minQuantity
    ).length;
    const expiringSoon = items.filter(
      (item) => item.expiryDate && item.expiryDate <= thirtyDaysFromNow
    ).length;
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.cost,
      0
    );

    setStats({
      totalItems,
      lowStock,
      expiringSoon,
      totalValue,
    });
  };

  // Update the applyFilters function in page.tsx
  const applyFilters = () => {
    let filtered = [...items];

    // Apply category filter
    if (filterData.category && filterData.category !== "all") {
      filtered = filtered.filter(
        (item) => item.category === filterData.category
      );
    }

    // Apply supplier filter
    if (filterData.supplier && filterData.supplier !== "all") {
      filtered = filtered.filter(
        (item) => item.supplier === filterData.supplier
      );
    }

    // Apply low stock filter
    if (filterData.lowStock) {
      filtered = filtered.filter((item) => item.quantity <= item.minQuantity);
    }

    // Apply expiring soon filter
    if (filterData.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(
        (item) => item.expiryDate && item.expiryDate <= thirtyDaysFromNow
      );
    }

    // Apply search term filter
    if (filterData.searchTerm) {
      const searchLower = filterData.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower) ||
          item.notes?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredItems(filtered);
  };

  // Update the resetFilters function
  const resetFilters = () => {
    setFilterData({
      category: "all",
      supplier: "all",
      lowStock: false,
      expiringSoon: false,
      searchTerm: "",
    });
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromCSV(file, storeId, items, fetchInventory);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExport = () => {
    exportToCSV(items);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    // Optional: Add a small delay before resetting the current item
    setTimeout(() => {
      setCurrentItem(null);
    }, 300);
  };
  return (
    <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Inventory Management"
          description="Manage your store's inventory items"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFilterDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              onClick={handleFileImport}
              className="flex items-center gap-2"
            >
              <FileUp className="h-4 w-4" />
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSupplierDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Suppliers
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Stats Cards */}
      <InventoryStatsCards stats={stats} loading={loading} />

      {/* Active Filters */}
      <ActiveFilters filterData={filterData} onResetFilters={resetFilters} />

      {/* Data Table */}
      <InventoryDataTable
        data={filteredItems}
        loading={loading}
        onEdit={(item) => {
          setCurrentItem(item);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteClick} // Use the handler function
        onAdjustStock={(item) => {
          setCurrentItem(item);
          setIsAdjustDialogOpen(true);
        }}
        onViewHistory={(item) => {
          setCurrentItem(item);
          setIsHistoryDialogOpen(true);
        }}
      />

      {/* Dialogs */}
      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        storeId={storeId}
        categories={categories}
        suppliers={suppliers}
        onSuccess={fetchInventory}
      />

      <EditItemDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        storeId={storeId}
        item={currentItem}
        categories={categories}
        suppliers={suppliers}
        onSuccess={fetchInventory}
        onAdjustStock={() => {
          setIsEditDialogOpen(false);
          setIsAdjustDialogOpen(true);
        }}
        onViewHistory={() => {
          setIsEditDialogOpen(false);
          setIsHistoryDialogOpen(true);
        }}
      />

      <AdjustStockDialog
        isOpen={isAdjustDialogOpen}
        onClose={() => setIsAdjustDialogOpen(false)}
        storeId={storeId}
        item={currentItem}
        onSuccess={fetchInventory}
      />

      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        filterData={filterData}
        setFilterData={setFilterData}
        categories={categories}
        suppliers={suppliers.map((s) => s.name)}
        onResetFilters={resetFilters}
      />

      <SupplierDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        storeId={storeId}
        suppliers={suppliers}
        onSuccess={fetchSuppliers}
      />

      <HistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        storeId={storeId}
        item={currentItem}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        storeId={storeId}
        item={currentItem}
        onSuccess={fetchInventory}
      />
    </div>
  );
};

export default InventoryPage;
