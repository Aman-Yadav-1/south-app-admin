import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Trash2, Edit } from "lucide-react";
import { AlertModal } from "@/components/Modal/alert-modal";
import { addSupplier, updateSupplier, deleteSupplier } from "./supplierActions";
import { Supplier } from "./types";

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
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [supplierForm, setSupplierForm] = useState({
    id: "",
    name: "",
    contact: "",
    email: "",
    phone: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const resetForm = () => {
    setSupplierForm({
      id: "",
      name: "",
      contact: "",
      email: "",
      phone: ""
    });
    setIsEditing(false);
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierForm({
      ...supplierForm,
      [name]: value
    });
  };

  const handleAddSupplier = async () => {
    try {
      setLoading(true);
      
      if (isEditing) {
        await updateSupplier(storeId, supplierForm);
        toast.success("Supplier updated successfully");
      } else {
        await addSupplier(storeId, supplierForm);
        toast.success("Supplier added successfully");
      }
      
      onSuccess();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error with supplier:", error);
      toast.error(isEditing ? "Failed to update supplier" : "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierForm({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone
    });
    setIsEditing(true);
    setActiveTab("add");
  };

  const handleDeleteClick = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setDeleteModalOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    try {
      setLoading(true);
      await deleteSupplier(storeId, supplierToDelete);
      toast.success("Supplier deleted successfully");
      onSuccess();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSupplier}
        loading={loading}
      />
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">Supplier Management</DialogTitle>
            <DialogDescription>
              Manage your inventory suppliers
            </DialogDescription>
          </DialogHeader>
          
          <Separator className="my-4" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="list">Supplier List</TabsTrigger>
              <TabsTrigger value="add" onClick={resetForm}>
                {isEditing ? "Edit Supplier" : "Add Supplier"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              {suppliers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No suppliers found. Add your first supplier.
                </div>
              ) : (
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div 
                      key={supplier.id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <h4 className="font-medium">{supplier.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {supplier.contact && <div>{supplier.contact}</div>}
                          {supplier.email && <div>{supplier.email}</div>}
                          {supplier.phone && <div>{supplier.phone}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteClick(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name" className="font-medium">Supplier Name *</Label>
                  <Input
                    id="supplier-name"
                    name="name"
                    value={supplierForm.name}
                    onChange={handleSupplierChange}
                    placeholder="Supplier name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier-contact" className="font-medium">Contact Person</Label>
                  <Input
                    id="supplier-contact"
                    name="contact"
                    value={supplierForm.contact}
                    onChange={handleSupplierChange}
                    placeholder="Contact person name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier-email" className="font-medium">Email</Label>
                  <Input
                    id="supplier-email"
                    name="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={handleSupplierChange}
                    placeholder="Email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supplier-phone" className="font-medium">Phone</Label>
                  <Input
                    id="supplier-phone"
                    name="phone"
                    value={supplierForm.phone}
                    onChange={handleSupplierChange}
                    placeholder="Phone number"
                  />
                </div>
                
                <Button 
                  onClick={handleAddSupplier} 
                  disabled={loading || !supplierForm.name}
                  className="w-full mt-4"
                >
                                    {loading 
                    ? "Saving..." 
                    : isEditing 
                      ? "Update Supplier" 
                      : "Add Supplier"
                  }
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-4" />
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="mt-2 sm:mt-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

