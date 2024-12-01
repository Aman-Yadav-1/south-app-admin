import { db } from '@/lib/firebase'
import { Store } from '@/types-db'
import { auth } from '@clerk/nextjs/server'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { redirect } from 'next/navigation'

interface SetupLayoutProp{
    children: React.ReactNode
}
const Setuplayout = async ({children}: SetupLayoutProp) => {
  const {userId} = auth()
    if(!userId){
        redirect("/sign-in")
    }

    const storeSnap = await getDocs(
        query(
            collection(db, "stores"),
            where("userId", "==", userId)
        )
    );

    let store = null as Store | null

    storeSnap.forEach(doc=>{
      store = doc.data() as Store;
      console.log(doc.data())
      return 
    })

    if(store){
      redirect(`/${store?.id}`)
    }

  return (
    <div>
        {children}
    </div>
  )
}

export default Setuplayout