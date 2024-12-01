'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/api-list"
import { columns, ProductColumns } from "./columns"

interface ProductsClientProps {
  data: ProductColumns[]
}

export const ProductsClient = ({data} : ProductsClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Products (${data.length})`}
                    description="Manage products for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator/>

            <DataTable searchKey="name" columns={columns} data={data}/>

            <Heading title='API' description="API calls for products"/>
            <Separator/>
            <ApiList entityName='products' entityNameId='productId'/>
        </>
    )
}