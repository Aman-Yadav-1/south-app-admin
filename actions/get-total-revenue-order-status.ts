import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getOrderStatusTotalRevenue = async (storeId: string, startDate?: Timestamp, endDate?: Timestamp) => {
  try {
    // Get orders with date filter if provided
    let ordersQuery;
    
    if (startDate && endDate) {
      ordersQuery = query(
        collection(doc(db, "stores", storeId), "orders"),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate)
      );
    } else {
      ordersQuery = collection(doc(db, "stores", storeId), "orders");
    }
    
    const ordersData = (
      await getDocs(ordersQuery)
    ).docs.map((doc) => doc.data()) as Order[];

    const statusRevenue: { [key: string]: number } = {};

    for (const order of ordersData) {
      const status = order.order_status;

      if (status) {
        let revenueForOrder = 0;

        for (const item of order.orderItems) {
          if (item.qty !== undefined) {
            revenueForOrder += item.price * item.qty;
          } else {
            revenueForOrder += item.price;
          }
        }

        statusRevenue[status] = (statusRevenue[status] || 0) + revenueForOrder;
      }
    }

    // Create a map to convert status names to numeric representation
    const statusMap: { [key: string]: number } = {
      Processing: 0,
      Delivering: 1,
      Delivered: 2,
      Canceled: 3,
    };

    // Update graphData using the status map
    const graphData: GraphData[] = Object.keys(statusMap).map((statusName) => ({
      name: statusName,
      total: statusRevenue[statusName] || 0,
    }));

    return graphData;
  } catch (error) {
    console.error("Error getting revenue by order status:", error);
    return [];
  }
};
