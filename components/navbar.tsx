import { UserButton } from '@clerk/nextjs'
import React from 'react'
import MainNav from '@/components/main-nav'
import {StoreSwitcher} from '@/components/store-switcher'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Store } from '@/types-db'

const Navbar = async () => {
    const {userId} = auth()

    if(!userId){
        redirect("/sign-in")
    }

    const storeSnap = await getDocs(
        query(collection(db, "stores"), where("userId","==",userId))
    )

    let stores = [] as Store[];

    storeSnap.forEach(doc=>{
        stores.push(doc.data() as Store)
    })

    return (
        <div className='border-b sticky top-0 z-50 bg-white dark:bg-gray-950 shadow-md'>
            <div className="flex h-16 items-center px-4 sm:px-6 xl:px-8 justify-between">
                {/* Left side: Store switcher and navigation */}
                <div className="flex items-center gap-x-4">
                    <StoreSwitcher items={stores} />
                    <MainNav className="ml-0 sm:ml-2" />
                </div>

                {/* Right side: User profile */}
                <div className="flex items-center">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </div>
    )
}

export default Navbar
