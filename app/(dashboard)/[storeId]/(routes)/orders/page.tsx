import { format } from "date-fns";
import { OrderClient } from "./_components/client";
import { OrderColumn } from "./_components/columns";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, orderBy, query } from "firebase/firestore";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for better UX
const OrdersLoading = () => (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-[450px] w-full mt-6" />
    </div>
  </div>
);

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    // Fetch all orders for this store, not filtered by user
    const ordersQuery = query(
      collection(doc(db, "stores", params.storeId), "orders"),
      orderBy("createdAt", "desc") // Sort by newest first
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    const formattedOrders: OrderColumn[] = ordersSnapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Calculate total from order items
      const total = data.orderItems?.reduce((acc: number, item: any) => {
        return acc + (parseFloat(item.price) * item.quantity);
      }, 0) || 0;
      
      return {
        id: doc.id,
        phone: data.phone || "N/A",
        address: data.address || "N/A",
        isPaid: data.isPaid || false,
        totalPrice: `₹${total.toFixed(2)}`,
        products: data.orderItems?.map((item: any) => item.name).join(", ") || "No products",
        createdAt: data.createdAt ? format(data.createdAt.toDate(), "MMM dd, yyyy") : "Unknown",
        customerName: data.customerName || "Guest Customer",
        order_status: data.order_status || "Pending",
      };
    });

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <OrderClient data={formattedOrders} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading orders:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="bg-destructive/15 p-4 rounded-md">
            <p className="text-destructive font-medium">Error loading orders. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }
};

// Wrap with Suspense for better loading experience
const OrdersPageWithSuspense = ({ params }: { params: { storeId: string } }) => (
  <Suspense fallback={<OrdersLoading />}>
    <OrdersPage params={params} />
  </Suspense>
);

export default OrdersPageWithSuspense;
