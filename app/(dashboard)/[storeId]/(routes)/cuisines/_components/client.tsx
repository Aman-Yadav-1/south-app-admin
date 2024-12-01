'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/api-list"
import { columns, CuisineColumns } from "./columns"

interface CuisineClientProps {
  data: CuisineColumns[]
}

export const CuisineClient = ({data} : CuisineClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Cuisines (${data.length})`}
                    description="Manage cuisines for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/cuisines/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator/>

            <DataTable searchKey="name" columns={columns} data={data}/>

            <Heading title='API' description="API calls for Cuisines"/>
            <Separator/>
            <ApiList entityName='cuisines' entityNameId='cuisineId'/>
        </>
    )
}