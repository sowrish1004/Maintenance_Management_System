import FormModal from "@/components/FormModal";

const ActionCard = () => {
  return (
    <div className="rounded-2xl bg-white border-2 border-dashed border-gray-300 p-4 flex-1 min-w-[130px] flex flex-col items-center justify-center gap-3 hover:border-msYellow transition-colors">
      <h2 className="text-sm font-semibold text-gray-500">Quick Shortcut</h2>
      <div className="scale-125"> 
        <FormModal table="inspection" type="create" />
      </div>
      <p className="text-xs font-medium text-gray-600">New Inspection Round</p>
    </div>
  );
};

export default ActionCard;