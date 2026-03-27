"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import FormModal from "@/components/FormModal";

const InspectionActions = ({ id, role }: { id: string; role?: string }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <Link
          href={`/inspections/${id}/view`}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors block"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>

      {role === "administrator" && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <FormModal table="inspection" type="delete" id={id} />
        </div>
      )}
    </div>
  );
};

export default InspectionActions;
