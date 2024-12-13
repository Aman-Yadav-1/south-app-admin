import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { BillboardForm } from "./_components/billboard-form";

const BillboardPage = async({ 
  params 
}: { 
  params: { storeId: string; billboardId: string } 
}) => {
  const billboard = (await getDoc(doc(db, "stores", params.storeId, "billboards", params.billboardId))).data() as Billboards;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-5">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
}
export default BillboardPage;