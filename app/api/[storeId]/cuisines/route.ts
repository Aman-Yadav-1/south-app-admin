import { db } from "@/lib/firebase";
import { Cuisine } from "@/types-db";
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

        const { name, value } = body;

        if (!name) {
            return new NextResponse("cuisine name is missing!", { status: 400 })
        }

        if (!value) {
            return new NextResponse("cuisine value is missing!", { status: 400 })
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

        const cuisineData = {
            name,
            value,
            createdAt: serverTimestamp()
        }

        const cuisineRef = await addDoc(
            collection(db, "stores", params.storeId, "cuisines"),
            cuisineData
        )

        const id = cuisineRef.id;

        await updateDoc(doc(db, "stores", params.storeId, "cuisines", id), {
            ...cuisineData,
            id,
            updatedAt: serverTimestamp()
        })

        return NextResponse.json({id, ...cuisineData})
    } catch (error) {
        console.error(`cuisineS_POST: ${error}`)
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

        const cuisinesData = (
            await getDocs(collection(doc(db,"stores",params.storeId),"cuisines"))
        ).docs.map((doc)=>doc.data()) as Cuisine[];
        
        return NextResponse.json(cuisinesData)
    } catch (error) {
        console.error(`cuisineS_GET: ${error}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}