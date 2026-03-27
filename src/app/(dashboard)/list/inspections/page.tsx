export const dynamic = 'force-dynamic';

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import FormModal from "@/components/FormModal";
import InspectionActions from "@/components/InspectionActions";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/userSync";

type InspectionRecord = {
  id: string;
  date: string;
  buildingName: string;
  technicianName: string;
};

const columns = [
  { header: "Date", accessor: "date" },
  { header: "Building", accessor: "buildingName", className: "hidden md:table-cell" },
  { header: "Technician", accessor: "technicianName", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const renderRow = (item: InspectionRecord, role?: string) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-msPurpleLight"
  >
    <td>{item.date}</td>
    <td className="hidden md:table-cell">{item.buildingName}</td>
    <td className="hidden md:table-cell">{item.technicianName}</td>
    <td>
      <InspectionActions id={item.id} role={role} />
    </td>
  </tr>
);

export default async function InspectionListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  await ensureUser();

  const params = await searchParams;
  const { page, search } = params;
  const pageNumber = Math.max(1, Number(page) || 1);

  const whereClause: Prisma.InspectionWhereInput = {
    ...(role === "technician" ? { technicianId: (await auth()).userId! } : {}),

    ...(search
      ? {
          OR: [
            { building: { name: { contains: search, mode: "insensitive" } } },
            { technician: { firstName: { contains: search, mode: "insensitive" } } },
            { technician: { lastName: { contains: search, mode: "insensitive" } } },
            ...(isValidDate(search) ? [{ date: new Date(search) }] : []),
          ],
        }
      : {}),
  };

  let formattedData: InspectionRecord[] = [];
  let count = 0;
  let queryError: string | null = null;

  try {
    const [data, totalCount] = await prisma.$transaction([
      prisma.inspection.findMany({
        where: whereClause,
        include: { building: true, technician: true },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (pageNumber - 1),
        orderBy: { date: "desc" },
      }),
      prisma.inspection.count({ where: whereClause }),
    ]);

    count = totalCount;
    formattedData = data.map((i) => ({
      id: i.id,
      date: i.date.toLocaleDateString("en-CA"),
      buildingName: i.building?.name || "N/A",
      technicianName: `${i.technician?.firstName || ""} ${i.technician?.lastName || ""}`.trim(),
    }));
  } catch (err) {
    console.error("Failed to fetch inspections:", err);
    queryError = "Unable to load inspections. Please try again later.";
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 h-290px">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Inspections</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="inspection" type="create" />
          </div>
        </div>
      </div>

      {queryError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm my-2">
          {queryError}
        </div>
      )}

      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, role)}
        data={formattedData}
      />
      <Pagination page={pageNumber} count={count} />
    </div>
  );
}

function isValidDate(d: string) {
    return !isNaN(Date.parse(d));
}
