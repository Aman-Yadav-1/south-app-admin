import { NextResponse } from "next/server";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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
    
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    
    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    
    if (!category) {
      return new NextResponse("Category is required", { status: 400 });
    }
    
    if (!size) {
      return new NextResponse("Size is required", { status: 400 });
    }
    
    if (!images || !images.length) {
      return new NextResponse("At least one image is required", { status: 400 });
    }

    // Add product to Firestore
    const productData = {
      name,
      price,
      category,
      size,
      images,
      isFeatured,
      isArchived,
      storeId: params.storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "products"), productData);
    
    return NextResponse.json({ id: docRef.id, ...productData });
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('isFeatured');
    
    // Build query
    let q = query(
      collection(db, "products"),
      where("storeId", "==", params.storeId),
      where("isArchived", "==", false)
    );
    
    // Add additional filters if provided
    if (category) {
      q = query(q, where("category", "==", category));
    }
    
    if (isFeatured) {
      q = query(q, where("isFeatured", "==", true));
    }
    
    const productsSnapshot = await getDocs(q);
    
    const products: any[] = [];
    productsSnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
