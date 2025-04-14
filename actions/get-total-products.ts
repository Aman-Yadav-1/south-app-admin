import { db } from "@/lib/firebase"
import { collection, doc, getDocs, query, where } from "firebase/firestore"

// Simple in-memory cache to avoid redundant queries
const cache: Record<string, { count: number; timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute cache TTL

export const getTotalProducts = async (storeId: string) => {
    try {
        // Check cache first
        const now = Date.now();
        if (cache[storeId] && (now - cache[storeId].timestamp) < CACHE_TTL) {
            return cache[storeId].count;
        }

        // If not in cache or cache expired, fetch from Firestore
        const productsData = await getDocs(
            collection(doc(db, "stores", storeId), "products")
        );
        
        const count = productsData.size;
        
        // Update cache
        cache[storeId] = { count, timestamp: now };
        
        return count;
    } catch (error) {
        console.error("Error getting total products:", error);
        // Return 0 as fallback in case of error
        return 0;
    }
}

// Get active products count (not archived)
export const getActiveProductsCount = async (storeId: string) => {
    try {
        const productsRef = collection(doc(db, "stores", storeId), "products");
        const q = query(productsRef, where("isArchived", "==", false));
        const productsData = await getDocs(q);
        
        return productsData.size;
    } catch (error) {
        console.error("Error getting active products count:", error);
        return 0;
    }
}

// Get featured products count
export const getFeaturedProductsCount = async (storeId: string) => {
    try {
        const productsRef = collection(doc(db, "stores", storeId), "products");
        const q = query(productsRef, where("isFeatured", "==", true));
        const productsData = await getDocs(q);
        
        return productsData.size;
    } catch (error) {
        console.error("Error getting featured products count:", error);
        return 0;
    }
}
