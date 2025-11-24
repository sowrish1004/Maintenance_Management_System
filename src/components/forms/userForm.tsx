"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { userSchema } from "@/lib/formValidationSchemas";
import InputField from "./InputField";
import SelectField from "./SelectField";
import { toast } from "react-toastify";

type Inputs = z.infer<typeof userSchema>;

const UserForm = ({
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(userSchema),
    defaultValues: data ? {
      ...data,
      password: '', 
      isActive: data.isActive ? 'yes' : 'no', 
      role: data.role, 
    } : {
      isActive: 'yes', 
    }
  });

  const onSubmit = handleSubmit(async (formData) => {
    setFormError(null);
    setIsSubmitting(true);
    
    const dataToSubmit = { ...formData };
    if (type === 'update' && !formData.password) {
      delete (dataToSubmit as any).password;
    }

    try {
      const method = type === 'create' ? 'POST' : 'PATCH';
      const url = type === 'create' ? '/api/users' : `/api/users/${data.id}`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      router.refresh();
      if (onFormSubmit) onFormSubmit();

    } catch (error) {
      console.error("Failed to submit form:", error);
      setFormError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl semi-bold">
        {type === "create" ? "Create a new User" : "Update User"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          register={register}
          error={errors.firstName}
          className="w-full md:w-[48%]"
        />
        <InputField
          label="Last Name"
          name="lastName"
          register={register}
          error={errors.lastName}
          className="w-full md:w-[48%]"
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email}
          className="w-full md:w-[48%]"
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          className="w-full md:w-[48%]"
          inputProps={{ placeholder: type === 'update' ? '' : '' }}
        />
        <SelectField
          label="Role"
          name="role"
          register={register}
          error={errors.role}
          className="w-full md:w-[48%]"
        >
          <option value="">Select a role</option>
          <option value="TECHNICIAN">Technician</option>
          <option value="ADMINISTRATOR">Administrator</option>
        </SelectField>
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

      <button 
        disabled={isSubmitting}
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : type === "create" ? "Create User" : "Update User"}
      </button>
    </form>
  );
};

export default UserForm;