import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const productRef = doc(db, "products", params.productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return new NextResponse("Product not found", { status: 404 });
    }
    
    return NextResponse.json({ id: productSnap.id, ...productSnap.data() });
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const body = await req.json();
    
    const { 
      name, 
      price, 
      category, 
      size, 
      images, 
      isFeatured, 
      isArchived 
    } = body;
    
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    
    // Update product in Firestore
    const productRef = doc(db, "products", params.productId);
    
    await updateDoc(productRef, {
      name,
      price,
      category,
      size,
      images,
      isFeatured,
      isArchived,
      updatedAt: serverTimestamp()
    });
    
    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }
    
    // Delete product from Firestore
    const productRef = doc(db, "products", params.productId);
    await deleteDoc(productRef);
    
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
