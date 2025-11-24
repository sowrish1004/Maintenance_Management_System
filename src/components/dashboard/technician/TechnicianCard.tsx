import Image from "next/image";

type TechnicianCardProps = {
  label: string;
  count: number;
  color: string;
  date?: string; 
};

const TechnicianCard = ({ label, count, color, date }: TechnicianCardProps) => {
  return (
    <div className={`rounded-2xl p-4 flex-1 min-w-[130px] ${color} shadow-sm border border-transparent hover:border-black/5 transition-all`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white/80 px-2 py-1 rounded-full text-gray-600 font-medium">
          {date || "All Time"}
        </span>
        <Image src="/more.png" alt="more" width={20} height={20} className="opacity-50" />
      </div>
      <h1 className="text-2xl font-bold my-4 text-gray-800">{count}</h1>
      <h2 className="text-sm font-medium text-gray-600">{label}</h2>
    </div>
  );
};

export default TechnicianCard;