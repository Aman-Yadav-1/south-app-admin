import { db } from "@/lib/firebase";
import { Kitchen } from "@/types-db";
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
            return new NextResponse("kitchen name is missing!", { status: 400 })
        }

        if (!value) {
            return new NextResponse("kitchen value is missing!", { status: 400 })
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

        const kitchenData = {
            name,
            value,
            createdAt: serverTimestamp()
        }

        const kitchenRef = await addDoc(
            collection(db, "stores", params.storeId, "kitchens"),
            kitchenData
        )

        const id = kitchenRef.id;

        await updateDoc(doc(db, "stores", params.storeId, "kitchens", id), {
            ...kitchenData,
            id,
            updatedAt: serverTimestamp()
        })

        return NextResponse.json({id, ...kitchenData})
    } catch (error) {
        console.error(`KITCHENS_POST: ${error}`)
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

        const kitchensData = (
            await getDocs(collection(doc(db,"stores",params.storeId),"kitchens"))
        ).docs.map((doc)=>doc.data()) as Kitchen[];
        
        return NextResponse.json(kitchensData)
    } catch (error) {
        console.error(`KITCHENS_GET: ${error}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}