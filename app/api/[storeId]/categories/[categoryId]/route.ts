import { db } from "@/lib/firebase";
import { Category } from "@/types-db";
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
const validateRequest = async (userId: string | null, params: { storeId: string, categoryId: string }) => {
  if (!userId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  if (!params.storeId) {
    return { error: new NextResponse("Store ID is missing", { status: 401 }) };
  }

  if (!params.categoryId) {
    return { error: new NextResponse("Category ID is missing", { status: 401 }) };
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

// GET handler to fetch category data
export async function GET(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get category reference
    const categoryRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "categories", 
      params.categoryId
    );

    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json({
      id: categoryDoc.id,
      ...categoryDoc.data()
    });
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    const body = await req.json();

    const { name, billboardId, billboardLabel } = body;

    if (!name) {
      return new NextResponse("Category Name is missing!", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard ID is missing!", { status: 400 });
    }

    if (!billboardLabel) {
      return new NextResponse("Billboard Label is missing!", { status: 400 });
    }

    // Get category reference
    const categoryRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "categories", 
      params.categoryId
    );
    
    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Update category
    await updateDoc(categoryRef, {
      name,
      billboardId,
      billboardLabel,
      updatedAt: serverTimestamp(),
    });

    // Fetch updated category
    const updatedCategory = {
      id: categoryDoc.id,
      ...(await getDoc(categoryRef)).data()
    } as Category;

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    const validation = await validateRequest(userId, params);
    
    if (validation.error) {
      return validation.error;
    }

    // Get category reference
    const categoryRef = doc(
      db, 
      "stores", 
      params.storeId, 
      "categories", 
      params.categoryId
    );

    // Check if category exists
    const categoryDoc = await getDoc(categoryRef);
    if (!categoryDoc.exists()) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Delete category
    await deleteDoc(categoryRef);

    return NextResponse.json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}