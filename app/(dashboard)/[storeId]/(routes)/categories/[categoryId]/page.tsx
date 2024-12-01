import { db } from '@/lib/firebase'
import { Category } from '@/types-db'
import { doc, getDoc } from 'firebase/firestore'
import React from 'react'
import {CategoryForm} from './_components/category-form'

const CategoryPage = async ({params}:{params:{
  categoryId:string,
    storeId:string
}}) => {

    const category = (await getDoc(doc(db, "stores", params.storeId, "category", params.categoryId))).data() as Category
  return (
    <div className='flex-col'>
    <div className='flex-1 space-y-4 p-8 pt-6'>
        <CategoryForm initialData={category} /></div>
    </div>
  )
}

export default CategoryPage