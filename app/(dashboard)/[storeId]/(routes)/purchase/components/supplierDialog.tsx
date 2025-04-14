"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash, Edit, Upload, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "./types";
import * as XLSX from 'xlsx';

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  suppliers: Supplier[];
  onSuccess: () => void;
}

export const SupplierDialog: React.FC<SupplierDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  suppliers,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const resetForm = () => {
    setNewSupplier({
      name: "",
      contact: "",
      email: "",
      phone: "",
    });
    setEditingSupplier(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setActiveTab("add");
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingSupplier) {
      setEditingSupplier({
        ...editingSupplier,
        [name]: value,
      });
    } else {
      setNewSupplier({
        ...newSupplier,
        [name]: value,
      });
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "stores", storeId, "suppliers"), {
        ...newSupplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Supplier added successfully");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!editingSupplier || !editingSupplier.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, "stores", storeId, "suppliers", editingSupplier.id), {
        name: editingSupplier.name,
        contact: editingSupplier.contact,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Supplier updated successfully");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, "stores", storeId, "suppliers", supplier.id));
      
      toast.success("Supplier deleted successfully");
      onSuccess();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setActiveTab("add");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setLoading(true);
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast.error("No data found in the Excel file");
          return;
        }

        // Validate data structure
        const firstRow = jsonData[0] as any;
        if (!firstRow.name) {
          toast.error("Excel file must have a 'name' column");
          return;
        }

        // Import suppliers
        const batch = writeBatch(db);
        let importCount = 0;
        
        for (const row of jsonData) {
          const supplierData = row as any;
          
          if (supplierData.name) {
            const docRef = doc(collection(db, "stores", storeId, "suppliers"));
            batch.set(docRef, {
              name: supplierData.name,
              contact: supplierData.contact || "",
              email: supplierData.email || "",
              phone: supplierData.phone || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            importCount++;
          }
        }

        await batch.commit();
        toast.success(`Successfully imported ${importCount} suppliers`);
        onSuccess();
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error importing suppliers:", error);
        toast.error("Failed to import suppliers");
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplateFile = () => {
    // Create template worksheet
    const template = [
      { name: "Supplier Name", contact: "Contact Person", email: "Email", phone: "Phone" }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    
    // Generate and download file
    XLSX.writeFile(workbook, "supplier_import_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg !bg-white dark:!bg-slate-950 border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Manage Suppliers</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="add">
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </TabsTrigger>
            <TabsTrigger value="list">Supplier List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4 py-2">
            <div className="space-y-4 rounded-md border p-4 !bg-white dark:!bg-slate-900">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Supplier name"
                    value={editingSupplier ? editingSupplier.name : newSupplier.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="!bg-white dark:!bg-slate-800"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contact" className="text-sm font-medium">
                    Contact Person
                  </Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="Contact person name"
                    value={editingSupplier ? editingSupplier.contact : newSupplier.contact}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="!bg-white dark:!bg-slate-800"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={editingSupplier ? editingSupplier.email : newSupplier.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="!bg-white dark:!bg-slate-800"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Phone number"
                      value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="!bg-white dark:!bg-slate-800"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                {editingSupplier && (
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
                  disabled={loading}
                  className="gap-1"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingSupplier ? "Update Supplier" : "Add Supplier"}
                </Button>
              </div>
            </div>
            
            <div className="rounded-md border p-4 !bg-white dark:!bg-slate-900">
              <h3 className="text-sm font-medium mb-3">Import Suppliers</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Import multiple suppliers from an Excel file. The file should have columns for name, contact, email, and phone.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadTemplateFile}
                    className="gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx,.xls"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={loading}
                      className="w-full gap-1"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload Excel File
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {suppliers.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center !bg-white dark:!bg-slate-900">
                  <p className="text-muted-foreground">No suppliers found. Add your first supplier.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between p-3 rounded-md border !bg-white dark:!bg-slate-900 hover:bg-accent/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2">
                          {supplier.contact && (
                            <span>{supplier.contact}</span>
                          )}
                          {supplier.phone && (
                            <span>{supplier.phone}</span>
                          )}
                          {supplier.email && (
                            <span className="text-primary/80">{supplier.email}</span>
                          )}
                          {!supplier.contact && !supplier.phone && !supplier.email && (
                            <span>No contact info</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSupplier(supplier)}
                          disabled={loading}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSupplier(supplier)}
                          disabled={loading}
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between border-t pt-4 mt-2">
          <div className="text-xs text-muted-foreground">
            {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} total
          </div>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
};
