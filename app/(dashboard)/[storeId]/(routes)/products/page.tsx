import { format } from "date-fns";
import { ProductClient } from "./_components/client";
import { ProductColumn } from "./_components/columns";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { getTotalProducts } from "@/actions/get-total-products";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for better UX
const ProductsLoading = () => (
  <div className="flex-col">
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-24" />
      </div>
      <Skeleton className="h-[450px] w-full mt-6" />
    </div>
  </div>
);

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    // Fetch products from Firestore
    const productsSnapshot = await getDocs(
      collection(doc(db, "stores", params.storeId), "products")
    );
    
    // Get total count for analytics
    const totalProducts = await getTotalProducts(params.storeId);
    
    // Create an array to hold our formatted products
    const formattedProducts: ProductColumn[] = [];
    
    // Process each product
    for (const productDoc of productsSnapshot.docs) {
      const data = productDoc.data();
      let categoryName = "Uncategorized";
      
      // If the product has a category, try to fetch its name
      if (data.category) {
        try {
          // First, check if category is a direct name (for backward compatibility)
          if (typeof data.category === 'string' && 
              !data.category.includes('/') && 
              data.category !== 'food' && 
              data.category !== 'beverage' && 
              data.category !== 'dessert' && 
              data.category !== 'appetizer' && 
              data.category !== 'side') {
            categoryName = data.category;
          } 
          // Otherwise, try to fetch the category document
          else {
            // Handle hardcoded category IDs
            const categoryMap = {
              'food': 'Food',
              'beverage': 'Beverage',
              'dessert': 'Dessert',
              'appetizer': 'Appetizer',
              'side': 'Side Dish'
            };
            
            if (categoryMap[data.category]) {
              categoryName = categoryMap[data.category];
            } else {
              // Try to fetch from the database
              const categoryDoc = await getDoc(doc(db, "stores", params.storeId, "categories", data.category));
              if (categoryDoc.exists()) {
                categoryName = categoryDoc.data().name;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching category for product ${productDoc.id}:`, error);
        }
      }
      
      // Format the product with the resolved category name
      formattedProducts.push({
        id: productDoc.id,
        name: data.name,
        price: `₹${data.price.toFixed(2)}`,
        category: categoryName,
        isFeatured: data.isFeatured,
        isArchived: data.isArchived,
        createdAt: data.createdAt ? format(data.createdAt.toDate(), 'MMM dd, yyyy') : 'Unknown',
        inventory: data.qty || 0,
      });
    }

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6">
          <ProductClient 
            data={formattedProducts} 
            totalProducts={totalProducts}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading products:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6">
          <div className="bg-destructive/15 p-4 rounded-md">
            <p className="text-destructive font-medium">Error loading products. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }
};

// Wrap with Suspense for better loading experience
const ProductsPageWithSuspense = ({ params }: { params: { storeId: string } }) => (
  <Suspense fallback={<ProductsLoading />}>
    <ProductsPage params={params} />
  </Suspense>
);

export default ProductsPageWithSuspense;
