'use client'

import { PlusCircle } from "lucide-react"

interface CreateNewStoreProp{
    onClick:()=>void
}
export const CreateNewStoreItem = ({onClick}:CreateNewStoreProp) => {
    return (
        <div onClick={onClick} className="flex items-center bg-gray-50 px-2 py-1 cursor-pointer text-muted-foreground hover:text-primary">
            <PlusCircle className="mr-2 h-3 w-3"/>
            <p className="text-xs">Create Store</p>
        </div>
    )
}