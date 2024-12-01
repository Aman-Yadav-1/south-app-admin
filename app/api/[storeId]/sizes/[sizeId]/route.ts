import { db } from "@/lib/firebase";
import { Size } from "@/types-db";
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
const validateRequest = async (userId: string | null, params: { storeId: string, sizeId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 401 }) };
  }

  if (!params.sizeId) {
    return { error: new NextResponse("Size ID is missing", { status: 401 }) };
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
  { params }: { params: { storeId: string; sizeId: string } }
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
      return new NextResponse("Size Name is missing!", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Size Value is missing!", { status: 400 });
    }

    // Get size reference
    const sizeDocRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "sizes", 
      params.sizeId
    );
    
    const sizeSnapshot = await getDoc(sizeDocRef);

    if (!sizeSnapshot.exists()) {
      return new NextResponse("Size not found", { status: 404 });
    }

    // Update size
    await updateDoc(sizeDocRef, {
      name,
      value,
      updatedAt: serverTimestamp(),
    });

    // Fetch and return the updated size
    const updatedSizeSnapshot = await getDoc(sizeDocRef);
    const size = {
      id: updatedSizeSnapshot.id,
      ...updatedSizeSnapshot.data()
    } as Size;

    return NextResponse.json(size);
  } catch (error) {
    console.error("[SIZE_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get size reference
    const sizeRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "sizes", 
      params.sizeId
    );

    // Check if size exists
    const sizeDoc = await getDoc(sizeRef);
    if (!sizeDoc.exists()) {
      return new NextResponse("Size not found", { status: 404 });
    }

    // Delete size
    await deleteDoc(sizeRef);

    return NextResponse.json({
      message: "Size deleted successfully"
    });
  } catch (error) {
    console.error("[SIZE_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}