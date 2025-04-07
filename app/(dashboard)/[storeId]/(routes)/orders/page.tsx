import React from 'react'
import { collection, doc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Order } from '@/types-db'
import { format } from 'date-fns'
import { OrderColumns } from './_components/columns'
import { OrdersClient } from './_components/client'
import { formatter } from '@/lib/utils'

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  
  // Get orders with ordering by createdAt in descending order (newest first)
  const orderData = (
    await getDocs(
      query(
        collection(doc(db, "stores", params.storeId), "orders"),
        orderBy("createdAt", "desc")
      )
    )
  ).docs.map((doc) => doc.data()) as Order[]
  
  const formattedOrders: OrderColumns[] = orderData.map(item => ({
    id: item.id,
    isPaid: item.isPaid,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((item) => item.name).join(", "),
    order_status: item.order_status || "Processing",
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        if(item && item.qty !== undefined){
          return total + Number(item.price * item.qty)
        }
        return total
      }, 0)
    ),
    images: item.orderItems.map((item) => item.images[0].url),
    createdAt: item.createdAt 
      ? format(item.createdAt.toDate(), "MMMM do, yyyy")
      : "",
    customerName: item.customerName || "Guest Customer", // Add customerName with a fallback
    orderDate: item.createdAt 
      ? format(item.createdAt.toDate(), "yyyy-MM-dd") // Add orderDate in a specific format
      : ""
  }))

  // Define the priority order for status sorting
  const statusPriority: Record<string, number> = {
    "Processing": 1,
    "Delivering": 2,
    "Delivered": 3,
    "Canceled": 4
  };

  // Sort orders by status priority
  const sortedOrders = [...formattedOrders].sort((a, b) => {
    const priorityA = statusPriority[a.order_status] || 999; // Default high number for unknown statuses
    const priorityB = statusPriority[b.order_status] || 999;
    
    return priorityA - priorityB;
  });

  return (
    <div className='flex-col'>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={sortedOrders} />
      </div>
    </div>
  )
}

export default OrdersPage
