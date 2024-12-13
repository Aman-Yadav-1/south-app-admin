import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { doc, serverTimestamp,updateDoc} from 'firebase/firestore'
import { db } from "@/lib/firebase";


export const POST = async (req:Request)=>{
    const body = await req.text()

    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try{
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    }catch(error:any){
        return new NextResponse(`Webhook Error: ${(error as Error)?.message}`, {status:400})
    }

    const session = event.data.object as Stripe.Checkout.Session

    const address = session?.customer_details?.address

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ]

    const addressString = addressComponents.filter((c) => c !== null).join(', ')

    if(event.type === "checkout.session.completed"){
        console.log('order id: ', session?.metadata?.orderId)
        if(session?.metadata?.orderId){
            await updateDoc(doc(db, 'stores', session?.metadata?.storeId, 'orders', session?.metadata?.orderId),{
                isPaid:true,
                address: addressString,
                phone: session?.customer_details?.phone,
                updatedAt: serverTimestamp(),
            })

        }
    }
    return new NextResponse(null, {status:200})
}