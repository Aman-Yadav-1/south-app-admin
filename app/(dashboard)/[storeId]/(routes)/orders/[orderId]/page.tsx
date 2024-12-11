import { db } from '@/lib/firebase'
import { Order } from '@/types-db'
import { doc, getDoc } from 'firebase/firestore'
import React from 'react'
import { notFound } from 'next/navigation'
import { OrderForm } from './_components/order-form'

const OrderPage = async ({params}:{params:{
  orderId:string,
  storeId:string
}}) => {
    // Fetch the order document
    const orderRef = doc(db, "stores", params.storeId, "orders", params.orderId)
    const orderSnapshot = await getDoc(orderRef)

    // Check if the order exists
    if (!orderSnapshot.exists()) {
        notFound() // Next.js 13+ way to handle 404
    }

    // Safely extract data
    const order = orderSnapshot.data() as Order

    return (
        <div className='flex-col'>
            <div className='flex-1 space-y-4 p-8 pt-6'>
                <OrderForm initialData={order} />
            </div>
        </div>
    )
}

export default OrderPage