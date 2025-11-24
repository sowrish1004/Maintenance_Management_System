"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";

const UserForm = dynamic(() => import("@/components/forms/userForm"), {
  loading: () => <p>Loading form...</p>,
});
const BuildingForm = dynamic(() => import("@/components/forms/buildingForm"), {
  loading: () => <p>Loading form...</p>,
});
const InspectionForm = dynamic(() => import("@/components/forms/inspectionForm"), {
  loading: () => <p>Loading inspection form...</p>,
});

type ModalBase = {
  data?: any;
  id?: number | string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type InspectionModalProps = ModalBase & {
  table: "inspection";
  type: "create" | "update" | "delete";
};

type OtherModalProps = ModalBase & {
  table: "user" | "building" | "dataCategory" | "reading";
  type: "create" | "update" | "delete";
};

type ModalContentProps = InspectionModalProps | OtherModalProps;

type FormModalProps =
  | { table: "inspection"; type: "create" | "update" | "delete"; data?: any; id?: number | string }
  | { table: "user" | "building" | "dataCategory" | "reading"; type: "create" | "update" | "delete"; data?: any; id?: number | string };

const ModalContent = ({ table, type, data, id, setOpen }: ModalContentProps) => {
  const router = useRouter();

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch buildings for inspection
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (table === "inspection" && (type === "create" || type === "update")) {
      setIsLoading(true);
      setFetchError(null);

      const fetchBuildings = async () => {
        try {
          const res = await fetch("/api/buildings");
          if (!res.ok) throw new Error(`Failed to load buildings: ${res.statusText}`);
          const data = await res.json();
          setBuildings(data);
        } catch (err) {
          setFetchError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBuildings();
    }
  }, [table, type]);

// Delete 
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const apiTableMap = {
      user: "users",
      building: "buildings",
      inspection: "inspections",
      dataCategory: "datacategories",
      reading: "readings",
    };

    const apiTable = apiTableMap[table];
    if (!apiTable) {
      setDeleteError("Invalid table type");
      setIsDeleting(false);
      return;
    }

    try {
      const response = await fetch(`/api/${apiTable}/${id}`, { method: "DELETE" });

      let responseData;
      try {
          responseData = await response.text();
          responseData = responseData ? JSON.parse(responseData) : null;
      } catch (e) {
          responseData = null; 
      }

      if (!response.ok) {
        throw new Error(responseData?.message || `Failed to delete ${table} (${response.status})`);
      }

      toast.success(`${table.charAt(0).toUpperCase() + table.slice(1)} has been deleted!`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setDeleteError((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (type === "delete") {
    return (
      <div className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          Are you sure you want to delete this {table}? All related data will be lost.
        </span>
        {deleteError && <p className="text-sm text-red-500 text-center">{deleteError}</p>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-700 text-white py-2 px-4 rounded-md w-max self-center disabled:bg-gray-400 flex items-center gap-2"
        >
          {isDeleting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    );
  }

// Forms
  const onFormSuccess = () => setOpen(false);

  if (table === "user") {
    return <UserForm type={type} data={data} onFormSubmit={onFormSuccess} />;
  }

  if (table === "building") {
    return <BuildingForm type={type} data={data} onFormSubmit={onFormSuccess} />;
  }

  if (table === "inspection") {
    if (isLoading) return <p>Loading inspection data...</p>;
    if (fetchError) return <p className="text-red-500">{fetchError}</p>;
    if (buildings.length > 0) {
      return (
        <InspectionForm
          buildings={buildings}
          onFormSubmit={onFormSuccess}
        />
      );
    }
    return <p>No buildings available for inspection.</p>;
  }

  return <p>Form not found!</p>;
};

const FormModal = ({ table, type, data, id }: FormModalProps) => {
  const [open, setOpen] = useState(false);

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";

  const bgColor =
    type === "create"
      ? "bg-yellow-400"
      : type === "update"
      ? "bg-blue-400"
      : "bg-purple-400";

  const icon =
    type === "create"
      ? "create"
      : type === "update"
      ? "update"
      : "delete";

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        title={`${type} ${table}`}
      >
        <Image src={`/${icon}.png`} alt={type} width={16} height={16} />
      </button>

      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>

            <ModalContent
              table={table}
              type={type as any}
              data={data}
              id={id}
              setOpen={setOpen}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;