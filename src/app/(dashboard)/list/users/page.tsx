import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import FormModal from "@/components/FormModal";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
};

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Email", accessor: "email", className: "hidden md:table-cell" },
  { header: "Role", accessor: "role", className: "hidden md:table-cell" },
  { header: "Status", accessor: "isActive", className: "hidden md:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const renderRow = (item: UserRecord) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-msPurpleLight"
  >
    <td>{item.name}</td>
    <td className="hidden md:table-cell">{item.email}</td>
    <td className="hidden md:table-cell">{item.role}</td>
    <td className="hidden md:table-cell">
      <span className={`p-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {item.isActive ? "Active" : "Inactive"}
      </span>
    </td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="user" type="update" data={item} />
        <FormModal table="user" type="delete" id={item.id} />
      </div>
    </td>
  </tr>
);

export default async function UserListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, search } = params;
  const pageNumber = Math.max(1, Number(page) || 1);

  const whereClause: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // Fetch users
  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (pageNumber - 1),
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      }
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  // Format the data for the table merge firstname and lastname!
  const formattedData = data.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    firstName: u.firstName,
    lastName: u.lastName,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 h-290px">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Users</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormModal table="user" type="create" />
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={formattedData} />
      <Pagination page={pageNumber} count={count} />
    </div>
  );
}