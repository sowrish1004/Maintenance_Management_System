import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Building as BuildingIcon, FileText } from 'lucide-react';

export default async function ViewInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch inspection with inspectionId
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      technician: true,
      building: {
        include: {
          dataCategories: { orderBy: { name: 'asc' } }
        }
      },
      readings: true,
    },
  });

  if (!inspection) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/*Header & Navigation*/}
      <div className="flex items-center justify-between">
        <Link
          href="/list/inspections"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Inspection Record</h1>
      </div>

      {/*Inspections Icon*/}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Building</p>
                <p className="font-semibold text-gray-900">{inspection.building.name}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Date</p>
                <p className="font-semibold text-gray-900">{new Date(inspection.date).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Technician</p>
                <p className="font-semibold text-gray-900">{inspection.technician.firstName} {inspection.technician.lastName}</p>
            </div>
        </div>
        {inspection.notes && (
            <div className="md:col-span-3 flex gap-3 mt-2 pt-4 border-t border-gray-100">
                <div className="p-2 bg-gray-50 rounded-lg h-fit">
                    <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Notes</p>
                    <p className="text-gray-700 italic mt-1">{inspection.notes}</p>
                </div>
            </div>
        )}
      </div>

      {/*Readings Table*/}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Readings Log</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider font-medium">
                    <tr>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Logged Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {inspection.building.dataCategories.length === 0 ? (
                         <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                No data categories configured for this building.
                            </td>
                        </tr>
                    ) : (
                        inspection.building.dataCategories.map((category) => {
                            const reading = inspection.readings.find(r => r.categoryId === category.id);
                            
                            // Determine display value
                            let displayValue = <span className="text-gray-400 italic">Not logged</span>;
                            if (reading) {
                                if (category.type === 'NUMBER' && reading.numericalValue !== null) {
                                    displayValue = <span className="font-mono font-medium text-blue-700">{reading.numericalValue}</span>;
                                } else if (category.type === 'ON_OFF' && reading.booleanValue !== null) {
                                    displayValue = reading.booleanValue ? 
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">PASS / ON</span> : 
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">FAIL / OFF</span>;
                                }
                            }

                            return (
                                <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                    <td className="px-6 py-4">{displayValue}</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}