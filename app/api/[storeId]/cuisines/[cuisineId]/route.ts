import { db } from "@/lib/firebase";
import { Cuisine } from "@/types-db";
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
const validateRequest = async (userId: string | null, params: { storeId: string, cuisineId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 401 }) };
  }

  if (!params.cuisineId) {
    return { error: new NextResponse("cuisine ID is missing", { status: 401 }) };
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
  { params }: { params: { storeId: string; cuisineId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    const body = await req.json();
    const { name, value } = body;

    if (!name) {
      return new NextResponse("cuisine Name is missing!", { status: 400 });
    }

    if (!value) {
      return new NextResponse("cuisine Value is missing!", { status: 400 });
    }

    // Get cuisine reference
    const cuisineDocRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "cuisines", 
      params.cuisineId
    );
    
    const cuisineSnapshot = await getDoc(cuisineDocRef);

    if (!cuisineSnapshot.exists()) {
      return new NextResponse("cuisine not found", { status: 404 });
    }

    // Update cuisine
    await updateDoc(cuisineDocRef, {
      name,
      value,
      updatedAt: serverTimestamp(),
    });

    // Fetch and return the updated cuisine
    const updatedcuisineSnapshot = await getDoc(cuisineDocRef);
    const cuisine = {
      id: updatedcuisineSnapshot.id,
      ...updatedcuisineSnapshot.data()
    } as Cuisine;

    return NextResponse.json(cuisine);
  } catch (error) {
    console.error("[cuisine_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; cuisineId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get cuisine reference
    const cuisineRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "cuisines", 
      params.cuisineId
    );

    // Check if cuisine exists
    const cuisineDoc = await getDoc(cuisineRef);
    if (!cuisineDoc.exists()) {
      return new NextResponse("cuisine not found", { status: 404 });
    }

    // Delete cuisine
    await deleteDoc(cuisineRef);

    return NextResponse.json({
      message: "cuisine deleted successfully"
    });
  } catch (error) {
    console.error("[cuisine_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}