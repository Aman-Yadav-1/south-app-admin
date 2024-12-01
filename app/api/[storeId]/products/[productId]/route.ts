import { db } from "@/lib/firebase";
import { auth } from "@clerk/nextjs/server";
import { 
  deleteDoc, 
  doc, 
  getDoc, 
  serverTimestamp, 
  updateDoc 
} from "firebase/firestore";
import { NextResponse } from "next/server";

// Helper function to validate request
const validateRequest = async (userId: string | null, params: { storeId: string, productId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 400 }) };
  }

  if (!params.productId) {
    return { error: new NextResponse("Product ID is missing", { status: 400 }) };
  }

  // Check store ownership
  const storeRef = doc(db, "stores", params.storeId);
  const store = await getDoc(storeRef);

  if (!store.exists()) {
    return { error: new NextResponse("Store not found", { status: 404 }) };
  }

  if (store.data()?.userId !== userId) {
    return { error: new NextResponse("Unauthorized access", { status: 403 }) };
  }

  return { error: null };
};

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    const body = await req.json();
    const {
      name,
      price,
      images,
      isFeatured,
      isArchived,
      category,
      size,
      kitchen,
      cuisine,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return new NextResponse("Product name is required", { status: 400 });
    }

    if (!images || !images.length || images.length > 7) {
      return new NextResponse("Between 1 and 7 images are required", { status: 400 });
    }

    if (!price || price <= 0) {
      return new NextResponse("Valid price is required", { status: 400 });
    }

    if (!category) {
      return new NextResponse("Category is required", { status: 400 });
    }

    if (!size) {
      return new NextResponse("Size is required", { status: 400 });
    }

    if (!kitchen) {
      return new NextResponse("Kitchen is required", { status: 400 });
    }

    if (!cuisine) {
      return new NextResponse("Cuisine is required", { status: 400 });
    }

    // Get product reference
    const productRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "products", 
      params.productId
    );
    
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Update product with all fields
    const updatedData = {
      name,
      price,
      images,
      isFeatured,
      isArchived,
      category,
      size,
      kitchen,
      cuisine,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(productRef, updatedData);

    return NextResponse.json({
      id: params.productId,
      ...updatedData
    });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get product reference
    const productRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "products", 
      params.productId
    );

    // Check if product exists
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Delete product
    await deleteDoc(productRef);

    return NextResponse.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}