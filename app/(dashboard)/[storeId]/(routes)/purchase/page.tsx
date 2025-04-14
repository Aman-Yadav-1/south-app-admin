"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { SupplierDialog } from "./components/supplierDialog";
import { Plus, Filter, FileDown, FileUp, Users } from "lucide-react";
import { PurchaseStatsCards } from "./components/purchaseStats";
import { PurchaseDataTable } from "./components/purchaseTable";
import { CreatePurchaseDialog } from "./components/createPurchaseDialog";
import { FilterDialog } from "./components/filterDialog";
import { ActiveFilters } from "./components/activeFilters";
import { ViewPurchaseDialog } from "./components/viewPurchaseDialog";
import { EditPurchaseDialog } from "./components/editPurchaseDialog";
import { DeleteConfirmDialog } from "./components/deleteConfirmDialog";
import { Purchase, Supplier, FilterData } from "./components/types";
import { format } from "date-fns";

const PurchasePage = () => {
  const params = useParams();
  const storeId = params.storeId as string;
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  // State for purchase data
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for selected purchase
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);

  // State for filters
  const [filterData, setFilterData] = useState<FilterData>({
    supplier: "all",
    status: "all",
    type: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
    searchTerm: "",
  });

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalPurchases: 0,
    pendingPayments: 0,
    totalAmount: 0,
    paidAmount: 0,
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, [storeId]);

  useEffect(() => {
    if (purchases.length > 0) {
      applyFilters();
      calculateStats();
    }
  }, [purchases, filterData]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const purchasesRef = collection(db, "stores", storeId, "purchases");
      const q = query(purchasesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const purchasesList: Purchase[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        purchasesList.push({
          id: doc.id,
          type: data.type || "purchase_order",
          number: data.number,
          supplier: data.supplier,
          date: data.date?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          status: data.status || "pending",
          notes: data.notes,
          payments: data.payments || [], // Add this line
        });
      });

      setPurchases(purchasesList);
      setFilteredPurchases(purchasesList);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
      toast.error("Failed to load purchase records");
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
    const totalPurchases = purchases.length;
    const pendingPayments = purchases.filter(
      (purchase) =>
        purchase.status === "pending" || purchase.status === "partial"
    ).length;
    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );
    const paidAmount = purchases.reduce(
      (sum, purchase) => sum + purchase.paidAmount,
      0
    );

    setStats({
      totalPurchases,
      pendingPayments,
      totalAmount,
      paidAmount,
    });
  };

  const applyFilters = () => {
    let filtered = [...purchases];

    // Apply supplier filter
    if (filterData.supplier && filterData.supplier !== "all") {
      filtered = filtered.filter(
        (purchase) => purchase.supplier === filterData.supplier
      );
    }

    // Apply status filter
    if (filterData.status && filterData.status !== "all") {
      filtered = filtered.filter(
        (purchase) => purchase.status === filterData.status
      );
    }

    // Apply type filter
    if (filterData.type && filterData.type !== "all") {
      filtered = filtered.filter(
        (purchase) => purchase.type === filterData.type
      );
    }

    // Apply date range filter
    if (filterData.dateRange.from) {
      filtered = filtered.filter(
        (purchase) => purchase.date >= filterData.dateRange.from!
      );
    }

    if (filterData.dateRange.to) {
      // Add one day to include the end date fully
      const endDate = new Date(filterData.dateRange.to);
      endDate.setDate(endDate.getDate() + 1);

      filtered = filtered.filter((purchase) => purchase.date < endDate);
    }

    // Apply search term filter
    if (filterData.searchTerm) {
      const searchLower = filterData.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (purchase) =>
          purchase.number.toLowerCase().includes(searchLower) ||
          purchase.supplier.toLowerCase().includes(searchLower) ||
          purchase.notes?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPurchases(filtered);
  };

  const resetFilters = () => {
    setFilterData({
      supplier: "all",
      status: "all",
      type: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
      searchTerm: "",
    });
  };

  const handleExport = () => {
    try {
      // Create a worksheet from the filtered purchases data
      const worksheet = utils.json_to_sheet(
        filteredPurchases.map((purchase) => ({
          "Purchase Number": purchase.number,
          Type: purchase.type,
          Supplier: purchase.supplier,
          Date: format(purchase.date, "yyyy-MM-dd"),
          "Due Date": purchase.dueDate
            ? format(purchase.dueDate, "yyyy-MM-dd")
            : "N/A",
          "Total Amount": purchase.totalAmount.toFixed(2),
          "Paid Amount": purchase.paidAmount.toFixed(2),
          Balance: (purchase.totalAmount - purchase.paidAmount).toFixed(2),
          Status: purchase.status,
          Notes: purchase.notes || "",
        }))
      );

      // Create a workbook and append the worksheet
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Purchases");

      // Generate Excel file
      const excelBuffer = write(workbook, { bookType: "xlsx", type: "array" });

      // Save the file
      const fileName = `purchases_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, fileName);

      toast.success("Purchases exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export purchases");
    }
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setIsViewDialogOpen(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setIsEditDialogOpen(true);
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <Heading
          title="Purchase Management"
          description="Manage your purchase orders and supplier transactions"
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
            onClick={() => setIsSupplierDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Suppliers
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Purchase
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Stats Cards */}
      <PurchaseStatsCards stats={stats} loading={loading} />

      {/* Active Filters */}
      <ActiveFilters filterData={filterData} onResetFilters={resetFilters} />

      {/* Data Table */}
      <PurchaseDataTable
        data={filteredPurchases}
        loading={loading}
        onView={handleViewPurchase}
        onEdit={handleEditPurchase}
        onDelete={handleDeletePurchase}
      />

      {/* Dialogs */}
      <CreatePurchaseDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        storeId={storeId}
        suppliers={suppliers}
        onSuccess={fetchPurchases}
      />
      <SupplierDialog
        isOpen={isSupplierDialogOpen}
        onClose={() => setIsSupplierDialogOpen(false)}
        storeId={storeId}
        suppliers={suppliers}
        onSuccess={fetchSuppliers}
      />
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        filterData={filterData}
        setFilterData={setFilterData}
        suppliers={suppliers.map((s) => s.name)}
        onResetFilters={resetFilters}
      />
      <ViewPurchaseDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        purchase={currentPurchase}
        onEdit={handleEditPurchase}
      />

      <EditPurchaseDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        storeId={storeId}
        purchase={currentPurchase}
        suppliers={suppliers}
        onSuccess={fetchPurchases}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        storeId={storeId}
        purchase={currentPurchase}
        onSuccess={fetchPurchases}
      />
    </div>
  );
};

export default PurchasePage;
