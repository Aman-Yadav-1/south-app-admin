import { db, storage } from "@/lib/firebase"
import { Store } from "@/types-db"
import { auth } from "@clerk/nextjs/server"
import {  collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore"
import { deleteObject, ref } from "firebase/storage"
import { NextResponse } from "next/server"

export const PATCH = async (req: Request, {params}: {params: {storeId: string}}) => {
    try {
        const { userId } = auth()
        const body = await req.json()

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!params.storeId) {
            return new NextResponse("Store Id is required", { status: 401 })
        }

        const { name } = body;

        if (!name) {
            return new NextResponse("Store Name is missing!", { status: 400 })
        }

        const docRef = doc(db, "stores", params.storeId)
        await updateDoc(docRef, {name})
        const store = (await getDoc(docRef)).data() as Store

        return NextResponse.json(store)
    } catch (error) {
        console.error(`STORES_POST: ${error}`)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string } }
  ) {
    try {
      const { userId } = auth();
  
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 401 });
      }
  
      if (!params.storeId) {
        return new NextResponse("Store ID is required", { status: 400 });
      }
  
      const storeRef = doc(db, "stores", params.storeId);
  

      // TODO : Delete all products and categories associated with the store

      const billboardsQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/billboards`)
      );

      billboardsQuerySnapshot.forEach(async (billboardDoc) => {
        await deleteDoc(billboardDoc.ref);

        const imageUrl = billboardDoc.data().imageUrl;
        if(imageUrl) {
          // Delete the image from Firebase Storage
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
      });

      //categories

      const categoriesQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/categories`)
      );

      categoriesQuerySnapshot.forEach(async (categoryDoc) => {
        await deleteDoc(categoryDoc.ref);
      });

      //sizes

      const sizesQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/sizes`)
      );

      sizesQuerySnapshot.forEach(async (sizeDoc) => {
        await deleteDoc(sizeDoc.ref);
        
      });

      //kitchens
      const kitchensQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/kitchens`)
      );

      kitchensQuerySnapshot.forEach(async (kitchenDoc) => {
        await deleteDoc(kitchenDoc.ref);
      });

      //cuisines
      const cuisinesQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/cuisines`)
      );
      cuisinesQuerySnapshot.forEach(async (cuisineDoc) => {
        await deleteDoc(cuisineDoc.ref);
      });

      //products
      const productsQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/products`)
      );

      productsQuerySnapshot.forEach(async (productDoc) => {
        await deleteDoc(productDoc.ref);

        const imagesArray = productDoc.data().images;
        
        // remove images from firebase storage

        if(imagesArray && Array.isArray(imagesArray)){
          await Promise.all(
            imagesArray.map(async (imageUrl) => {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            })
          );
        }
      });


      // ordedrs and its order items and its images
      const ordersQuerySnapshot = await getDocs(
        collection(db, `stores/${params.storeId}/orders`)
      );
      ordersQuerySnapshot.forEach(async (orderDoc) => {
        await deleteDoc(orderDoc.ref);

        const ordersItemArray = orderDoc.data().orderItems;
        if(ordersItemArray && Array.isArray(ordersItemArray)){
          await Promise.all(
            ordersItemArray.map(async (orderItem) => {
              const ItemImagesArray = orderItem.images;
              if(ItemImagesArray && Array.isArray(ItemImagesArray)){
                await Promise.all(
                  ItemImagesArray.map(async (image) => {
                    const imageRef = ref(storage, image.url);
                    await deleteObject(imageRef);
                  }))}
            }))}
      })
  
      // finally deleting the store
      await deleteDoc(storeRef);
      return NextResponse.json({ message: "Store and all its sub-collections are deleted successfully" });


  
    } catch (error) {
      console.error("[STORE_DELETE]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }