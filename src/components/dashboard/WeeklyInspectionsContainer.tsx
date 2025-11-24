import prisma from "@/lib/prisma";
import WeeklyInspectionsChart from "./WeeklyInspectionsChart";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWeekend, isSameDay } from 'date-fns';
import { unstable_noStore as noStore } from 'next/cache';

const WeeklyInspectionsContainer = async () => {
  noStore();

  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });

  const inspections = await prisma.inspection.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    select: {
      date: true,
    },
  });

  const allDays = eachDayOfInterval({ start, end });
  const workDays = allDays.filter((day) => !isWeekend(day));

  const chartData = workDays.map((day) => {
    const count = inspections.filter((inspection) => 
        isSameDay(new Date(inspection.date), day)
    ).length;

    return {
      name: format(day, 'EEE'), 
      count: count,             
    };
  });

  return <WeeklyInspectionsChart data={chartData} className="h-full" />;
};

export default WeeklyInspectionsContainer;