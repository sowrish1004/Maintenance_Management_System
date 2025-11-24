export const dynamic = 'force-dynamic';

import UserCard from "@/components/UserCard";
import ActionCard from "@/components/dashboard/ActionCard";
import RecentInspectionsList from "@/components/dashboard/RecentInspectionsList";
import WeeklyInspectionsContainer from "@/components/dashboard/WeeklyInspectionsContainer";
import prisma from "@/lib/prisma";

const AdminPage = async () => {

  return (
    // Main Container
    <div className="p-4 flex gap-4 flex-col md:flex-row items-stretch h-full">
      
      {/*Left Column*/}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {/*UserCards*/}
        <div className="flex gap-4 justify-between flex-wrap">
          {/* Pass real counts and preferred colors */}
          <UserCard type="user"/>
          <UserCard type="building"/>
          <UserCard type="inspection"/>
          {/* The new shortcut card */}
          <ActionCard /> 
        </div>

        {/* MIDDLE ROW: Chart */}
        <div className="w-full flex-1 min-h-[300px]">
           <WeeklyInspectionsContainer/>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <RecentInspectionsList />
      </div>

    </div>
  );
};

export default AdminPage;