"use client";
import { Building, DataCategory } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_TEMPLATES } from "@/lib/category-templates";

const StyledSwitch = ({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? "bg-blue-400" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

type BuildingWithCategories = Building & {
  dataCategories: DataCategory[];
};

type DataCategoryManagerProps = {
  building: BuildingWithCategories;
};

export const DataCategoryManager = ({ building }: DataCategoryManagerProps) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle toggling ON/OFF a data category
  const handleToggle = async (
    checked: boolean,
    template: { id: string; name: string; type: "NUMBER" | "ON_OFF" },
    existingCategory: DataCategory | undefined
  ) => {
    setIsUpdating(template.id);
    setError(null);

    try {
      if (checked) {
        // Add category
        const response = await fetch("/api/datacategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: template.name,
            type: template.type,
            buildingId: building.id,
          }),
        });

        if (!response.ok) throw new Error("Failed to add category");
      } else if (existingCategory) {
        // Remove Category
        const response = await fetch(`/api/datacategories/${existingCategory.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to remove category");
      }

      router.refresh(); 
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleBack = () => {
    router.push("/list/buildings");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Manage Data Categories for {building.name}
        </h1>
        <button
          onClick={handleBack}
          className="text-sm bg-msYellow hover:bg-yellow-300 text-gray-700 font-medium py-2 px-4 rounded-md transition"
        >
          ← Back to Buildings
        </button>
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Select which readings are required for this building.
      </span>

      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      <div className="flex flex-col gap-4">
        {CATEGORY_TEMPLATES.map((template) => {
          const existingCategory = building.dataCategories.find(
            (cat) => cat.name === template.name
          );

          const isChecked = !!existingCategory;
          const isLoading = isUpdating === template.id;

          return (
            <div
              key={template.name}
              className="flex items-center justify-between hover:bg-msPurpleLight p-4 ring-[1.5px] ring-gray-300 rounded-md"
            >
              <div className="flex flex-col">
                <label className="font-medium">{template.name}</label>
                <span className="text-xs text-gray-500">{template.type}</span>
              </div>

              <div className="flex items-center gap-2">
                {isLoading && (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                         5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 
                         5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <StyledSwitch
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleToggle(checked, template, existingCategory)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataCategoryManager;
