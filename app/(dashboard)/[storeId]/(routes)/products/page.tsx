import React from 'react'
import { collection, doc, getDocs, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product } from '@/types-db'
import { format } from 'date-fns'
import { ProductColumns } from './_components/columns'
import { ProductsClient } from './_components/client'
import { formatter } from '@/lib/utils'

const ProductsPage = async ({params}:{params:{storeId:string}}) => {
  
  const productsData = (
    await getDocs(
      collection(doc(db,"stores",params.storeId), "products")
    )
  ).docs.map((doc)=>({...doc.data(), id: doc.id})) as Product[]
  
  const categoryPromises = productsData.map(item => 
    item.category ? getDoc(doc(db, 'stores', params.storeId, 'categories', item.category)) : null
  );
  const sizePromises = productsData.map(item => 
    item.size ? getDoc(doc(db, 'stores', params.storeId, 'sizes', item.size)) : null
  );
  const kitchenPromises = productsData.map(item => 
    item.kitchen ? getDoc(doc(db, 'stores', params.storeId, 'kitchens', item.kitchen)) : null
  );
  const cuisinePromises = productsData.map(item => 
    item.cuisine ? getDoc(doc(db, 'stores', params.storeId, 'cuisines', item.cuisine)) : null
  );

  const categories = await Promise.all(categoryPromises);
  const sizes = await Promise.all(sizePromises);
  const kitchens = await Promise.all(kitchenPromises);
  const cuisines = await Promise.all(cuisinePromises);

  const formattedProducts: ProductColumns[] = productsData.map((item, index)=>({
    id: item.id,
    name: item.name,
    price: formatter.format(item.price),
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    category: categories[index]?.exists() ? categories[index].data()?.name : item.category,
    size: sizes[index]?.exists() ? sizes[index].data()?.name : item.size,
    cuisine: cuisines[index]?.exists() ? cuisines[index].data()?.name : item.cuisine,
    kitchen: kitchens[index]?.exists() ? kitchens[index].data()?.name : item.kitchen,
    images: item.images,
    createdAt: item.createdAt ? format(item.createdAt.toDate(),"MMMM do,yyyy") : "",
  }))

  return (
    <div className='flex-col'>
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ProductsClient data={formattedProducts}/>
        </div>
    </div>
  )
}

export default ProductsPage