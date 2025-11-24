"use client";
import { useState } from "react";

function NotesSection({
  inspectionId,
  existingNotes = "",
}: {
  inspectionId: string;
  existingNotes?: string | null;
}) {
  const [notes, setNotes] = useState(existingNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

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

      setMessage("Notes saved successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4 flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Final Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any comments or observations..."
        className="ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm min-h-[80px]"
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-500 text-white rounded-md py-2 px-4 w-max mt-2 disabled:bg-gray-400"
      >
        {isSaving ? "Saving..." : "Save Notes"}
      </button>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  );
}

export default NotesSection;
