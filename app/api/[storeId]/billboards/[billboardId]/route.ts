import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
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
const validateRequest = async (userId: string | null, params: { storeId: string, billboardId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 401 }) };
  }

  if (!params.billboardId) {
    return { error: new NextResponse("Billboard ID is missing", { status: 401 }) };
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
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    // Validate request body
    if (!label) {
      return new NextResponse("Billboard label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Billboard image URL is required", { status: 400 });
    }

    // Get billboard reference
    const billboardRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "billboards", 
      params.billboardId
    );
    
    const billboardDoc = await getDoc(billboardRef);

    if (!billboardDoc.exists()) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    // Update billboard
    await updateDoc(billboardRef, {
      ...billboardDoc.data(),
      label,
      imageUrl,
      updatedAt: serverTimestamp(),
    });

    // Fetch updated billboard
    const updatedBillboard = (await getDoc(billboardRef)).data() as Billboards;

    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.error("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get billboard reference
    const billboardRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "billboards", 
      params.billboardId
    );

    // Check if billboard exists
    const billboardDoc = await getDoc(billboardRef);
    if (!billboardDoc.exists()) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    // Delete billboard
    await deleteDoc(billboardRef);

    return NextResponse.json({
      message: "Billboard deleted successfully"
    });
  } catch (error) {
    console.error("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}