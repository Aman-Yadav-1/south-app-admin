import Image from "next/image";

interface CellImageProps {
  data: string[];
}

const CellImage: React.FC<CellImageProps> = ({ data }) => {
  if (!data?.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2">
      {data.map((url, index) => (
        <div key={index} className="relative w-12 h-12">
          <Image
            src={url}
            fill
            alt="Product Image"
            className="object-cover rounded-md"
          />
        </div>
      ))}
    </div>
  );
};

export default CellImage;
