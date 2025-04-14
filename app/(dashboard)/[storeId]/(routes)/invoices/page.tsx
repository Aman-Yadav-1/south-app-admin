"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pdf } from "@react-pdf/renderer";
import { FiDownload } from "react-icons/fi";
import { InvoicePDF, formatCurrency } from "./pdfGenerator";
import { toast } from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, doc, query, orderBy } from "firebase/firestore";
import { useParams } from "next/navigation";

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

interface InvoiceItem {
  name: string;
  qty: number;
  price: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

const InvoicePage = () => {
  const params = useParams();
  const storeId = params.storeId as string;

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paymentMode, setPaymentMode] = useState("Online");
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsQuery = query(
        collection(doc(db, "stores", storeId), "products"),
        orderBy("name")
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productsList: Product[] = [];
      
      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        productsList.push({
          id: doc.id,
          name: data.name,
          price: data.price || 0,
          category: data.category
        });
      });
      
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, price: "" }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];

    if (field === "price") {
      // Only allow numbers and decimal point for price
      const validatedValue = value.replace(/[^0-9.]/g, "");
      // Prevent multiple decimal points
      const parts = validatedValue.split(".");
      const formattedValue =
        parts.length > 1
          ? `${parts[0]}.${parts.slice(1).join("")}`
          : validatedValue;

      updatedItems[index][field] = formattedValue;
    } else if (field === "qty") {
      // Only allow positive integers for quantity
      const numValue = parseInt(value);
      updatedItems[index][field] =
        isNaN(numValue) || numValue < 1 ? 1 : numValue;
    } else {
      updatedItems[index][field] = value as never;
    }

    setItems(updatedItems);
  };

  const calculateTotal = () =>
    items.reduce(
      (total, item) => total + item.qty * parseFloat(String(item.price || "0")),
      0
    );

  // Download PDF Function
  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(
        <InvoicePDF
          customerName={customerName}
          paymentMode={paymentMode}
          invoiceNumber={invoiceNumber}
          items={items}
          calculateTotal={calculateTotal}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceNumber || "new"}.pdf`;
      link.click();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleSaveInvoice = async () => {
    if (!customerName) {
      toast.error("Please enter a customer name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (items.some((item) => !item.name || !item.price)) {
      toast.error("Please complete all item details");
      return;
    }

    try {
      // Save invoice to Firestore
      await addDoc(collection(db, "stores", storeId, "invoices"), {
        customerName,
        invoiceNumber,
        paymentMode,
        items,
        total: calculateTotal(),
        createdAt: serverTimestamp(),
      });

      toast.success("Invoice saved successfully");

      // Reset form for a new invoice
      setItems([]);
      setCustomerName("");
      setInvoiceNumber(generateInvoiceNumber());
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Heading
        title="Invoice"
        description="Create and manage invoices with ease."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-1/2"
              />
              <Input
                placeholder="Invoice Number"
                value={invoiceNumber}
                readOnly
                className="w-1/2 bg-gray-100"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Payment Mode:</label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Select 
                    value={item.name || ""} 
                    onValueChange={(value) => {
                      const product = products.find(p => p.name === value);
                      if (product) {
                        const updatedItems = [...items];
                        updatedItems[index] = {
                          name: product.name,
                          qty: 1,
                          price: product.price.toString()
                        };
                        setItems(updatedItems);
                      } else {
                        updateItem(index, "name", value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name} - {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Item</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={item.qty}
                    min="1"
                    onChange={(e) => updateItem(index, "qty", e.target.value)}
                    className="w-1/6"
                  />
                  <Input
                    type="text"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    onBlur={() => {
                      // Format price on blur to ensure it's a valid number
                      const updatedItems = [...items];
                      const price = updatedItems[index].price;
                      if (price) {
                        const numPrice = parseFloat(price);
                        if (!isNaN(numPrice)) {
                          updatedItems[index].price = numPrice.toString();
                          setItems(updatedItems);
                        }
                      }
                    }}
                    className="w-1/6"
                  />
                  <div className="w-1/6 text-right font-medium">
                    {formatCurrency(item.qty * parseFloat(item.price || "0"))}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addItem}>
              Add Item
            </Button>

            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-lg font-bold">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4">
        <div className="inline-flex items-center overflow-hidden rounded-md border">
          <Button
            onClick={handleSaveInvoice}
            className="px-4 h-10 rounded-none"
            variant="default"
          >
            Save Invoice
          </Button>

          <div className="h-full w-px bg-border"></div>

          <Button
            onClick={handleDownloadPDF}
            className="px-3 h-10 rounded-none"
            variant="default"
          >
            <FiDownload className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
