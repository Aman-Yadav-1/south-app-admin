import { db } from "@/lib/firebase"
import { Order } from "@/types-db"
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore"

export async function getTotalRevenue(storeId: string, startDate?: Timestamp, endDate?: Timestamp) {
    try {
      let ordersQuery;
      
      if (startDate && endDate) {
        // Apply date filtering
        ordersQuery = query(
          collection(doc(db, "stores", storeId), "orders"),
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate)
        );
        
        // Note: We removed the isPaid filter to get all orders
      } else {
        // No date filtering
        ordersQuery = collection(doc(db, "stores", storeId), "orders");
      }
      
      const orders = await getDocs(ordersQuery);
      
      const totalRevenue = orders.docs.reduce((total, order) => {
        const orderData = order.data() as Order;
        
        // Calculate total for this order
        const orderTotal = orderData.orderItems?.reduce((orderSum, item) => {
          if (item && item.qty !== undefined) {
            return orderSum + Number(item.price * item.qty);
          }
          return orderSum;
        }, 0) || 0;
        
        return total + orderTotal;
      }, 0);
      
      console.log("Total revenue calculated:", totalRevenue);
      return totalRevenue;
    } catch (error) {
      console.error("Error getting total revenue:", error);
      return 0;
    }
  }
  