"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { CellAction } from "./cell-actions"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const NameCell = ({ id, collection }: { id: string, collection: string }) => {
  const [name, setName] = useState(id)
  
  useEffect(() => {
    const fetchName = async () => {
      try {
        const storeId = window.location.pathname.split('/')[1]
        const docRef = doc(db, "stores", storeId, collection, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setName(docSnap.data()?.name || id)
        }
      } catch (error) {
        console.log(`Error fetching ${collection} name:`, error)
      }
    }
    fetchName()
  }, [id, collection])

  return <div>{name}</div>
}

export type ProductColumns = {
  id: string,
  name: string,
  price: string,
  qty?: number,
  images: {url: string}[],
  isFeatured: boolean,
  isArchived: boolean,
  category: string, 
  size: string, 
  kitchen: string,
  cuisine: string, 
  createdAt: string;
}

export const columns: ColumnDef<ProductColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price"
  },
  {
    accessorKey: "isFeatured",
    header: "Featured"
  },
  {
    accessorKey: "isArchived",
    header: "Archived"
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <NameCell id={row.original.category} collection="categories" />
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => <NameCell id={row.original.size} collection="sizes" />
  },
  {
    accessorKey: "cuisine",
    header: "Cuisine",
    cell: ({ row }) => <NameCell id={row.original.cuisine} collection="cuisines" />
  },
  {
    accessorKey: "kitchen",
    header: "Kitchen",
    cell: ({ row }) => <NameCell id={row.original.kitchen} collection="kitchens" />
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },

  {
    id: 'actions',
    cell: ({row}) => <CellAction data={row.original}/>
  }
]
