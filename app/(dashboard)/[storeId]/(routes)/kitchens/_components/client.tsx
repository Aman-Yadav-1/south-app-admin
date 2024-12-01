'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/api-list"
import { columns, KitchenColumns } from "./columns"

interface KitchenClientProps {
  data: KitchenColumns[]
}

export const KitchensClient = ({data} : KitchenClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Kitchens (${data.length})`}
                    description="Manage kitchens for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/kitchens/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator/>

            <DataTable searchKey="name" columns={columns} data={data}/>

            <Heading title='API' description="API calls for kitchens"/>
            <Separator/>
            <ApiList entityName='kitchens' entityNameId='kitchenId'/>
        </>
    )
}