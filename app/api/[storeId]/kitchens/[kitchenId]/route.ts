import { db } from "@/lib/firebase";
import { Kitchen } from "@/types-db";
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
const validateRequest = async (userId: string | null, params: { storeId: string, kitchenId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 401 }) };
  }

  if (!params.kitchenId) {
    return { error: new NextResponse("Kitchen ID is missing", { status: 401 }) };
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
  { params }: { params: { storeId: string; kitchenId: string } }
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
      return new NextResponse("Kitchen Name is missing!", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Kitchen Value is missing!", { status: 400 });
    }

    // Get kitchen reference
    const kitchenDocRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "kitchens", 
      params.kitchenId
    );
    
    const kitchenSnapshot = await getDoc(kitchenDocRef);

    if (!kitchenSnapshot.exists()) {
      return new NextResponse("Kitchen not found", { status: 404 });
    }

    // Update kitchen
    await updateDoc(kitchenDocRef, {
      name,
      value,
      updatedAt: serverTimestamp(),
    });

    // Fetch and return the updated kitchen
    const updatedKitchenSnapshot = await getDoc(kitchenDocRef);
    const kitchen = {
      id: updatedKitchenSnapshot.id,
      ...updatedKitchenSnapshot.data()
    } as Kitchen;

    return NextResponse.json(kitchen);
  } catch (error) {
    console.error("[KITCHEN_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; kitchenId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get kitchen reference
    const kitchenRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "kitchens", 
      params.kitchenId
    );

    // Check if kitchen exists
    const kitchenDoc = await getDoc(kitchenRef);
    if (!kitchenDoc.exists()) {
      return new NextResponse("Kitchen not found", { status: 404 });
    }

    // Delete kitchen
    await deleteDoc(kitchenRef);

    return NextResponse.json({
      message: "Kitchen deleted successfully"
    });
  } catch (error) {
    console.error("[KITCHEN_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}