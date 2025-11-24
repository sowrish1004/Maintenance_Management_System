import prisma from '@/lib/prisma';
import Table from '@/components/Table';
import { Reading, DataCategory, Inspection, User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { ReportGraph } from '@/components/reports/ReportGraph';
import { startOfDay, endOfDay } from 'date-fns';
import { Download } from 'lucide-react';

const inputClasses = "ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm";

function FilterBar({ buildings, selectedId, startDate, endDate }: { 
    buildings: {id: string, name: string}[], 
    selectedId?: string,
    startDate?: string,
    endDate?: string
}) {
  async function applyFilters(formData: FormData) {
    'use server'
    const buildingId = formData.get('buildingId') as string;
    const start = formData.get('startDate') as string;
    const end = formData.get('endDate') as string;
    
    const params = new URLSearchParams();
    if (buildingId) params.set('buildingId', buildingId);
    if (start) params.set('startDate', start);
    if (end) params.set('endDate', end);
    
    redirect(`/list/reports?${params.toString()}`);
  }

// Export URL
  const exportParams = new URLSearchParams();
  if (selectedId) exportParams.set('buildingId', selectedId);
  if (startDate) exportParams.set('startDate', startDate);
  if (endDate) exportParams.set('endDate', endDate);
  const exportUrl = `/api/reports/export?${exportParams.toString()}`;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap items-end justify-between gap-4">
        {/* Filter form */}
        <form action={applyFilters} className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Building</label>
                <select name="buildingId" defaultValue={selectedId || ''} className={`${inputClasses} w-[200px]`}>
                    <option value="">- All Buildings -</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Start Date</label>
                <input type="date" name="startDate" defaultValue={startDate} className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">End Date</label>
                <input type="date" name="endDate" defaultValue={endDate} className={inputClasses} />
            </div>
            <div className="flex items-center gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Apply Filters
                </button>
                {(selectedId || startDate || endDate) && (
                    <a href="/list/reports" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
                        Reset
                    </a>
                )}
            </div>
        </form>

        {/* Export button */}
        <a 
            href={exportUrl}
            download="Inspection_Report.xlsx" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
            <Download className="h-4 w-4" />
            Export to Excel
        </a>
    </div>
  )
}

type ReadingWithDetails = Reading & {
  category: DataCategory;
  inspection: Inspection & {
    technician: Pick<User, 'firstName' | 'lastName'>;
  };
};

const columns = [
  { header: "Date", accessor: "date" },
  { header: "Category", accessor: "category" },
  { header: "Value", accessor: "value" },
  { header: "Technician", accessor: "technician" },
];

const renderRow = (r: ReadingWithDetails) => (
  <tr key={r.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-50/30 transition-colors">
    <td className="py-3">{new Date(r.inspection.date).toLocaleDateString()}</td>
    <td className="font-medium">{r.category.name}</td>
    <td>
      {r.category.type === 'NUMBER' 
        ? <span className="font-mono text-blue-700">{r.numericalValue}</span>
        : r.booleanValue 
            ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">PASS / ON</span> 
            : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">FAIL / OFF</span>}
    </td>
    <td className="text-gray-600">
      {r.inspection.technician.firstName} {r.inspection.technician.lastName}
    </td>
  </tr>
);

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ buildingId?: string, startDate?: string, endDate?: string }>;
}) {
  const { buildingId, startDate, endDate } = await searchParams;
  
  //Fetch buildings from dropdown
  const buildings = await prisma.building.findMany({ orderBy: { name: 'asc' }});

  let readings: ReadingWithDetails[] = [];
  let categories: DataCategory[] = [];
  
  //Fetch data for selected building
  if (buildingId) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startOfDay(new Date(startDate));
    if (endDate) dateFilter.lte = endOfDay(new Date(endDate));

    //Fetch readings for table
    readings = await prisma.reading.findMany({
      where: {
        inspection: {
          buildingId: buildingId,
          ...(startDate || endDate ? { date: dateFilter } : {}),
        }
      },
      include: {
        category: true,
        inspection: {
          include: {
            technician: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { inspection: { date: 'desc' } }
    });
    
    //Graph numerical data categories
    categories = await prisma.dataCategory.findMany({
      where: { buildingId: buildingId },
      orderBy: { name: 'asc' }
    });
  }

  return (
    <div className="bg-white p-6 rounded-xl m-4 flex-1 shadow-sm space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
      </div>
      
      <FilterBar 
        buildings={buildings} 
        selectedId={buildingId} 
        startDate={startDate}
        endDate={endDate}
      />

      {buildingId ? (
        <div className="space-y-8 mt-6">
            {/* The Graph Component handles its own data fetching for simplicity, 
                but we pass it the filters so it matches the table. */}
            <ReportGraph 
                buildingId={buildingId} 
                categories={categories}
                startDate={startDate}
                endDate={endDate}
            />

            <div>
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Detailed Log Table</h2>
                {readings.length > 0 ? (
                   <Table columns={columns} renderRow={renderRow} data={readings} />
                ) : (
                   <div className="text-center py-12 border-2 border-dashed rounded-lg text-gray-500 bg-gray-50">
                       No inspection data found for these criteria.
                   </div>
                )}
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-lg font-medium mt-4">Select a building to generate reports</p>
            <p className="text-sm text-gray-400">Use the filters above. You can also export all data to Excel.</p>
        </div>
      )}
    </div>
  );
}