import { db } from "@/lib/firebase";
import { Category } from "@/types-db";
import { auth } from "@clerk/nextjs/server";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export const POST = async (req: Request,
    {params}:{params:{storeId:string}}
) => {
    try {
        const { userId } = auth()
        const body = await req.json()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { name, billboardLabel, billboardId } = body;

        if (!name) {
            return new NextResponse("Category Name is missing!", { status: 400 })
        }

        if (!billboardId) {
            return new NextResponse("Billboard ID is missing!", { status: 400 })
        }

        if (!params.storeId) {
            return new NextResponse("Store Id is missing", { status: 401 })
        }

        const storeRef = doc(db, "stores", params.storeId)
        const store = await getDoc(storeRef)

        if(!store.exists()){
            return new NextResponse("Store not found", {status: 404})
        }

        const storeData = store.data()
        if(storeData?.userId !== userId){
            return new NextResponse("Unauthorized Access", {status: 403})
        }

        // Verify billboard exists
        const billboardRef = doc(db, "stores", params.storeId, "billboards", billboardId)
        const billboardDoc = await getDoc(billboardRef)
        
        if(!billboardDoc.exists()){
            return new NextResponse("Billboard not found", {status: 404})
        }

        const categoryData = {
            name,
            billboardId,
            billboardLabel,
            createdAt: serverTimestamp()
        }

        const categoryRef = await addDoc(
            collection(db, "stores", params.storeId, "categories"),
            categoryData
        )

        const id = categoryRef.id;

        // Update the category with its own ID
        await updateDoc(categoryRef, {
            ...categoryData,
            id,
            updatedAt: serverTimestamp()
        })

        return NextResponse.json({id, ...categoryData})
    } catch (error) {
        console.error(`CATEGORIES_POST: ${error}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export const GET = async (req: Request,
    {params}:{params:{storeId:string}}
) => {
    try {
        if (!params.storeId) {
            return new NextResponse("Store Id is missing", { status: 401 })
        }

        const categoriesSnapshot = await getDocs(
            collection(db, "stores", params.storeId, "categories")
        )
        
        const categoryData = categoriesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as Category[]
        
        return NextResponse.json(categoryData)
    } catch (error) {
        console.error(`CATEGORIES_GET: ${error}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}