import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from 'next/cache';

const MyRecentInspections = async ({ className }: { className?: string }) => {
  noStore();
  const { userId } = await auth();

  if (!userId) return null;

  // Fetch last 5 inspections only for this technician
  const recents = await prisma.inspection.findMany({
    where: { technicianId: userId },
    take: 5,
    orderBy: { date: 'desc' },
    include: {
      building: { select: { name: true } },
    }
  });

  return (
    <div className={`bg-white p-4 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">My Recent Inspections</h1>
        <Link 
          href="/list/inspections" 
          className="text-xs font-medium text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors"
        >
          View History
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {recents.map(i => (
            <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 hover:border-blue-100 transition-colors">
               <div>
                   <h2 className="font-semibold text-sm text-gray-900">{i.building.name}</h2>
                   <p className="text-xs text-gray-500 mt-1">
                     Logged by you
                   </p>
               </div>
               <div className="text-right">
                   <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                     {new Date(i.date).toLocaleDateString()}
                   </span>
               </div>
            </div>
        ))}
        {recents.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2 border-2 border-dashed rounded-lg">
             <p>You haven't submitted any inspections yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecentInspections;