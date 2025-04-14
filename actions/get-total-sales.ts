import { db } from "@/lib/firebase"
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore"

export const getTotalSales = async (storeId: string, startDate?: Timestamp, endDate?: Timestamp) => {
  try {
    let ordersQuery;
    
    if (startDate && endDate) {
      // Apply date filtering
      ordersQuery = query(
        collection(doc(db, "stores", storeId), "orders"),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate)
      );
    } else {
      // No date filtering - get all orders
      ordersQuery = collection(doc(db, "stores", storeId), "orders");
    }
    
    const ordersData = await getDocs(ordersQuery);
    const count = ordersData.size;

    return count;
  } catch (error) {
    console.error("Error getting total sales:", error);
    return 0;
  }
}
