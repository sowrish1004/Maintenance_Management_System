"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInspectionSchema } from "@/lib/formValidationSchemas";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import InputField from "@/components/forms/InputField";
import TextareaField from "@/components/forms/TextareaField";
import { Loader2 } from "lucide-react";

type Building = { id: string; name: string };
type Category = { id: string; name: string; type: "NUMBER" | "ON_OFF" };

const dynamicSchema = createInspectionSchema.passthrough();
type FormSchema = z.infer<typeof dynamicSchema>;

const InspectionForm = ({
  buildings,
  onFormSubmit,
}: {
  buildings: Building[];
  onFormSubmit?: () => void;
}) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const technicianDisplayName = isLoaded && user
    ? (user.fullName || user.primaryEmailAddress?.emailAddress || "Current User")
    : "Loading...";

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      technicianId: "",
      buildingId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      setValue("technicianId", user.id);
    }
  }, [isLoaded, user, setValue]);

  const selectedBuildingId = useWatch({ control, name: "buildingId" });

  useEffect(() => {
    if (!selectedBuildingId) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`/api/buildings/${selectedBuildingId}`);
        if (!res.ok) throw new Error("Failed to load categories");
        const buildingData = await res.json();
        setCategories(buildingData.dataCategories || []);
      } catch (err) {
        console.error(err);
        toast.error("Could not load building categories.");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedBuildingId]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!user) {
       toast.error("You must be logged in to submit.");
       return;
    }
    setIsSubmitting(true);
    try {
      const readingsToSubmit = categories.map((cat) => {
        const rawValue = (formData as any)[`reading_${cat.id}`];
        if (rawValue === undefined || rawValue === "" || rawValue === null) return null;

        return {
          categoryId: cat.id,
          numericalValue: cat.type === 'NUMBER' ? Number(rawValue) : null,
          booleanValue: cat.type === 'ON_OFF' ? (rawValue === 'true') : null,
        };
      }).filter(Boolean);

      const payload = {
        date: formData.date,
        technicianId: user.id,
        buildingId: formData.buildingId,
        notes: formData.notes,
        readings: readingsToSubmit,
      };

      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit inspection");
      }

      toast.success("Inspection created successfully!");

      setTimeout(() => {
         if (onFormSubmit) {
             console.log("Closing modal...");
             onFormSubmit();
         }

         router.refresh();
      }, 100);

    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error(error.message);
      setIsSubmitting(false); 
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">New Inspection Round</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors.date as any}
          className="w-full"
        />
        
        <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Technician</label>
            <div className="ring-[1.5px] ring-gray-300 bg-gray-100 p-2 rounded-md text-sm text-gray-600 cursor-not-allowed truncate flex items-center">
                {technicianDisplayName}
            </div>
            <input type="hidden" {...register("technicianId")} />
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
           <label className="text-xs text-gray-500">Building</label>
           <select
            {...register("buildingId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
           >
            <option value="">-- Select a Building --</option>
            {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
            ))}
           </select>
           {errors.buildingId && (
             <p className="text-xs text-red-400">{errors.buildingId.message?.toString()}</p>
           )}
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-slate-50 min-h-[100px]">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Readings</h3>
        
        {loadingCategories && (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Loader2 className="animate-spin mr-2 h-5 w-5" /> Loading categories...
          </div>
        )}
        
        {!selectedBuildingId && !loadingCategories && (
            <div className="text-center py-6 text-gray-400 text-sm">
                Select a building above to see required readings.
            </div>
        )}

        {selectedBuildingId && !loadingCategories && categories.length === 0 && (
             <div className="text-center py-6 text-yellow-600 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                 No data categories configured for this building.
                 <br/>
                 <span className="text-xs">(Go to Buildings page and click &quot;Manage&quot; to add some!)</span>
             </div>
        )}

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm">
              <label className="text-sm font-medium text-gray-800 flex-1 mr-4">
                {cat.name}
              </label>
              
              {cat.type === "NUMBER" ? (
                <input
                  type="number"
                  step="any"
                  placeholder="Value"
                  {...register(`reading_${cat.id}`)}
                  className="w-32 p-2 text-sm border rounded-md ring-[1.5px] ring-gray-200 focus:ring-blue-400 outline-none transition-all"
                />
              ) : (
                <select
                  {...register(`reading_${cat.id}`)}
                   className="w-32 p-2 text-sm border rounded-md ring-[1.5px] ring-gray-200 focus:ring-blue-400 outline-none transition-all"
                >
                  <option value="">- Select -</option>
                  <option value="true">PASS / ON</option>
                  <option value="false">FAIL / OFF</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <TextareaField
        label="General Notes"
        name="notes"
        register={register}
        error={errors.notes as any}
        placeholder="Any overall observations..."
        className="w-full"
      />

      <button
        type="submit"
        disabled={isSubmitting || !user}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full"
      >
        {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
        {isSubmitting ? "Submitting..." : "Submit Inspection Record"}
      </button>
    </form>
  );
};

export default InspectionForm;
