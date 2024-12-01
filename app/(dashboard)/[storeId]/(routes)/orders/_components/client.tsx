'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { columns, OrderColumns } from "./columns"

interface OrdersClientProps {
  data: OrderColumns[]
}

export const OrdersClient = ({data} : OrdersClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Orders (${data.length})`}
                    description="Manage Orders for your store"
                />
            </div>

            <Separator/>

            <DataTable searchKey="name" columns={columns} data={data}/>
        </>
    )
}