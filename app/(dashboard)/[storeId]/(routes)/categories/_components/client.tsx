'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { CategoryColumns, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import ApiList from "@/components/api-list"

interface CategoryClientProps {
  data: CategoryColumns[]
}

export const CategoryClient = ({data} : CategoryClientProps) => {
    const router = useRouter()
    const params = useParams()

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Categories (${data.length})`}
                    description="Manage categories for your store"
                />
                <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator/>

            <DataTable searchKey="name" columns={columns} data={data}/>

            <Heading title='API' description="API calls for categories"/>
            <Separator/>
            <ApiList entityName='categories' entityNameId='categoryId'/>
        </>
    )
}