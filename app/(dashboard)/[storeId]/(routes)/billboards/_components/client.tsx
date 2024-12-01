'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { BillboardColumns, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/api-list"

interface BillboardClientProps {
  data: BillboardColumns[]
}

export const BillboardClient = ({data} : BillboardClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Billboards (${data.length})`}
                    description="Manage billboards for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator/>

            <DataTable searchKey="label" columns={columns} data={data}/>

            <Heading title='API' description="API calls for billboards"/>
            <Separator/>
            <ApiList entityName='billboards' entityNameId='billboardId'/>
        </>
    )
}