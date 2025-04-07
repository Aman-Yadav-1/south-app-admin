import { collection, doc, deleteDoc, getDocs, query, orderBy, serverTimestamp, addDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "./types";

// Fetch all suppliers for a store
export const fetchSuppliers = async (storeId: string): Promise<Supplier[]> => {
  const suppliersRef = collection(db, "stores", storeId, "suppliers");
  const q = query(suppliersRef, orderBy("name"));
  const querySnapshot = await getDocs(q);
  
  const suppliers: Supplier[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    suppliers.push({
      id: doc.id,
      name: data.name,
      contact: data.contact || "",
      email: data.email || "",
      phone: data.phone || ""
    });
  });
  
  return suppliers;
};

// Add a new supplier
export const addSupplier = async (storeId: string, supplierData: Partial<Supplier>): Promise<string> => {
  const suppliersRef = collection(db, "stores", storeId, "suppliers");
  
  const newSupplier = {
    ...supplierData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(suppliersRef, newSupplier);
  return docRef.id;
};

// Update an existing supplier
export const updateSupplier = async (storeId: string, supplierData: Partial<Supplier>): Promise<void> => {
  if (!supplierData.id) {
    throw new Error("Supplier ID is required for update");
  }
  
  const supplierRef = doc(db, "stores", storeId, "suppliers", supplierData.id);
  
  await updateDoc(supplierRef, {
    ...supplierData,
    updatedAt: serverTimestamp()
  });
};

// Delete a supplier
export const deleteSupplier = async (storeId: string, supplierId: string): Promise<void> => {
  await deleteDoc(doc(db, "stores", storeId, "suppliers", supplierId));
};

// Get a single supplier by ID
export const getSupplier = async (storeId: string, supplierId: string): Promise<Supplier | null> => {
  const supplierRef = doc(db, "stores", storeId, "suppliers", supplierId);
  const supplierDoc = await getDoc(supplierRef);
  
  if (!supplierDoc.exists()) {
    return null;
  }
  
  const data = supplierDoc.data();
  return {
    id: supplierDoc.id,
    name: data.name,
    contact: data.contact || "",
    email: data.email || "",
    phone: data.phone || ""
  };
};
