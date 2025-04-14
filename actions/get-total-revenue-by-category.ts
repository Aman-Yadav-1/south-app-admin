import { db } from "@/lib/firebase";
import { Category, Order } from "@/types-db";
import { collection, doc, getDocs, query, Timestamp, where } from "firebase/firestore";

interface GraphData {
  name: string;
  total: number;
}

export const getOrderTotalRevenueByCategory = async (storeId: string, startDate?: Timestamp, endDate?: Timestamp) => {
  try {
    // Get dynamic categories from database
    const categoriesSnapshot = await getDocs(collection(doc(db, "stores", storeId), "categories"));
    const dynamicCategories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    }));
    
    console.log("Dynamic categories found:", dynamicCategories.length);
    
    // Add hardcoded categories
    const hardcodedCategories = [
      { id: "food", name: "Food" },
      { id: "beverage", name: "Beverage" },
      { id: "dessert", name: "Dessert" },
      { id: "appetizer", name: "Appetizer" },
      { id: "side", name: "Side Dish" }
    ];
    
    // Combine both category types
    const allCategories = [...dynamicCategories, ...hardcodedCategories];
    
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

    console.log("Orders found for category revenue:", ordersData.length);

    const categoryRevenue: { [key: string]: number } = {};
    const categoryNameMap: { [key: string]: string } = {};
    
    // Create a mapping from category ID to name
    allCategories.forEach(cat => {
      categoryNameMap[cat.id] = cat.name;
      categoryRevenue[cat.name] = 0; // Initialize with zero
    });

    // Add "Uncategorized" category
    categoryRevenue["Uncategorized"] = 0;

    // Process orders
    for (const order of ordersData) {
      if (!order.orderItems) continue;
      
      for (const item of order.orderItems) {
        let categoryName = "Uncategorized";
        
        if (item.category) {
          // Try to get category name from our mapping
          categoryName = categoryNameMap[item.category] || item.category;
        }

        let revenueForItem = 0;
        if (item.qty !== undefined) {
          revenueForItem = item.price * item.qty;
        } else {
          revenueForItem = item.price;
        }

        categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + revenueForItem;
      }
    }

    console.log("Category revenue:", categoryRevenue);

    // Convert to graph data format, filtering out zero values
    const graphData: GraphData[] = Object.entries(categoryRevenue)
      .filter(([_, value]) => value > 0) // Only include categories with revenue
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total); // Sort by revenue (highest first)

    // If no categories with revenue are found, provide some default data
    if (graphData.length === 0) {
      console.log("No categories with revenue found, using defaults");
      return [
        { name: "No Revenue Data", total: 0 }
      ];
    }

    return graphData;
  } catch (error) {
    console.error("Error getting revenue by category:", error);
    return [{ name: "Error", total: 0 }];
  }
};
