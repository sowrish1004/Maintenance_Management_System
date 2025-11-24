import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import { DataCategoryManager } from "@/components/forms/DataCategoryManager";

export default async function EditBuildingPage({
  params,
}: {
  
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      dataCategories: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!building) return notFound();

  return (
    <div className="bg-white p-4 rounded-md m-4 space-y-4">

      <DataCategoryManager building={building} />
    </div>
  );
}