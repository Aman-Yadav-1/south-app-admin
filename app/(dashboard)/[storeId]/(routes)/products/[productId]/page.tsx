import { db } from '@/lib/firebase'
import { Product } from '@/types-db'
import { doc, getDoc } from 'firebase/firestore'
import React from 'react'
import { ProductForm } from './_components/product-form'

const ProductPage = async ({ params }: {
  params: {
    productId: string,
    storeId: string
  }
}) => {
  // For new products
  if (params.productId === "new") {
    return (
      <div className='flex-col'>
        <div className='flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6'>
          <ProductForm initialData={null} />
        </div>
      </div>
    )
  }

  // For existing products
  const product = (await getDoc(doc(db, "stores", params.storeId, "products", params.productId))).data() as Product;

  return (
    <div className='flex-col'>
      <div className='flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6'>
        <ProductForm initialData={product} />
      </div>
    </div>
  )
}

export default ProductPage
