import { db } from "@/lib/firebase"; // Ensure you have Firebase configured in your project
import { collection, query, where, getDocs } from "firebase/firestore";

interface Order {
  createdAt: Date;
  items: { price: number; quantity: number }[];
}

export const getRevenueByRange = async (
  storeId: string,
  range: { start: Date; end: Date }
): Promise<number> => {
  try {
    const ordersRef = collection(db, "stores", storeId, "orders");
    const q = query(
      ordersRef,
      where("createdAt", ">=", range.start),
      where("createdAt", "<=", range.end)
    );

    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => doc.data() as Order);

    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => {
        return itemSum + item.price * item.quantity;
      }, 0);
      return sum + orderTotal;
    }, 0);

    return totalRevenue;
  } catch (error) {
    console.error("Error fetching revenue by range:", error);
    return 0;
  }
};