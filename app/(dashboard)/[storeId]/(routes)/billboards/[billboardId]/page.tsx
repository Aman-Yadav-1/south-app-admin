import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Billboards } from "@/types-db";
import { BillboardForm } from "./_components/billboard-form";

type Props = {
  params: {
      billboardId: string;
      storeId: string;
  }
}

const BillboardPage = async ({ params }: Props): Promise<JSX.Element> => {
  const billboardDoc = await getDoc(doc(db, "stores", params.storeId, "billboards", params.billboardId));
  const billboard = billboardDoc.data() as Billboards;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-5">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;
