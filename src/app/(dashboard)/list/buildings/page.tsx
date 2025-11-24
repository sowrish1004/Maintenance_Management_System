import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { role } from "@/lib/utils"; 
import Link from "next/link"; 

type BuildingRecord = {
  id: string;
  name: string;
  isActive: boolean;
  dataCategoriesCount: number;
};

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Status", accessor: "isActive", className: "hidden md:table-cell" },
  { header: "Categories", accessor: "dataCategoriesCount", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const renderRow = (item: BuildingRecord) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-msPurpleLight"
  >
    <td>{item.name}</td>
    <td className="hidden md:table-cell">
      <span className={`p-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {item.isActive ? "Active" : "Inactive"}
      </span>
    </td>
    <td className="hidden md:table-cell">{item.dataCategoriesCount}</td>
    <td>
      <div className="flex items-center gap-2">
        <Link
          href={`/edit/buildings/${item.id}`}
          className="text-blue-500 hover:text-blue-700 p-2"
          title="Manage Categories"
        >
          Manage
        </Link>

        <FormModal table="building" type="update" data={item} />
        {role === "administrator" && (
          <FormModal table="building" type="delete" id={item.id} />
        )}
      </div>
    </td>
  </tr>
);

export default async function BuildingListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, search } = params;
  const pageNumber = Math.max(1, Number(page) || 1);

  const whereClause: Prisma.BuildingWhereInput = {
    ...(search
      ? { name: { contains: search, mode: "insensitive" } }
      : {}),
  };

  const [data, count] = await prisma.$transaction([
    prisma.building.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { dataCategories: true }, 
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (pageNumber - 1),
      orderBy: { name: "asc" },
    }),
    prisma.building.count({ where: whereClause }),
  ]);

  const formattedData = data.map((b) => ({
    id: b.id,
    name: b.name,
    isActive: b.isActive,
    dataCategoriesCount: b._count.dataCategories,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 h-290px">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Buildings</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="building" type="create" />
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={formattedData} />
      <Pagination page={pageNumber} count={count} />
    </div>
  );
}