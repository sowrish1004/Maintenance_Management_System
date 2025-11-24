"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Building, DataCategory, Inspection, Reading } from "@prisma/client";
import InspectionReadingRow from "./InspectionReadingRow";

type InspectionWithDetails = Inspection & {
  building: Building & {
    dataCategories: DataCategory[];
  };
  readings: Reading[];
};

type InspectionTakingFormProps = {
  inspection: InspectionWithDetails;
};

const InspectionTakingForm = ({ inspection }: InspectionTakingFormProps) => {
  const { building, readings } = inspection;
  const requiredCategories = building.dataCategories || [];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Conducting Inspection</h1>


      <div className="flex flex-col gap-2 p-4 ring-[1.5px] ring-gray-300 rounded-md">
        <h2 className="text-lg font-semibold">{building.name}</h2>
        <p className="text-sm text-gray-500">
          Date: {new Date(inspection.date).toLocaleDateString()}
        </p>
      </div>

      <span className="text-xs text-gray-400 font-medium">Log Readings</span>

      <div className="flex flex-col gap-4">
        {requiredCategories.length === 0 && (
          <p className="text-gray-500">
            No data categories are set up for this building.
          </p>
        )}

        {requiredCategories.map((category) => {
          const existingReading = readings.find(
            (r) => r.categoryId === category.id
          );

          return (
            <InspectionReadingRow
              key={category.id}
              inspectionId={inspection.id}
              category={category}
              reading={existingReading}
            />
          );
        })}

        <NotesSection
          inspectionId={inspection.id}
          existingNotes={inspection.notes}
        />
      </div>
    </div>
  );
};

export default InspectionTakingForm;

function NotesSection({
  inspectionId,
  existingNotes = "",
}: {
  inspectionId: string;
  existingNotes?: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(existingNotes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/inspections/${inspectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save notes");
      }

      toast.success("Notes saved successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4 flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Final Notes</label>
      <textarea
        disabled={isSaving}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any final comments or observations..."
        className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm min-h-[80px] disabled:bg-gray-100"
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-500 text-white rounded-md py-2 px-4 w-max mt-2 disabled:bg-gray-400"
      >
        {isSaving ? "Saving..." : "Save Notes"}
      </button>
    </div>
  );
}
