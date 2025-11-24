import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { currentUserId, role } from "@/lib/utils";
import Link from "next/link";
import { Eye } from "lucide-react";

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

const renderRow = (item: InspectionRecord) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-msPurpleLight"
  >
    <td>{item.date}</td>
    <td className="hidden md:table-cell">{item.buildingName}</td>
    <td className="hidden md:table-cell">{item.technicianName}</td>
    <td>
      <div className="flex items-center gap-2">
        {/*View Button*/}
        <Link
          href={`/inspections/${item.id}/view`}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>

      
        
        {/* Delete button 'restricted to admins' */}
        {role === "administrator" && (
          <FormModal table="inspection" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

export default async function InspectionListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, search } = params;
  const pageNumber = Math.max(1, Number(page) || 1);

  const whereClause: Prisma.InspectionWhereInput = {
    ...(role === "TECHNICIAN" ? { technicianId: currentUserId! } : {}),
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

  // Fetch inspections
  const [data, count] = await prisma.$transaction([
    prisma.inspection.findMany({
      where: whereClause,
      include: { building: true, technician: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (pageNumber - 1),
      orderBy: { date: "desc" },
    }),
    prisma.inspection.count({ where: whereClause }),
  ]);

  const formattedData = data.map((i) => ({
    id: i.id,
    date: i.date.toISOString().split("T")[0],
    buildingName: i.building?.name || "N/A",
    technicianName: `${i.technician?.firstName || ""} ${i.technician?.lastName || ""}`.trim(),
  }));

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

      <Table columns={columns} renderRow={renderRow} data={formattedData} />
      <Pagination page={pageNumber} count={count} />
    </div>
  );
}

function isValidDate(d: string) {
    return !isNaN(Date.parse(d));
}