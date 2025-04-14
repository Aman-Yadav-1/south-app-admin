import { db } from "@/lib/firebase";
import { Order } from "@/types-db";
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphTotalRevenue = async (storeId: string, startDate?: Timestamp, endDate?: Timestamp) => {
  try {
    let ordersQuery;
    
    if (startDate && endDate) {
      // Apply date filtering
      ordersQuery = query(
        collection(doc(db, "stores", storeId), "orders"),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate),
        where("isPaid", "==", true)
      );
    } else {
      // No date filtering
      ordersQuery = query(
        collection(doc(db, "stores", storeId), "orders"),
        where("isPaid", "==", true)
      );
    }
    
    const ordersSnapshot = await getDocs(ordersQuery);
    console.log(`Found ${ordersSnapshot.size} orders for graph data`);
    
    const ordersData = ordersSnapshot.docs.map((doc) => doc.data()) as Order[];

    const monthlyRevenue: { [key: string]: number } = {};

    for (const order of ordersData) {
      if (!order.createdAt) {
        console.log("Order missing createdAt:", order.id);
        continue;
      }
      
      const month = order.createdAt
        .toDate()
        .toLocaleDateString("en-US", { month: "short" });

      if (month) {
        let revenueForOrder = 0;

        for (const item of order.orderItems) {
          if (item.qty !== undefined) {
            revenueForOrder += item.price * item.qty;
          } else {
            revenueForOrder += item.price;
          }
        }

        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
      }
    }

    console.log("Monthly revenue data:", monthlyRevenue);

    // Create a map to convert month names to numeric representation
    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    // Update graphData using the month map
    const graphData: GraphData[] = Object.keys(monthMap).map((monthName) => ({
      name: monthName,
      total: monthlyRevenue[monthName] || 0,
    }));

    return graphData;
  } catch (error) {
    console.error("Error getting graph revenue data:", error);
    return Object.keys({
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    }).map(month => ({ name: month, total: 0 }));
  }
};
