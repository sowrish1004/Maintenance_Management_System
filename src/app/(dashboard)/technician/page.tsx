export const dynamic = 'force-dynamic';


import ActionCard from "@/components/dashboard/ActionCard";
import MyRecentInspections from "@/components/dashboard/technician/MyRecentInspections";
import TechnicianCard from "@/components/dashboard/technician/TechnicianCard";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { startOfDay, endOfDay } from "date-fns";

const TechnicianPage = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  // 1. Fetch personalized stats in parallel
  const today = new Date();
  const [totalInspections, todayInspections] = await Promise.all([
    // Count all time for this user
    prisma.inspection.count({ where: { technicianId: userId } }),
    // Count just for today
    prisma.inspection.count({ 
        where: { 
            technicianId: userId,
            date: { gte: startOfDay(today), lte: endOfDay(today) }
        } 
    }),
  ]);

  return (
    <div className="p-4 flex flex-col gap-8 min-h-[85vh]">
      
      {/* --- TOP SECTION: Stats & Actions --- */}
      {/* We use a responsive grid layout for the cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Total Stats */}
        <TechnicianCard 
            label="My Total Inspections" 
            count={totalInspections} 
            color="bg-yellow-200" 
        />
        
        {/* Card 2: Today's Stats */}
        <TechnicianCard 
            label="Completed Today" 
            count={todayInspections} 
            color="bg-purple-200" 
            date="Today" 
        />
        
        {/* Card 3: The Shortcut Button */}
        <ActionCard /> 
      </div>

      {/* --- MAIN CONTENT: My Recent List --- */}
      {/* This takes up the remaining vertical space */}
      <div className="w-full flex-1">
          <MyRecentInspections className="h-full" />
      </div>

    </div>
  );
};

export default TechnicianPage;