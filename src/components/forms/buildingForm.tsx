"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { buildingSchema } from "@/lib/formValidationSchemas";
import InputField from "./InputField";
import SelectField from "./SelectField";

type Inputs = z.infer<typeof buildingSchema>;

const BuildingForm = ({
  type,
  data,
  onFormSubmit, 
}: {
  type: "create" | "update";
  data?: any;
  onFormSubmit?: () => void;
}) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(buildingSchema),
    defaultValues: data ? {
      id: data.id,
      name: data.name,
      isActive: data.isActive ? "yes" : "no",
    } : {
      name: '',
      isActive: "yes",
    }
  });

  const onSubmit = handleSubmit(async (formData) => {
    setFormError(null);
    
    try {
      const method = type === 'create' ? 'POST' : 'PATCH';
      const url = type === 'create' ? '/api/buildings' : `/api/buildings/${data.id}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      toast.success(type === "create" ? "Building created!" : "Building updated!");
      
      router.refresh();
      if (onFormSubmit) onFormSubmit();

    } catch (error: any) {
      console.error("Failed to submit form:", error);
      setFormError(error.message);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl semi-bold">
        {type === "create" ? "Create a new Building" : "Update Building"}
      </h1>
      
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Building Name"
          name="name"
          register={register}
          error={errors.name}
          className="w-full md:w-[48%]"
        />

        <SelectField
            label="Status"
            name="isActive"
            register={register}
            error={errors.isActive}
            className="w-full md:w-[48%]"
        >
            <option value="yes">Active</option>
            <option value="no">Inactive</option>
        </SelectField>
      </div>

      {formError && (
        <p className="text-sm text-red-500">{formError}</p>
      )}

      <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default BuildingForm;